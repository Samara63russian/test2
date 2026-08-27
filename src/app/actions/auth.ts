"use server";

import { timingSafeEqual } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { clearSession, setSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

export interface AuthActionState {
  success: boolean;
  error?: string;
}

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Введите корректный адрес электронной почты")
  .max(254);

const passwordSchema = z
  .string()
  .min(10, "Пароль должен содержать не менее 10 символов")
  .max(72, "Пароль слишком длинный")
  .regex(/[A-Za-zА-Яа-яЁё]/, "Добавьте буквы")
  .regex(/\d/, "Добавьте хотя бы одну цифру");

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

function matchesSetupToken(value: string) {
  const expected = process.env.SETUP_TOKEN;
  if (!expected || !value) return false;
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = z
    .object({
      email: emailSchema,
      password: z.string().min(1, "Введите пароль").max(72),
    })
    .safeParse({
      email: getString(formData, "email"),
      password: getString(formData, "password"),
    });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Проверьте введённые данные",
    };
  }

  const db = getDb();
  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      organizationId: true,
      role: true,
      passwordHash: true,
      sessionVersion: true,
      failedLoginCount: true,
      lockedUntil: true,
    },
  });

  const genericError = "Неверная электронная почта или пароль";
  if (!user) {
    await hash(parsed.data.password, 12);
    return { success: false, error: genericError };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      success: false,
      error: "Вход временно заблокирован. Повторите попытку через 15 минут.",
    };
  }

  const valid = await compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    const failedLoginCount = user.failedLoginCount + 1;
    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount,
        lockedUntil:
          failedLoginCount >= 5
            ? new Date(Date.now() + 15 * 60 * 1000)
            : null,
      },
    });
    return { success: false, error: genericError };
  }

  await db.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });
  await setSession({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    sessionVersion: user.sessionVersion,
  });
  return { success: true };
}

export async function registerOwnerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = z
    .object({
      setupToken: z.string().min(1, "Введите код первичной настройки"),
      organizationName: z
        .string()
        .trim()
        .min(2, "Введите название организации")
        .max(120),
      name: z.string().trim().min(2, "Введите ваше имя").max(120),
      email: emailSchema,
      password: passwordSchema,
      passwordConfirm: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      path: ["passwordConfirm"],
      message: "Пароли не совпадают",
    })
    .safeParse({
      setupToken: getString(formData, "setupToken"),
      organizationName: getString(formData, "organizationName"),
      name: getString(formData, "name"),
      email: getString(formData, "email"),
      password: getString(formData, "password"),
      passwordConfirm: getString(formData, "passwordConfirm"),
    });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Проверьте введённые данные",
    };
  }
  if (!matchesSetupToken(parsed.data.setupToken)) {
    return { success: false, error: "Неверный код первичной настройки" };
  }

  const db = getDb();
  const passwordHash = await hash(parsed.data.password, 12);
  try {
    const user = await db.$transaction(
      async (tx) => {
        if ((await tx.organization.count()) > 0) {
          throw new Error("SETUP_COMPLETED");
        }
        const organization = await tx.organization.create({
          data: {
            name: parsed.data.organizationName,
            slug: `workspace-${crypto.randomUUID().slice(0, 12)}`,
          },
        });
        return tx.user.create({
          data: {
            name: parsed.data.name,
            email: parsed.data.email,
            passwordHash,
            position: "Владелец организации",
            role: "OWNER",
            organizationId: organization.id,
          },
          select: {
            id: true,
            organizationId: true,
            role: true,
            sessionVersion: true,
          },
        });
      },
      { isolationLevel: "Serializable" },
    );
    await setSession({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      sessionVersion: user.sessionVersion,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "SETUP_COMPLETED") {
      return {
        success: false,
        error: "Первичная настройка уже завершена. Используйте форму входа.",
      };
    }
    return {
      success: false,
      error: "Не удалось создать рабочее пространство. Попробуйте снова.",
    };
  }
}

export async function logoutAction() {
  await clearSession();
}

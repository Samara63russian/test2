"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActor, requireRole } from "@/lib/auth";
import { getDb } from "@/lib/db";

const memberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  position: z.string().trim().max(120).optional(),
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]),
  temporaryPassword: z
    .string()
    .min(10)
    .max(72)
    .regex(/[A-Za-zА-Яа-яЁё]/)
    .regex(/\d/),
});

export async function inviteMember(input: unknown) {
  const actor = await requireActor();
  requireRole(actor, ["OWNER", "ADMIN"]);
  const parsed = memberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error:
        "Проверьте поля. Временный пароль должен содержать не менее 10 символов, буквы и цифры.",
    };
  }

  const db = getDb();
  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) {
    return {
      success: false as const,
      error: "Пользователь с такой электронной почтой уже существует.",
    };
  }

  const passwordHash = await hash(parsed.data.temporaryPassword, 12);
  const member = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      position: parsed.data.position || "Сотрудник",
      role: parsed.data.role,
      organizationId: actor.organizationId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      position: true,
      role: true,
    },
  });

  await db.activityLog.create({
    data: {
      organizationId: actor.organizationId,
      userId: actor.userId,
      entityType: "User",
      entityId: member.id,
      action: "MEMBER_INVITED",
      metadata: { name: member.name, role: member.role },
    },
  });
  revalidatePath("/");
  return { success: true as const, member };
}

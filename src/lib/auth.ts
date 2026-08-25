import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type AppRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER";

export interface AuthenticatedActor {
  userId: string;
  organizationId: string;
  role: AppRole;
}

interface SessionPayload extends AuthenticatedActor {
  expiresAt: number;
}

const COOKIE_NAME = "sever_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET должен содержать не менее 32 символов");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createSessionToken(actor: AuthenticatedActor) {
  const payload: SessionPayload = {
    ...actor,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${value}.${sign(value)}`;
}

export async function requireActor(): Promise<AuthenticatedActor> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) throw new Error("Необходима авторизация");

  const [value, signature] = token.split(".");
  if (!value || !signature) throw new Error("Сессия недействительна");

  const expected = sign(value);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new Error("Сессия недействительна");
  }

  const payload = JSON.parse(
    Buffer.from(value, "base64url").toString("utf8"),
  ) as SessionPayload;
  if (payload.expiresAt < Date.now()) throw new Error("Сессия истекла");

  return {
    userId: payload.userId,
    organizationId: payload.organizationId,
    role: payload.role,
  };
}

export function requireRole(
  actor: AuthenticatedActor,
  allowed: AppRole[],
) {
  if (!allowed.includes(actor.role)) {
    throw new Error("Недостаточно прав для выполнения действия");
  }
}

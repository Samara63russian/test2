import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";

export type AppRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER";

export interface AuthenticatedActor {
  userId: string;
  organizationId: string;
  role: AppRole;
}

interface SessionPayload extends AuthenticatedActor {
  sessionVersion: number;
  expiresAt: number;
}

const COOKIE_NAME = "sever_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

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

function createSessionToken(
  actor: AuthenticatedActor & { sessionVersion: number },
) {
  const payload: SessionPayload = {
    ...actor,
    expiresAt: Date.now() + SESSION_SECONDS * 1000,
  };
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${value}.${sign(value)}`;
}

function readPayload(token: string): SessionPayload | null {
  try {
    const [value, signature] = token.split(".");
    if (!value || !signature) return null;

    const expected = sign(value);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (
      !payload.userId ||
      !payload.organizationId ||
      payload.expiresAt < Date.now()
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function getOptionalActor(): Promise<AuthenticatedActor | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = readPayload(token);
  if (!payload) return null;

  const user = await getDb().user.findFirst({
    where: {
      id: payload.userId,
      organizationId: payload.organizationId,
      sessionVersion: payload.sessionVersion,
    },
    select: {
      id: true,
      organizationId: true,
      role: true,
    },
  });
  if (!user) return null;

  return {
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
  };
}

export async function requireActor(): Promise<AuthenticatedActor> {
  const actor = await getOptionalActor();
  if (!actor) throw new Error("Необходима авторизация");
  return actor;
}

export async function setSession(
  actor: AuthenticatedActor & { sessionVersion: number },
) {
  (await cookies()).set(COOKIE_NAME, createSessionToken(actor), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function clearSession() {
  (await cookies()).set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function requireRole(
  actor: AuthenticatedActor,
  allowed: AppRole[],
) {
  if (!allowed.includes(actor.role)) {
    throw new Error("Недостаточно прав для выполнения действия");
  }
}

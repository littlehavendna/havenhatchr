import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { hasBillingAccess } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "havenhatchr_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export const authUserSelect = {
  id: true,
  name: true,
  email: true,
  passwordHash: true,
  plan: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  subscriptionStatus: true,
  trialEnd: true,
  currentPeriodEnd: true,
  isBetaUser: true,
  isAdmin: true,
  isFounder: true,
  aiAccessEnabled: true,
  hasCompletedTutorial: true,
  hasSkippedTutorial: true,
  tutorialCompletedAt: true,
  lastLoginAt: true,
  accountDisabledAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type AuthUser = Prisma.UserGetPayload<{ select: typeof authUserSelect }>;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedKey] = passwordHash.split(":");

  if (!salt || !storedKey) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedKey, "hex");

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedKey);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
    maxAge: SESSION_TTL_MS / 1000,
    priority: "high",
  });

  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    priority: "high",
  });
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { select: authUserSelect } },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await prisma.session.delete({
        where: { token },
      });
    }

    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
      priority: "high",
    });

    return null;
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

export async function getCurrentAdminUser() {
  const user = await getCurrentUser();

  if (!user || !user.isAdmin || user.accountDisabledAt) {
    return null;
  }

  return user;
}

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  if (!user || !hasBillingAccess(user)) {
    return null;
  }

  return user.id;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user || user.accountDisabledAt) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await getCurrentAdminUser();

  if (!user) {
    throw new Error("Forbidden");
  }

  return user;
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

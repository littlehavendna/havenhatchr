import { NextResponse } from "next/server";
import { logUsageEvent } from "@/lib/admin";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (user.accountDisabledAt) {
    return NextResponse.json({ error: "This account has been disabled." }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
    },
  });

  await createSession(user.id);
  await logUsageEvent({
    userId: user.id,
    eventType: "auth.login",
    route: "/login",
    metadata: { source: "credentials" },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      isBetaUser: user.isBetaUser,
    },
  });
}

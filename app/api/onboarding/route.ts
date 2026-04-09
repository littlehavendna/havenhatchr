import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await requireCurrentUser();
    const body = (await request.json()) as { action?: "complete" | "skip" | "restart" };

    if (!body.action) {
      return NextResponse.json({ error: "Onboarding action is required." }, { status: 400 });
    }

    if (body.action === "complete") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hasCompletedTutorial: true,
          hasSkippedTutorial: false,
          tutorialCompletedAt: new Date(),
        },
      });
    }

    if (body.action === "skip") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hasSkippedTutorial: true,
        },
      });
    }

    if (body.action === "restart") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hasCompletedTutorial: false,
          hasSkippedTutorial: false,
          tutorialCompletedAt: null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

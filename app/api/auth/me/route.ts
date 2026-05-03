import { NextResponse } from "next/server";
import { getCurrentUser, requireCurrentUser } from "@/lib/auth";
import { formatBillingDate, getPlanBadge, hasBillingAccess } from "@/lib/billing";
import {
  defaultModuleVisibility,
  getModuleVisibilitySettingKey,
  normalizeModuleVisibility,
} from "@/lib/module-visibility";
import { prisma } from "@/lib/prisma";
import {
  createHttpError,
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let moduleVisibility = defaultModuleVisibility;

  try {
    const moduleSettings = await prisma.systemSetting.findUnique({
      where: { key: getModuleVisibilitySettingKey(user.id) },
      select: { value: true },
    });
    moduleVisibility = normalizeModuleVisibility(moduleSettings?.value);
  } catch {
    moduleVisibility = defaultModuleVisibility;
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      isBetaUser: user.isBetaUser,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      subscriptionStatus: user.subscriptionStatus,
      trialEnd: formatBillingDate(user.trialEnd),
      currentPeriodEnd: formatBillingDate(user.currentPeriodEnd),
      hasAppAccess: hasBillingAccess(user),
      planBadge: getPlanBadge(user),
      isAdmin: user.isAdmin,
      isFounder: user.isFounder,
      aiAccessEnabled: user.aiAccessEnabled,
      moduleVisibility,
      hasCompletedTutorial: user.hasCompletedTutorial,
      hasSkippedTutorial: user.hasSkippedTutorial,
      tutorialCompletedAt: formatBillingDate(user.tutorialCompletedAt),
      lastLoginAt: formatBillingDate(user.lastLoginAt),
      accountDisabledAt: formatBillingDate(user.accountDisabledAt),
    },
  });
}

export async function PATCH(request: Request) {
  try {
    validateAuthenticatedMutation(request);

    const user = await requireCurrentUser();
    const body = await readJsonObject(request);
    const email = readString(body, "email", {
      required: true,
      maxLength: 320,
    }).toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createHttpError("Enter a valid email address.", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser && existingUser.id !== user.id) {
      throw createHttpError("That email is already used by another account.", 409);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("auth.me.update", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update account email.") },
      { status },
    );
  }
}

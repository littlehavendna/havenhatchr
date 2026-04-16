import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { formatBillingDate, getPlanBadge, hasBillingAccess } from "@/lib/billing";
import {
  defaultModuleVisibility,
  getModuleVisibilitySettingKey,
  normalizeModuleVisibility,
} from "@/lib/module-visibility";
import { prisma } from "@/lib/prisma";

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

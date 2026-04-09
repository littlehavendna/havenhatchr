import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { formatBillingDate, getPlanBadge, hasBillingAccess } from "@/lib/billing";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    },
  });
}

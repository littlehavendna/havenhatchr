import { NextResponse } from "next/server";
import { logAuditAction, logUsageEvent } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, syncStripeSubscriptionByCustomer } from "@/lib/billing";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "billing:cancel",
      limit: 6,
      windowMs: 1000 * 60 * 10,
    });

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.isBetaUser) {
      return NextResponse.json({ error: "Beta users do not need billing." }, { status: 400 });
    }

    if (!user.stripeSubscriptionId || !user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active Stripe subscription found." },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await syncStripeSubscriptionByCustomer(user.stripeCustomerId, subscription);

    await logUsageEvent({
      userId: user.id,
      eventType: "billing.cancel_scheduled",
      route: "/api/billing/cancel",
    });
    await logAuditAction({
      actorUserId: user.id,
      subjectUserId: user.id,
      action: "billing.cancel_scheduled",
      entityType: "subscription",
      entityId: user.stripeSubscriptionId,
      summary: "Scheduled subscription cancellation at period end.",
      metadata: { stripeCustomerId: user.stripeCustomerId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("billing.cancel", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to schedule cancellation.") },
      { status },
    );
  }
}

import { NextResponse } from "next/server";
import { logAuditAction, logUsageEvent } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, syncStripeSubscription } from "@/lib/billing";
import { logServerError } from "@/lib/security";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/settings?billing=missing-session", url));
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?billing=success", url));
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const sessionUserId = session.client_reference_id || session.metadata?.userId;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

    if (sessionUserId !== user.id || !subscriptionId) {
      return NextResponse.redirect(new URL("/settings?billing=verify", url));
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncStripeSubscription(user.id, subscription);
    await logUsageEvent({
      userId: user.id,
      eventType: "billing.checkout_returned",
      route: "/billing/success",
      metadata: { stripeCheckoutSessionId: session.id },
    });
    await logAuditAction({
      actorUserId: user.id,
      subjectUserId: user.id,
      action: "billing.checkout_returned",
      entityType: "subscription",
      entityId: subscription.id,
      summary: "Returned from Stripe checkout and synced subscription.",
      metadata: { stripeCheckoutSessionId: session.id },
    });

    return NextResponse.redirect(new URL("/dashboard?billing=success", url));
  } catch (error) {
    logServerError("billing.success", error);
    return NextResponse.redirect(new URL("/settings?billing=sync-error", url));
  }
}

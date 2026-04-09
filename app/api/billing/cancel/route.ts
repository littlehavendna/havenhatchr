import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, syncStripeSubscriptionByCustomer } from "@/lib/billing";

export async function POST() {
  try {
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to schedule cancellation.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

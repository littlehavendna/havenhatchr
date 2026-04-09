import { NextResponse } from "next/server";
import { logAuditAction, logUsageEvent } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { getAppUrl, getStripe, getStripePriceId } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "billing:checkout",
      limit: 10,
      windowMs: 1000 * 60 * 10,
    });

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.isBetaUser) {
      return NextResponse.json({ error: "Beta users do not need billing." }, { status: 400 });
    }

    const stripe = getStripe();
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId,
        },
      });
    }

    const appUrl = getAppUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      client_reference_id: user.id,
      line_items: [
        {
          price: getStripePriceId(),
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          userId: user.id,
        },
      },
      success_url: `${appUrl}/settings?billing=success`,
      cancel_url: `${appUrl}/pricing?billing=cancelled`,
      allow_promotion_codes: true,
    });

    await logUsageEvent({
      userId: user.id,
      eventType: "billing.checkout_started",
      route: "/api/billing/checkout",
    });
    await logUsageEvent({
      userId: user.id,
      eventType: "beta.started_checkout",
      route: "/api/billing/checkout",
    });
    await logAuditAction({
      actorUserId: user.id,
      subjectUserId: user.id,
      action: "billing.checkout_started",
      entityType: "user",
      entityId: user.id,
      summary: "Started a Stripe checkout session.",
      metadata: { stripeCustomerId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("billing.checkout", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to start the free trial.") },
      { status },
    );
  }
}

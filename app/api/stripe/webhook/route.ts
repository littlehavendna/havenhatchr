import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { logAuditAction, logUsageEvent } from "@/lib/admin";
import {
  getStripe,
  getStripeWebhookSecret,
  syncStripeSubscription,
  syncStripeSubscriptionByCustomer,
} from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { logServerError } from "@/lib/security";

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch (error) {
    logServerError("stripe.webhook.verify", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      const userId = session.client_reference_id || session.metadata?.userId;

      if (subscriptionId && userId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncStripeSubscription(userId, subscription);
        await logUsageEvent({
          userId,
          eventType: "billing.webhook.checkout_completed",
          route: "/api/stripe/webhook",
          metadata: { eventId: event.id },
        });
        await logAuditAction({
          actorUserId: userId,
          subjectUserId: userId,
          action: "billing.webhook.checkout_completed",
          entityType: "subscription",
          entityId: subscription.id,
          summary: "Stripe checkout completed and subscription synced.",
          metadata: { eventId: event.id, stripeCustomerId: String(subscription.customer) },
        });
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      await syncStripeSubscriptionByCustomer(String(subscription.customer), subscription);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      await syncStripeSubscriptionByCustomer(String(subscription.customer), null);
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;

      if (typeof invoice.customer === "string") {
        await prisma.user.updateMany({
          where: { stripeCustomerId: invoice.customer },
          data: {
            subscriptionStatus: "past_due",
          },
        });
      }
    }
  } catch (error) {
    logServerError("stripe.webhook.process", error, {
      eventId: event.id,
      eventType: event.type,
    });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

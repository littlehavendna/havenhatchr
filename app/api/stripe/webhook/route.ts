import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  getStripe,
  getStripeWebhookSecret,
  syncStripeSubscription,
  syncStripeSubscriptionByCustomer,
} from "@/lib/billing";
import { prisma } from "@/lib/prisma";

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook signature." },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    const userId = session.client_reference_id || session.metadata?.userId;

    if (subscriptionId && userId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncStripeSubscription(userId, subscription);
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
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

  return NextResponse.json({ received: true });
}

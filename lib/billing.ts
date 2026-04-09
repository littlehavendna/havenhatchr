import "server-only";

import Stripe from "stripe";
import { getAppOrigin, getRequiredEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type BillingUser = {
  plan: string;
  subscriptionStatus: string;
  trialEnd: Date | null;
  currentPeriodEnd: Date | null;
  isBetaUser: boolean;
};

let stripeClient: Stripe | null = null;

function getCurrentPeriodEndDate(subscription: Stripe.Subscription) {
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;
  return currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null;
}

export function getStripe() {
  const secretKey = getRequiredEnv("STRIPE_SECRET_KEY");

  stripeClient ??= new Stripe(secretKey);
  return stripeClient;
}

export function getStripePriceId() {
  return getRequiredEnv("STRIPE_PRICE_ID");
}

export function getStripeWebhookSecret() {
  return getRequiredEnv("STRIPE_WEBHOOK_SECRET");
}

export function getAppUrl() {
  return getAppOrigin();
}

export function isSubscriptionActive(status: string) {
  return ["trialing", "active"].includes(status);
}

export function hasBillingAccess(user: BillingUser) {
  if (user.isBetaUser) {
    return true;
  }

  if (isSubscriptionActive(user.subscriptionStatus)) {
    return true;
  }

  if (user.currentPeriodEnd && user.currentPeriodEnd > new Date() && user.subscriptionStatus === "canceled") {
    return true;
  }

  return false;
}

export function getPlanBadge(user: BillingUser) {
  if (user.isBetaUser) {
    return "Founder Access";
  }

  if (user.subscriptionStatus === "trialing") {
    return "Starter Trial";
  }

  if (user.subscriptionStatus === "active") {
    return "$10 Starter";
  }

  if (user.currentPeriodEnd && user.currentPeriodEnd > new Date() && user.subscriptionStatus === "canceled") {
    return "Cancels Soon";
  }

  return "Billing Required";
}

export function formatBillingDate(value: Date | null) {
  return value ? value.toISOString() : null;
}

export async function syncStripeSubscription(userId: string, subscription: Stripe.Subscription) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: String(subscription.customer),
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      currentPeriodEnd: getCurrentPeriodEndDate(subscription),
      plan: "starter",
    },
  });
}

export async function syncStripeSubscriptionByCustomer(
  customerId: string,
  subscription: Stripe.Subscription | null,
) {
  return prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subscription?.id ?? null,
      subscriptionStatus: subscription?.status ?? "inactive",
      trialEnd: subscription?.trial_end ? new Date(subscription.trial_end * 1000) : null,
      currentPeriodEnd: subscription ? getCurrentPeriodEndDate(subscription) : null,
      plan: "starter",
    },
  });
}

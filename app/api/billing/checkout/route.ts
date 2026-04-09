import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAppUrl, getStripe, getStripePriceId } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
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

  const appUrl = getAppUrl(request.headers.get("origin"));
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

  return NextResponse.json({ url: session.url });
}

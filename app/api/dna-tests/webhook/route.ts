import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getDnaStripe, getDnaStripeWebhookSecret } from "@/lib/dna-server";
import { syncDnaOrderToLittleHaven } from "@/lib/dna-sync";
import { prisma } from "@/lib/prisma";
import { logServerError } from "@/lib/security";

export async function POST(request: Request) {
  const stripe = getDnaStripe();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, getDnaStripeWebhookSecret());
  } catch (error) {
    logServerError("dna.webhook.verify", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const dnaOrderId = session.metadata?.dnaOrderId;

      if (dnaOrderId) {
        await prisma.dnaTestOrder.update({
          where: { id: dnaOrderId },
          data: {
            status: "Paid",
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id || null,
            syncError: "",
          },
        });

        await syncDnaOrderToLittleHaven(dnaOrderId);
      }
    }
  } catch (error) {
    logServerError("dna.webhook.process", error, {
      eventId: event.id,
      eventType: event.type,
    });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

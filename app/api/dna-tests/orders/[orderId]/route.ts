import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import {
  getDnaOrderForUser,
  getDnaPublishableKey,
  getDnaStripe,
} from "@/lib/dna-server";
import { getClientErrorMessage, getErrorStatus, logServerError } from "@/lib/security";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireCurrentUser();
    const { orderId } = await context.params;
    const order = await getDnaOrderForUser(user.id, orderId);

    let clientSecret: string | null = null;

    if (order.status === "PendingPayment" && order.stripeCheckoutSessionId) {
      const stripe = getDnaStripe();
      const session = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId);

      clientSecret = session.client_secret || null;
    }

    return NextResponse.json({
      order,
      clientSecret,
      publishableKey: getDnaPublishableKey(),
    });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("dna.orders.get", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to load the DNA order.") },
      { status },
    );
  }
}

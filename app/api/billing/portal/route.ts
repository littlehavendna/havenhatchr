import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAppUrl, getStripe } from "@/lib/billing";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.isBetaUser) {
    return NextResponse.json({ error: "Beta users do not need billing." }, { status: 400 });
  }

  if (!user.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer found for this account." }, { status: 400 });
  }

  const stripe = getStripe();
  const appUrl = getAppUrl(request.headers.get("origin"));
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/settings`,
  });

  return NextResponse.json({ url: session.url });
}

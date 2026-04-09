import { NextResponse } from "next/server";
import { logAuditAction, logUsageEvent } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { getAppUrl, getStripe } from "@/lib/billing";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "billing:portal",
      limit: 15,
      windowMs: 1000 * 60 * 10,
    });

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.isBetaUser) {
      return NextResponse.json({ error: "Beta users do not need billing." }, { status: 400 });
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found for this account." },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const appUrl = getAppUrl();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/settings`,
    });

    await logUsageEvent({
      userId: user.id,
      eventType: "billing.portal_opened",
      route: "/api/billing/portal",
    });
    await logAuditAction({
      actorUserId: user.id,
      subjectUserId: user.id,
      action: "billing.portal_opened",
      entityType: "user",
      entityId: user.id,
      summary: "Opened Stripe customer portal.",
      metadata: { stripeCustomerId: user.stripeCustomerId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("billing.portal", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to open billing portal.") },
      { status },
    );
  }
}

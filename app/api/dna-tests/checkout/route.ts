import { NextResponse } from "next/server";
import { logAuditAction, logUsageEvent } from "@/lib/admin";
import { requireCurrentUser } from "@/lib/auth";
import {
  createDnaCheckoutOrder,
  getDnaOrderForUser,
  getDnaStripe,
} from "@/lib/dna-server";
import { getAppOrigin } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readBoolean,
  readJsonObject,
  readString,
  readStringArray,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "dna:checkout",
      limit: 10,
      windowMs: 1000 * 60 * 10,
    });

    const user = await requireCurrentUser();
    const body = await readJsonObject(request);
    const chickIds = readStringArray(body, "chickIds", { maxItems: 100, maxItemLength: 40 });

    const order = await createDnaCheckoutOrder(user.id, {
      chickIds,
      contactName: readString(body, "contactName", { required: true, maxLength: 120 }),
      contactEmail: readString(body, "contactEmail", { required: true, maxLength: 255 }),
      notes: readString(body, "notes", { maxLength: 2000 }),
      selections: {
        includeBlueEgg: readBoolean(body, "includeBlueEgg", false),
        includeRecessiveWhite: readBoolean(body, "includeRecessiveWhite", false),
      },
    });

    const stripe = getDnaStripe();
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded" as never,
      mode: "payment",
      customer_email: order.contactEmail,
      return_url: `${getAppOrigin()}/chicks/dna-success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        flow: "dna_test_order",
        dnaOrderId: order.id,
        userId: user.id,
      },
      line_items: order.lineItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.label,
          },
          unit_amount: item.unitPriceCents,
        },
        quantity: item.quantity,
      })),
    } as never);

    await prisma.dnaTestOrder.update({
      where: { id: order.id },
      data: {
        stripeCheckoutSessionId: session.id,
      },
    });

    await logUsageEvent({
      userId: user.id,
      eventType: "dna.checkout_started",
      route: "/api/dna-tests/checkout",
      metadata: { dnaOrderId: order.id, chickCount: order.chicks.length },
    });
    await logAuditAction({
      actorUserId: user.id,
      subjectUserId: user.id,
      action: "dna.checkout_started",
      entityType: "dna_order",
      entityId: order.id,
      summary: `Started DNA checkout for ${order.chicks.length} chick${order.chicks.length === 1 ? "" : "s"}.`,
      metadata: {
        selectedTests: order.selectedTests,
        totalAmountCents: order.totalAmountCents,
      },
    });

    return NextResponse.json({
      order: await getDnaOrderForUser(user.id, order.id),
      clientSecret: session.client_secret,
    });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("dna.checkout", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to start DNA checkout.") },
      { status },
    );
  }
}

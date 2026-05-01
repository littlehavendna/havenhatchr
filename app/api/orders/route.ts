import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createCustomer, createOrder, getOrdersData } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readIsoDateString,
  readJsonObject,
  readNumber,
  readString,
  readStringArray,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getOrdersData(userId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);
    let customerId = readString(body, "customerId", { maxLength: 40 });
    const customerName = readString(body, "customerName", { maxLength: 120 });

    if (!customerId) {
      if (!customerName) {
        return NextResponse.json({ error: "Add or select a customer." }, { status: 400 });
      }

      const customer = await createCustomer(userId, {
        name: customerName,
        email: "",
        phone: "",
        location: "",
        notes: "Created from order entry.",
        status: "Active",
      });
      customerId = customer.id;
    }

    const order = await createOrder(userId, {
      customerId,
      total: readNumber(body, "total", { min: 0, max: 1000000, defaultValue: 0 }),
      status: readString(body, "status", { maxLength: 40, defaultValue: "Pending" }),
      pickupDate: readIsoDateString(body, "pickupDate", { required: true }),
      notes: readString(body, "notes", { maxLength: 2000 }),
      chickIds: readStringArray(body, "chickIds", { maxItems: 200, maxItemLength: 40 }),
    });

    return NextResponse.json({ order });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("orders.create", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "orders",
        eventType: "create_failed",
        message: "Order creation failed.",
        error,
      });
    }
    return NextResponse.json({ error: getClientErrorMessage(error, "Unable to create order.") }, { status });
  }
}

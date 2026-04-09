import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createCustomer, getCustomersData } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customers = await getCustomersData(userId);
  return NextResponse.json({ customers });
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);

    const customer = await createCustomer(userId, {
      name: readString(body, "name", { required: true, maxLength: 120 }),
      email: readString(body, "email", { maxLength: 320 }),
      phone: readString(body, "phone", { maxLength: 40 }),
      location: readString(body, "location", { maxLength: 120 }),
      notes: readString(body, "notes", { maxLength: 2000 }),
      status: readString(body, "status", { maxLength: 40, defaultValue: "Active" }),
    });

    return NextResponse.json({ customer });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("customers.create", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "customers",
        eventType: "create_failed",
        message: "Customer creation failed.",
        error,
      });
    }
    return NextResponse.json({ error: getClientErrorMessage(error, "Unable to create customer.") }, { status });
  }
}

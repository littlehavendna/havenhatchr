import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createIncubator, getIncubationData } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readBoolean,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getIncubationData(userId);
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

    const incubator = await createIncubator(userId, {
      name: readString(body, "name", { required: true, maxLength: 120 }),
      brand: readString(body, "brand", { maxLength: 120 }),
      model: readString(body, "model", { maxLength: 120 }),
      notes: readString(body, "notes", { maxLength: 2000 }),
      active: readBoolean(body, "active", true),
    });

    return NextResponse.json({ incubator });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("incubation.create-incubator", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "incubation",
        eventType: "create_incubator_failed",
        message: "Incubator creation failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to create incubator.") },
      { status },
    );
  }
}

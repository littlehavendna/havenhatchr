import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createEggSaleLocation } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);

    const location = await createEggSaleLocation(userId, {
      name: readString(body, "name", { required: true, maxLength: 80 }),
      description: readString(body, "description", { maxLength: 300 }),
    });

    return NextResponse.json({ location });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("egg-sales.locations.create", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "egg-sales-locations",
        eventType: "create_failed",
        message: "Egg sale location creation failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to create egg sale location.") },
      { status },
    );
  }
}

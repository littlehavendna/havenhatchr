import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getEggSalesData, updateEggSaleSettings } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readEnum,
  readJsonObject,
  readNumber,
  validateAuthenticatedMutation,
} from "@/lib/security";

const unitTypes = ["PerEgg", "PerDozen", "Flat"] as const;

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getEggSalesData(userId);
  return NextResponse.json({ settings: data.settings });
}

export async function PUT(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);

    const settings = await updateEggSaleSettings(userId, {
      defaultPricePerEgg: readNumber(body, "defaultPricePerEgg", {
        min: 0,
        max: 1000000,
        defaultValue: 0,
      }),
      defaultPricePerDozen: readNumber(body, "defaultPricePerDozen", {
        min: 0,
        max: 1000000,
        defaultValue: 0,
      }),
      defaultSaleUnit: readEnum(body, "defaultSaleUnit", unitTypes, { required: true }),
    });

    return NextResponse.json({ settings });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("egg-sales.settings.update", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "egg-sales-settings",
        eventType: "update_failed",
        message: "Egg sale settings update failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update egg sale settings.") },
      { status },
    );
  }
}

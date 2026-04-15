import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createEggSale, getEggSalesData } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readEnum,
  readIsoDateString,
  readJsonObject,
  readNumber,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

const saleTypes = ["TableEggs", "HatchingEggs", "Other"] as const;
const unitTypes = ["PerEgg", "PerDozen", "Flat"] as const;

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getEggSalesData(userId);
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

    const sale = await createEggSale(userId, {
      saleDate: readIsoDateString(body, "saleDate", { required: true }),
      locationId: readString(body, "locationId", { required: true, maxLength: 40 }),
      saleType: readEnum(body, "saleType", saleTypes, { required: true }),
      quantity: readNumber(body, "quantity", { min: 0.01, max: 100000, defaultValue: 1 }),
      unitType: readEnum(body, "unitType", unitTypes, { required: true }),
      pricePerUnit: readNumber(body, "pricePerUnit", { min: 0, max: 1000000, required: true }),
      notes: readString(body, "notes", { maxLength: 2000 }),
    });

    return NextResponse.json({ sale });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("egg-sales.create", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "egg-sales",
        eventType: "create_failed",
        message: "Egg sale creation failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to create egg sale.") },
      { status },
    );
  }
}

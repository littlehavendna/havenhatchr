import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import {
  createInventoryItem,
  createInventoryMovement,
  getInventoryData,
} from "@/lib/db";
import {
  getClientErrorMessage,
  getErrorStatus,
  readEnum,
  readIsoDateString,
  readJsonObject,
  readNumber,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

const INVENTORY_CATEGORIES = ["Feed", "Bedding", "Medical", "Other"] as const;
const INVENTORY_MOVEMENT_TYPES = ["StockIn", "Usage", "Adjustment"] as const;

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getInventoryData(userId);
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
    const action = readEnum(body, "action", ["item", "movement"] as const, {
      required: true,
      defaultValue: "item",
    });

    if (action === "movement") {
      const movement = await createInventoryMovement(userId, {
        itemId: readString(body, "itemId", { required: true, maxLength: 40 }),
        type: readEnum(body, "type", INVENTORY_MOVEMENT_TYPES, {
          required: true,
          defaultValue: "Usage",
        }),
        quantity: readNumber(body, "quantity", { required: true, min: 0.01 }),
        occurredAt: readIsoDateString(body, "occurredAt", { required: true }),
        notes: readString(body, "notes", { maxLength: 1000 }),
      });

      return NextResponse.json({ movement });
    }

    const thresholdValue =
      body.lowStockThreshold === "" || body.lowStockThreshold === null
        ? null
        : readNumber(body, "lowStockThreshold", { min: 0 });
    const item = await createInventoryItem(userId, {
      name: readString(body, "name", { required: true, maxLength: 120 }),
      category: readEnum(body, "category", INVENTORY_CATEGORIES, {
        required: true,
        defaultValue: "Feed",
      }),
      currentQuantity: readNumber(body, "currentQuantity", { required: true, min: 0 }),
      unit: readString(body, "unit", { required: true, maxLength: 40 }),
      lowStockThreshold: thresholdValue,
      notes: readString(body, "notes", { maxLength: 1000 }),
    });

    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update inventory.") },
      { status: getErrorStatus(error) },
    );
  }
}

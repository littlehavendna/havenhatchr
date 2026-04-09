import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createOrder, getOrdersData } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getOrdersData(userId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const order = await createOrder(userId, {
    customerId: body.customerId,
    total: body.total ?? 0,
    status: body.status || "Pending",
    pickupDate: body.pickupDate,
    notes: body.notes || "",
    chickIds: body.chickIds || [],
  });

  return NextResponse.json({ order });
}

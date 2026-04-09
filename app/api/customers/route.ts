import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createCustomer, getCustomersData } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customers = await getCustomersData(userId);
  return NextResponse.json({ customers });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const customer = await createCustomer(userId, {
    name: body.name,
    email: body.email,
    phone: body.phone,
    location: body.location,
    notes: body.notes || "",
    status: body.status || "Active",
  });

  return NextResponse.json({ customer });
}

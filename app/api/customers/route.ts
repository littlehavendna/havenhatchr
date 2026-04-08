import { NextResponse } from "next/server";
import { createCustomer, getCustomersData } from "@/lib/db";

export async function GET() {
  const customers = await getCustomersData();
  return NextResponse.json({ customers });
}

export async function POST(request: Request) {
  const body = await request.json();

  const customer = await createCustomer({
    name: body.name,
    email: body.email,
    phone: body.phone,
    location: body.location,
    notes: body.notes || "-",
    status: body.status || "Active",
  });

  return NextResponse.json({ customer });
}

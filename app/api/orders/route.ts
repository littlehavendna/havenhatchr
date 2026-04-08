import { NextResponse } from "next/server";
import { getOrdersData } from "@/lib/db";

export async function GET() {
  const orders = await getOrdersData();
  return NextResponse.json({ orders });
}

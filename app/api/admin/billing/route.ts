import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getAdminBillingData } from "@/lib/admin";

export async function GET() {
  try {
    await requireAdminUser();
    const data = await getAdminBillingData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/admin";

export async function GET() {
  try {
    await requireAdminUser();
    const data = await getAdminDashboardData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

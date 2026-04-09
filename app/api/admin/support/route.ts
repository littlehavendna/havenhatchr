import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getSupportData } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser();
    const search = request.nextUrl.searchParams.get("search") ?? "";
    const data = await getSupportData(search);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

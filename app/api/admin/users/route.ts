import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getAdminUsersData } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser();
    const search = request.nextUrl.searchParams.get("search") ?? "";
    const users = await getAdminUsersData(search);
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getStorefrontData } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getStorefrontData(userId);
  return NextResponse.json(data);
}

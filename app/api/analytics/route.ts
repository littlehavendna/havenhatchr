import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { buildAnalyticsPayload } from "@/lib/analytics";
import { getAnalyticsBaseData } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getAnalyticsBaseData(userId);
  return NextResponse.json(buildAnalyticsPayload(data));
}

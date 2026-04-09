import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getSupportData, loadDemoDataForUser } from "@/lib/admin";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

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

export async function POST(request: Request) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "admin:support:action",
      limit: 12,
      windowMs: 1000 * 60 * 10,
    });

    const adminUser = await requireAdminUser();
    const body = await readJsonObject(request);
    const action = readString(body, "action", { required: true, maxLength: 80 });
    const targetUserId = readString(body, "userId", { required: true, maxLength: 40 });

    if (action !== "loadDemoData") {
      return NextResponse.json({ error: "Invalid support action." }, { status: 400 });
    }

    await loadDemoDataForUser(adminUser.id, targetUserId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("admin.support.action", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Support action failed.") },
      { status },
    );
  }
}

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSystemSettingsData, upsertSystemSetting } from "@/lib/admin";
import { requireAdminUser } from "@/lib/auth";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function GET() {
  try {
    await requireAdminUser();
    const settings = await getSystemSettingsData();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "admin:system:update",
      limit: 30,
      windowMs: 1000 * 60 * 10,
    });

    const admin = await requireAdminUser();
    const body = await readJsonObject(request);
    const rawValue = body.value;

    if (rawValue === undefined || rawValue === null) {
      return NextResponse.json({ error: "value is required." }, { status: 400 });
    }

    const setting = await upsertSystemSetting(admin.id, {
      key: readString(body, "key", { required: true, maxLength: 120 }).toLowerCase(),
      label: readString(body, "label", { required: true, maxLength: 120 }),
      description: readString(body, "description", { maxLength: 1000 }),
      value: rawValue as Prisma.InputJsonValue,
    });
    return NextResponse.json({ setting });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("admin.system.update", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update system setting.") },
      { status },
    );
  }
}

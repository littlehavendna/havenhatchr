import { NextResponse } from "next/server";
import { createFeatureFlag, getFeatureFlagsData } from "@/lib/admin";
import { requireAdminUser } from "@/lib/auth";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readBoolean,
  readNumber,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function GET() {
  try {
    await requireAdminUser();
    const featureFlags = await getFeatureFlagsData();
    return NextResponse.json({ featureFlags });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "admin:feature-flags:create",
      limit: 20,
      windowMs: 1000 * 60 * 10,
    });

    const admin = await requireAdminUser();
    const body = await readJsonObject(request);
    const featureFlag = await createFeatureFlag(admin.id, {
      name: readString(body, "name", { required: true, maxLength: 120 }),
      key: readString(body, "key", { required: true, maxLength: 120 }).toLowerCase(),
      description: readString(body, "description", { maxLength: 1000 }),
      enabled: readBoolean(body, "enabled", false),
      rolloutPercent:
        body.rolloutPercent === undefined || body.rolloutPercent === null
          ? null
          : readNumber(body, "rolloutPercent", { min: 0, max: 100 }),
      audience: readString(body, "audience", { maxLength: 120, defaultValue: "all" }),
    });
    return NextResponse.json({ featureFlag });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("admin.feature-flags.create", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to create feature flag.") },
      { status },
    );
  }
}

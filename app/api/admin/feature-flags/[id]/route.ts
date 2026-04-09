import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { updateFeatureFlag } from "@/lib/admin";
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "admin:feature-flags:update",
      limit: 30,
      windowMs: 1000 * 60 * 10,
    });

    const admin = await requireAdminUser();
    const body = await readJsonObject(request);
    const { id } = await params;
    const featureFlag = await updateFeatureFlag(admin.id, id, {
      name: body.name === undefined ? undefined : readString(body, "name", { maxLength: 120 }),
      description:
        body.description === undefined
          ? undefined
          : readString(body, "description", { maxLength: 1000 }),
      enabled: body.enabled === undefined ? undefined : readBoolean(body, "enabled"),
      rolloutPercent:
        body.rolloutPercent === undefined
          ? undefined
          : body.rolloutPercent === null
            ? null
            : readNumber(body, "rolloutPercent", { min: 0, max: 100 }),
      audience:
        body.audience === undefined ? undefined : readString(body, "audience", { maxLength: 120 }),
    });
    return NextResponse.json({ featureFlag });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("admin.feature-flags.update", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update feature flag.") },
      { status },
    );
  }
}

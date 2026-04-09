import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getAdminUserDetail, updateAdminUserAccess } from "@/lib/admin";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readBoolean,
  readJsonObject,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();
    const { id } = await params;
    const detail = await getAdminUserDetail(id);

    if (!detail) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "admin:users:update",
      limit: 20,
      windowMs: 1000 * 60 * 10,
    });

    const admin = await requireAdminUser();
    const { id } = await params;
    const body = await readJsonObject(request);
    const user = await updateAdminUserAccess(admin.id, id, {
      isBetaUser: body.isBetaUser === undefined ? undefined : readBoolean(body, "isBetaUser"),
      isFounder: body.isFounder === undefined ? undefined : readBoolean(body, "isFounder"),
      aiAccessEnabled:
        body.aiAccessEnabled === undefined ? undefined : readBoolean(body, "aiAccessEnabled"),
      isAdmin: body.isAdmin === undefined ? undefined : readBoolean(body, "isAdmin"),
      disableAccount:
        body.disableAccount === undefined ? undefined : readBoolean(body, "disableAccount"),
    });
    return NextResponse.json({ user });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("admin.users.update", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update user access.") },
      { status },
    );
  }
}

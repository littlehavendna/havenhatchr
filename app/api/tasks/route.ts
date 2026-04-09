import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createTask, getTasksData, updateTaskStatus } from "@/lib/db";
import {
  getClientErrorMessage,
  getErrorStatus,
  readEnum,
  readIsoDateString,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

const TASK_STATUSES = ["Open", "InProgress", "Completed"] as const;
const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;
const TASK_RELATED_TYPES = [
  "Bird",
  "Chick",
  "HatchGroup",
  "Customer",
  "Order",
  "Reservation",
  "Show",
  "Other",
] as const;

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getTasksData(userId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);

    const task = await createTask(userId, {
      title: readString(body, "title", { required: true, maxLength: 140 }),
      description: readString(body, "description", { maxLength: 1000 }),
      status: readEnum(body, "status", TASK_STATUSES, { required: true, defaultValue: "Open" }),
      priority: readEnum(body, "priority", TASK_PRIORITIES, { required: true, defaultValue: "Medium" }),
      dueDate: readIsoDateString(body, "dueDate", { required: true }),
      relatedEntityType: readEnum(body, "relatedEntityType", TASK_RELATED_TYPES, {
        required: true,
        defaultValue: "Other",
      }),
      relatedEntityId: readString(body, "relatedEntityId", { maxLength: 80 }),
      notes: readString(body, "notes", { maxLength: 2000 }),
    });

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to create task.") },
      { status: getErrorStatus(error) },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);

    const task = await updateTaskStatus(
      userId,
      readString(body, "id", { required: true, maxLength: 40 }),
      readEnum(body, "status", TASK_STATUSES, { required: true }),
    );

    return NextResponse.json({ task });
  } catch (error) {
    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update task.") },
      { status: getErrorStatus(error) },
    );
  }
}

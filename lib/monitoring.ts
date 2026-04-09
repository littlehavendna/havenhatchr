import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type MonitoringLevel = "info" | "warn" | "error";

type MonitoringInput = {
  level: MonitoringLevel;
  source: string;
  eventType: string;
  message: string;
  requestId?: string | null;
  route?: string | null;
  userId?: string | null;
  metadata?: Prisma.InputJsonValue;
  error?: unknown;
  persist?: boolean;
};

type RequestLike = Pick<Request, "headers" | "method" | "url">;

function sanitizeMetadata(value: Prisma.InputJsonValue | undefined): Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeMetadata(entry) ?? "[omitted]");
  }

  const blockedKeys = ["password", "token", "secret", "authorization", "cookie", "signature"];
  const objectValue = value as Record<string, Prisma.InputJsonValue>;
  const sanitized: Record<string, Prisma.InputJsonValue> = {};

  for (const [key, entry] of Object.entries(objectValue)) {
    const lowerKey = key.toLowerCase();

    if (blockedKeys.some((blockedKey) => lowerKey.includes(blockedKey))) {
      sanitized[key] = "[redacted]";
      continue;
    }

    sanitized[key] = sanitizeMetadata(entry) ?? "[omitted]";
  }

  return sanitized;
}

function serializeError(error: unknown) {
  if (!(error instanceof Error)) {
    return error;
  }

  return {
    name: error.name,
    message: error.message,
  };
}

export function getRequestCorrelationId(request: RequestLike) {
  return request.headers.get("x-request-id");
}

export function getRequestRoute(request: RequestLike) {
  try {
    return new URL(request.url).pathname;
  } catch {
    return "";
  }
}

export async function reportOperationalEvent(input: MonitoringInput) {
  const payload = {
    timestamp: new Date().toISOString(),
    level: input.level,
    source: input.source,
    eventType: input.eventType,
    message: input.message,
    requestId: input.requestId ?? null,
    route: input.route ?? "",
    userId: input.userId ?? null,
    metadata: sanitizeMetadata(input.metadata),
    error: serializeError(input.error),
  };

  if (input.level === "error") {
    console.error("[monitoring]", payload);
  } else if (input.level === "warn") {
    console.warn("[monitoring]", payload);
  } else {
    console.info("[monitoring]", payload);
  }

  if (input.persist !== false) {
    try {
      await prisma.operationalEvent.create({
        data: {
          userId: input.userId ?? null,
          level: input.level,
          source: input.source,
          eventType: input.eventType,
          message: input.message,
          route: input.route ?? "",
          requestId: input.requestId ?? null,
          metadata: sanitizeMetadata(input.metadata),
        },
      });
    } catch (persistenceError) {
      console.error("[monitoring.persistence_failed]", {
        source: input.source,
        eventType: input.eventType,
        message:
          persistenceError instanceof Error ? persistenceError.message : "Unknown persistence error",
      });
    }
  }

  if (process.env.MONITORING_PROVIDER === "sentry" && process.env.SENTRY_DSN) {
    // Placeholder hook for a future real provider integration.
  }
}

export async function reportRequestEvent(
  request: RequestLike,
  input: Omit<MonitoringInput, "requestId" | "route">,
) {
  await reportOperationalEvent({
    ...input,
    requestId: getRequestCorrelationId(request),
    route: getRequestRoute(request),
  });
}

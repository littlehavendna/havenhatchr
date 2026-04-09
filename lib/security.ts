const DEFAULT_RATE_LIMIT_WINDOW_MS = 1000 * 60 * 5;
const DEFAULT_RATE_LIMIT_LIMIT = 20;

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

class HttpRouteError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const rateLimitStore =
  globalThis.__havenHatchrRateLimitStore ??
  (globalThis.__havenHatchrRateLimitStore = new Map<string, RateLimitRecord>());

declare global {
  var __havenHatchrRateLimitStore: Map<string, RateLimitRecord> | undefined;
}

export function createHttpError(message: string, status = 400) {
  return new HttpRouteError(message, status);
}

export function getErrorStatus(error: unknown) {
  return error instanceof HttpRouteError ? error.status : 500;
}

export function getClientErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  return error instanceof HttpRouteError ? error.message : fallback;
}

export function logServerError(context: string, error: unknown, metadata?: Record<string, unknown>) {
  const payload = {
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
          }
        : error,
    ...(metadata ? { metadata } : {}),
  };

  console.error(`[${context}]`, payload);
}

export async function readJsonObject(request: Request) {
  try {
    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw createHttpError("Invalid request payload.", 400);
    }

    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof HttpRouteError) {
      throw error;
    }

    throw createHttpError("Invalid JSON body.", 400);
  }
}

export function readString(
  body: Record<string, unknown>,
  key: string,
  options?: {
    required?: boolean;
    trim?: boolean;
    minLength?: number;
    maxLength?: number;
    defaultValue?: string;
  },
) {
  const required = options?.required ?? false;
  const trim = options?.trim ?? true;
  const value = body[key];

  if (value === undefined || value === null || value === "") {
    if (required) {
      throw createHttpError(`${key} is required.`, 400);
    }

    return options?.defaultValue ?? "";
  }

  if (typeof value !== "string") {
    throw createHttpError(`${key} must be a string.`, 400);
  }

  const normalized = trim ? value.trim() : value;

  if (required && normalized.length === 0) {
    throw createHttpError(`${key} is required.`, 400);
  }

  if (options?.minLength && normalized.length < options.minLength) {
    throw createHttpError(`${key} must be at least ${options.minLength} characters.`, 400);
  }

  if (options?.maxLength && normalized.length > options.maxLength) {
    throw createHttpError(`${key} must be ${options.maxLength} characters or fewer.`, 400);
  }

  return normalized;
}

export function readBoolean(
  body: Record<string, unknown>,
  key: string,
  defaultValue = false,
) {
  const value = body[key];

  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value !== "boolean") {
    throw createHttpError(`${key} must be a boolean.`, 400);
  }

  return value;
}

export function readNumber(
  body: Record<string, unknown>,
  key: string,
  options?: {
    required?: boolean;
    min?: number;
    max?: number;
    defaultValue?: number;
  },
) {
  const required = options?.required ?? false;
  const value = body[key];

  if (value === undefined || value === null || value === "") {
    if (required) {
      throw createHttpError(`${key} is required.`, 400);
    }

    return options?.defaultValue ?? 0;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw createHttpError(`${key} must be a number.`, 400);
  }

  if (options?.min !== undefined && value < options.min) {
    throw createHttpError(`${key} must be at least ${options.min}.`, 400);
  }

  if (options?.max !== undefined && value > options.max) {
    throw createHttpError(`${key} must be ${options.max} or less.`, 400);
  }

  return value;
}

export function readEnum<T extends string>(
  body: Record<string, unknown>,
  key: string,
  allowedValues: readonly T[],
  options?: {
    required?: boolean;
    defaultValue?: T;
  },
) {
  const value = body[key];

  if (value === undefined || value === null || value === "") {
    if (options?.required) {
      throw createHttpError(`${key} is required.`, 400);
    }

    if (options?.defaultValue !== undefined) {
      return options.defaultValue;
    }

    throw createHttpError(`${key} is required.`, 400);
  }

  if (typeof value !== "string" || !allowedValues.includes(value as T)) {
    throw createHttpError(`${key} is invalid.`, 400);
  }

  return value as T;
}

export function readStringArray(
  body: Record<string, unknown>,
  key: string,
  options?: {
    maxItems?: number;
    maxItemLength?: number;
  },
) {
  const value = body[key];

  if (value === undefined || value === null) {
    return [] as string[];
  }

  if (!Array.isArray(value)) {
    throw createHttpError(`${key} must be an array.`, 400);
  }

  const normalized = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  if (normalized.length !== value.length) {
    throw createHttpError(`${key} must contain only strings.`, 400);
  }

  if (options?.maxItems !== undefined && normalized.length > options.maxItems) {
    throw createHttpError(`${key} must contain ${options.maxItems} items or fewer.`, 400);
  }

  const maxItemLength = options?.maxItemLength;

  if (maxItemLength !== undefined && normalized.some((item) => item.length > maxItemLength)) {
    throw createHttpError(`${key} contains a value that is too long.`, 400);
  }

  return normalized;
}

export function readIsoDateString(
  body: Record<string, unknown>,
  key: string,
  options?: { required?: boolean },
) {
  const value = readString(body, key, {
    required: options?.required ?? false,
    defaultValue: "",
  });

  if (!value) {
    return "";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw createHttpError(`${key} must be a valid date.`, 400);
  }

  return value;
}

export function assertTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol =
    request.headers.get("x-forwarded-proto") ||
    (process.env.NODE_ENV === "production" ? "https" : "http");

  if (!origin || !host) {
    throw createHttpError("Invalid request origin.", 403);
  }

  let normalizedOrigin: string;

  try {
    normalizedOrigin = new URL(origin).origin;
  } catch {
    throw createHttpError("Invalid request origin.", 403);
  }

  const expectedOrigin = `${protocol}://${host}`;

  if (normalizedOrigin !== expectedOrigin) {
    throw createHttpError("Cross-site requests are not allowed.", 403);
  }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export function enforceRateLimit(
  request: Request,
  key: string,
  options?: { limit?: number; windowMs?: number },
) {
  const limit = options?.limit ?? DEFAULT_RATE_LIMIT_LIMIT;
  const windowMs = options?.windowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS;
  const now = Date.now();
  const identifier = `${key}:${getClientIp(request)}`;
  const existing = rateLimitStore.get(identifier);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (existing.count >= limit) {
    throw createHttpError("Too many requests. Please try again later.", 429);
  }

  existing.count += 1;
  rateLimitStore.set(identifier, existing);
}

export function validateAuthenticatedMutation(
  request: Request,
  options?: { rateLimitKey?: string; limit?: number; windowMs?: number },
) {
  assertTrustedOrigin(request);

  if (options?.rateLimitKey) {
    enforceRateLimit(request, options.rateLimitKey, {
      limit: options.limit,
      windowMs: options.windowMs,
    });
  }
}

export function buildContentSecurityPolicy() {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://billing.stripe.com",
    "frame-src 'self' https://checkout.stripe.com https://billing.stripe.com https://js.stripe.com https://hooks.stripe.com",
    "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
    "manifest-src 'self'",
  ];

  if (process.env.NODE_ENV === "production") {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

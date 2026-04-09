import { NextRequest, NextResponse } from "next/server";
import { buildContentSecurityPolicy } from "@/lib/security";

const SESSION_COOKIE_NAME = "havenhatchr_session";
const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/pricing", "/robots.txt", "/sitemap.xml"]);
const INDEXABLE_PUBLIC_PATHS = new Set(["/", "/pricing", "/robots.txt", "/sitemap.xml"]);

function applySecurityHeaders(request: NextRequest, response: NextResponse) {
  const isIndexable = INDEXABLE_PUBLIC_PATHS.has(request.nextUrl.pathname);
  const isPrivate = !PUBLIC_PATHS.has(request.nextUrl.pathname);

  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy());
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");

  if (!isIndexable) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  if (isPrivate) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
  }

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  response.headers.set("X-Request-Id", request.headers.get("x-request-id") || crypto.randomUUID());

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set("x-request-id", requestId);
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isPublicPath = PUBLIC_PATHS.has(pathname);

  if (pathname.startsWith("/api")) {
    return applySecurityHeaders(
      request,
      NextResponse.next({
        request: {
          headers: forwardedHeaders,
        },
      }),
    );
  }

  if (isPublicPath && sessionToken && (pathname === "/login" || pathname === "/signup")) {
    return applySecurityHeaders(request, NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  if (!isPublicPath && !sessionToken) {
    return applySecurityHeaders(request, NextResponse.redirect(new URL("/login", request.url)));
  }

  if (pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(forwardedHeaders);
    requestHeaders.set("x-havenhatchr-admin-path", "1");
    return applySecurityHeaders(request, NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }));
  }

  return applySecurityHeaders(
    request,
    NextResponse.next({
      request: {
        headers: forwardedHeaders,
      },
    }),
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

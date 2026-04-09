import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "havenhatchr_session";
const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/pricing"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isPublicPath = PUBLIC_PATHS.has(pathname);

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (isPublicPath && sessionToken && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicPath && !sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-havenhatchr-admin-path", "1");
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

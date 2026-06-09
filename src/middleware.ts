import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Route protection — unauthenticated users hitting an app route are bounced to
 * /login. This is an optimistic cookie check (fast, edge-safe); pages still
 * resolve the full session server-side before rendering sensitive data.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/projects/:path*",
    "/invoices/:path*",
    "/team/:path*",
    "/settings/:path*",
  ],
};

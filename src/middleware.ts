import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

// Public pages that don't require auth
const publicPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/terms",
  "/privacy",
];

// Protected pages that require auth
const protectedPaths = [
  "/dashboard",
  "/deposit",
  "/withdraw",
  "/send",
  "/transactions",
  "/recipients",
  "/settings",
  "/onboarding",
];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  const isPublicAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Redirect logged-in users away from login/register
  if (isPublicAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  // Redirect unauthenticated users to login
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // CSRF protection for API mutations
  if (pathname.startsWith("/api/") && !["GET", "HEAD"].includes(req.method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin && host) {
      const originHost = new URL(origin).host;
      const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
      if (originHost !== host && !isLocalhost) {
        return NextResponse.json(
          { success: false, error: { message: "CSRF validation failed" } },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};

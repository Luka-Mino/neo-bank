import { NextRequest, NextResponse } from "next/server";

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

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for NextAuth session cookie
  const sessionCookie =
    req.cookies.get("authjs.session-token") ||
    req.cookies.get("__Secure-authjs.session-token");
  const isLoggedIn = !!sessionCookie;

  const isPublicAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  // Redirect logged-in users away from login/register
  if (isPublicAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users to login
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};

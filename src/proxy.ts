import { NextRequest, NextResponse } from "next/server";
import {
  POST_SIGN_IN_PATH,
  isAuthEntryPath,
  isPublicPath,
} from "@/lib/route-access";

// Next.js 16 "Proxy" (formerly middleware). Runs on the Node.js runtime.
// Two jobs: a per-request Content-Security-Policy, and page-level auth
// redirects. Pages are PROTECTED BY DEFAULT — only the paths in
// src/lib/route-access.ts are reachable signed out.

// Content-Security-Policy. Per-request nonce for scripts (+ strict-dynamic,
// so only our nonce'd bootstrap and what it loads can run — the strongest
// XSS control). Styles allow 'unsafe-inline' because Tailwind and our
// gradient/transform inline styles need it (style injection is far lower
// risk than script injection). Dev needs 'unsafe-eval' for Turbopack HMR.
function buildCsp(nonce: string): string {
  const dev = process.env.NODE_ENV !== "production";
  // Dakota Cards.js shows card number/CVV/expiry in Lithic-hosted frames.
  // Only allowed when Dakota cards are switched on (DAKOTA-CARDS-SPEC.md §6.4).
  const cardFrames =
    process.env.ISSUING_PROVIDER === "dakota"
      ? process.env.DAKOTA_ENV === "production"
        ? "https://api.lithic.com"
        : "https://sandbox.lithic.com"
      : null;
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    // 'self' for our APIs; ws: for dev HMR sockets. Sentry/Dakota hosts get
    // added here when their env vars are set (M3).
    `connect-src 'self'${dev ? " ws:" : ""}`,
    ...(cardFrames ? [`frame-src ${cardFrames}`] : []),
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // CSP applies to document responses only (not API or static assets, which
  // the matcher already excludes — but API is matched, so guard it here).
  const isApi = pathname.startsWith("/api");

  // Per-request nonce; Next propagates it to its own inline scripts when it
  // sees the nonce in the request's CSP header.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(req.headers);
  if (!isApi) {
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("content-security-policy", csp);
  }

  // ── Auth redirects (skipped in demo mode) ──────────────────────────────
  if (
    process.env.NEXT_PUBLIC_DEMO_MODE !== "true" &&
    !isApi &&
    !pathname.startsWith("/_next") &&
    !pathname.includes(".")
  ) {
    const sessionCookie =
      req.cookies.get("authjs.session-token") ||
      req.cookies.get("__Secure-authjs.session-token");
    const isLoggedIn = !!sessionCookie;

    if (isAuthEntryPath(pathname) && isLoggedIn) {
      return NextResponse.redirect(new URL(POST_SIGN_IN_PATH, req.url));
    }
    if (!isPublicPath(pathname) && !isLoggedIn) {
      const login = new URL("/login", req.url);
      return NextResponse.redirect(login);
    }
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (!isApi) {
    res.headers.set("content-security-policy", csp);
  }
  return res;
}

export const config = {
  matcher: [
    // Run on everything except static assets, so CSP covers all documents.
    "/((?!_next/static|_next/image|favicon.ico|images|brand).*)",
  ],
};

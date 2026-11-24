// Which pages can be seen signed out. Protected-by-default: anything NOT
// listed here requires a session (enforced in src/proxy.ts), so a new page is
// never accidentally public. API routes enforce auth per route and are not
// governed by this list.

/** Pages (and their sub-paths) that signed-out visitors may open. */
export const PUBLIC_PATHS = [
  // Marketing / legal
  "/security",
  "/how-it-works",
  "/privacy",
  "/terms",
  // Auth flows
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/magic",
  // Metadata routes Next.js may generate without a file extension
  "/icon",
  "/apple-icon",
  "/opengraph-image",
  "/twitter-image",
] as const;

/** Where a signed-in user lands (D3 in LAUNCH-READINESS-PLAN.md). */
export const POST_SIGN_IN_PATH = "/app";

/** Segment-boundary match: "/terms" covers "/terms" and "/terms/x", not "/termsx". */
function matches(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(base + "/");
}

export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some((p) => matches(pathname, p));
}

/** Sign-in / sign-up pages a signed-in user should be bounced away from. */
export function isAuthEntryPath(pathname: string): boolean {
  return matches(pathname, "/login") || matches(pathname, "/register");
}

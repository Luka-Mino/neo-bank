import { describe, expect, it } from "vitest";
import { isAuthEntryPath, isPublicPath } from "./route-access";

describe("isPublicPath (protected by default)", () => {
  it.each([
    "/",
    "/security",
    "/how-it-works",
    "/privacy",
    "/terms",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/magic",
  ])("allows signed-out access to %s", (p) => {
    expect(isPublicPath(p)).toBe(true);
  });

  it.each([
    "/app",
    "/app/accounts/acct-1",
    "/app/activity",
    "/app/move/send",
    "/app/move/withdraw",
    "/app/move/transfer",
    "/app/move/deposit",
    "/app/card",
    "/app/insights",
    "/app/more/settings",
    "/app/more/team",
    "/app/more/approvals",
    "/app/more/help",
    "/app/onboarding",
    // Old classic-dashboard URLs redirect to /app (next.config.ts) and stay private.
    "/dashboard",
    "/send",
    "/design/og",
    "/some-new-page",
  ])("requires a session for %s", (p) => {
    expect(isPublicPath(p)).toBe(false);
  });

  it("matches on segment boundaries, not prefixes", () => {
    expect(isPublicPath("/termsx")).toBe(false);
    expect(isPublicPath("/login-help")).toBe(false);
    expect(isPublicPath("/terms/archive")).toBe(true);
  });
});

describe("isAuthEntryPath", () => {
  it("is true only for sign-in and sign-up pages", () => {
    expect(isAuthEntryPath("/login")).toBe(true);
    expect(isAuthEntryPath("/register")).toBe(true);
    expect(isAuthEntryPath("/forgot-password")).toBe(false);
    expect(isAuthEntryPath("/app")).toBe(false);
  });
});

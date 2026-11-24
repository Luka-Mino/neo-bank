import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LEGACY_ROUTES, legacyRedirects, resolveLegacyPath } from "./legacy-routes";

const appDir = join(__dirname, "..", "app");

/** Does an App Router page exist for this destination? (":id" → "[id]") */
function pageExists(route: string): boolean {
  const segs = route.split("/").filter(Boolean).map((s) => (s.startsWith(":") ? `[${s.slice(1)}]` : s));
  return existsSync(join(appDir, ...segs, "page.tsx"));
}

describe("legacy redirects", () => {
  it("every destination is a real page", () => {
    for (const { destination } of LEGACY_ROUTES) {
      expect(pageExists(destination), destination).toBe(true);
    }
  });

  it("no old page is left behind to shadow a redirect", () => {
    expect(existsSync(join(appDir, "(dashboard)"))).toBe(false);
    expect(existsSync(join(appDir, "personal"))).toBe(false);
  });

  it("maps old paths, including dynamic ones", () => {
    expect(resolveLegacyPath("/dashboard")).toBe("/app");
    expect(resolveLegacyPath("/personal")).toBe("/");
    expect(resolveLegacyPath("/transactions/abc-123")).toBe("/app/activity/abc-123");
    expect(resolveLegacyPath("/transfer-out")).toBe("/app/move/withdraw");
    expect(resolveLegacyPath("/app")).toBeNull();
    expect(resolveLegacyPath("/security")).toBeNull();
  });

  it("are permanent", () => {
    expect(legacyRedirects().every((r) => r.permanent)).toBe(true);
  });
});

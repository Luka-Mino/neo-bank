import { describe, expect, it } from "vitest";
import { rateLimitKey } from "./rate-limit";

describe("rateLimitKey", () => {
  it("gives each endpoint its own bucket for the same IP", () => {
    expect(rateLimitKey("1.2.3.4", "/api/auth/forgot-password")).not.toBe(
      rateLimitKey("1.2.3.4", "/api/auth/magic-link")
    );
  });

  it("separates different IPs on the same endpoint", () => {
    expect(rateLimitKey("1.2.3.4", "/api/register")).not.toBe(
      rateLimitKey("5.6.7.8", "/api/register")
    );
  });

  it("collapses id-like segments so varying ids can't mint new buckets", () => {
    const a = rateLimitKey("1.2.3.4", "/api/cards/3f2b6c1e-8a1d-4c2e-9b7a-1234567890ab/reveal-session");
    const b = rateLimitKey("1.2.3.4", "/api/cards/9a9a9a9a-1111-4222-8333-444444444444/reveal-session");
    expect(a).toBe(b);
    expect(a).toBe("1.2.3.4|/api/cards/:id/reveal-session");
    expect(rateLimitKey("1.2.3.4", "/api/transactions/12345")).toBe("1.2.3.4|/api/transactions/:id");
    expect(rateLimitKey("1.2.3.4", "/api/wallets/2Ab3Cd4Ef5Gh6Ij7Kl8Mn9Op0Qr")).toBe(
      "1.2.3.4|/api/wallets/:id"
    );
  });
});

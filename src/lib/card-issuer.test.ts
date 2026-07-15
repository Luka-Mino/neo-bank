import { afterEach, describe, expect, it } from "vitest";
import {
  __resetIssuerProvider,
  getIssuerProvider,
} from "@/lib/card-issuer";

const req = {
  userId: "u1",
  accountId: "a1",
  cardType: "virtual" as const,
  cardholder: { name: "Alex Demo", email: "alex@demo.com" },
};

afterEach(() => {
  delete process.env.ISSUING_PROVIDER;
  __resetIssuerProvider();
});

describe("card issuer provider", () => {
  it("defaults to the mock provider", () => {
    expect(getIssuerProvider().name).toBe("mock");
  });

  it("mock issueCard returns a well-formed card with no external refs", async () => {
    const card = await getIssuerProvider().issueCard(req);
    expect(card.last4).toMatch(/^\d{4}$/);
    expect(card.expMonth).toBeGreaterThanOrEqual(1);
    expect(card.expMonth).toBeLessThanOrEqual(12);
    expect(card.expYear).toBeGreaterThan(new Date().getFullYear());
    expect(card.network).toBe("visa");
    // Mock issues nothing real — no issuer card id or PAN token persisted.
    expect(card.externalCardId).toBeNull();
    expect(card.panToken).toBeNull();
  });

  it("selects the Stripe provider when flagged, which is dark until configured", async () => {
    process.env.ISSUING_PROVIDER = "stripe";
    __resetIssuerProvider();
    const provider = getIssuerProvider();
    expect(provider.name).toBe("stripe");
    // Not wired yet — must fail loudly rather than silently mock.
    await expect(provider.issueCard(req)).rejects.toThrow(/not configured/i);
  });
});

import { describe, expect, it } from "vitest";
import {
  decideAuthorization,
  dollarsToCents,
  type CardAuthContext,
} from "@/lib/issuing/authorization";

const active = (balanceCents: number): CardAuthContext => ({
  cardStatus: "active",
  accountStatus: "active",
  availableBalanceCents: balanceCents,
});

describe("decideAuthorization", () => {
  it("approves when the active card's account covers the amount", () => {
    expect(decideAuthorization({ amountCents: 5000, currency: "usd" }, active(10000))).toEqual({
      approved: true,
    });
  });

  it("approves an exact-balance spend (boundary)", () => {
    expect(decideAuthorization({ amountCents: 10000, currency: "usd" }, active(10000)).approved).toBe(true);
  });

  it("declines one cent over balance", () => {
    expect(decideAuthorization({ amountCents: 10001, currency: "usd" }, active(10000))).toEqual({
      approved: false,
      reason: "insufficient_funds",
    });
  });

  it("approves a zero-amount verification without needing balance", () => {
    expect(decideAuthorization({ amountCents: 0, currency: "usd" }, active(0)).approved).toBe(true);
  });

  it("declines an unknown card (no context) — never approve blind", () => {
    expect(decideAuthorization({ amountCents: 100, currency: "usd" }, null)).toEqual({
      approved: false,
      reason: "card_not_found",
    });
  });

  it("declines a frozen card even with funds", () => {
    const ctx = { ...active(10000), cardStatus: "frozen" };
    expect(decideAuthorization({ amountCents: 100, currency: "usd" }, ctx).reason).toBe("card_inactive");
  });

  it("declines when the account is closed", () => {
    const ctx = { ...active(10000), accountStatus: "closed" };
    expect(decideAuthorization({ amountCents: 100, currency: "usd" }, ctx).reason).toBe("account_inactive");
  });

  it("declines a non-USD authorization", () => {
    expect(decideAuthorization({ amountCents: 100, currency: "eur" }, active(10000)).reason).toBe(
      "unsupported_currency"
    );
  });

  it("declines a negative or non-integer amount", () => {
    expect(decideAuthorization({ amountCents: -5, currency: "usd" }, active(10000)).reason).toBe("invalid_amount");
    expect(decideAuthorization({ amountCents: 10.5, currency: "usd" }, active(10000)).reason).toBe("invalid_amount");
  });

  it("is case-insensitive on currency", () => {
    expect(decideAuthorization({ amountCents: 100, currency: "USD" }, active(10000)).approved).toBe(true);
  });
});

describe("dollarsToCents", () => {
  it("floors a numeric(30,18) dollar string to whole cents", () => {
    expect(dollarsToCents("100.009")).toBe(10000);
    expect(dollarsToCents("8250.18")).toBe(825018);
    expect(dollarsToCents("0")).toBe(0);
    expect(dollarsToCents("-3")).toBe(0);
    expect(dollarsToCents("not-a-number")).toBe(0);
  });
});

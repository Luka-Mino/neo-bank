import { describe, expect, it } from "vitest";
import { parseCardSpending } from "./wallets";

describe("parseCardSpending", () => {
  it("reads Dakota's documented card object", () => {
    // Example from docs.dakota.xyz/documentation/cards/card-funding.md
    const r = parseCardSpending({
      card: {
        currency: "USD",
        total: "1250.00",
        held: "42.50",
        outstanding: "0.00",
        available: "1207.50",
        spend_asset: "RD",
        spend_network_id: "base-mainnet",
      },
    });
    expect(r).toEqual({
      available: 1207.5,
      held: 42.5,
      outstanding: 0,
      total: 1250,
      spendAsset: "RD",
      networkId: "base-mainnet",
    });
  });

  it("returns null when the card object is absent (not enabled, or a slow read)", () => {
    expect(parseCardSpending({})).toBeNull();
  });

  it("never shows a negative or garbled figure", () => {
    const r = parseCardSpending({
      card: { currency: "USD", total: "x", held: "-1", outstanding: "", available: "NaN", spend_asset: "USDC", spend_network_id: "base-mainnet" },
    });
    expect(r).toMatchObject({ available: 0, held: 0, outstanding: 0, total: 0 });
  });
});

import { describe, expect, it } from "vitest";
import { categorizeTransaction, isCategory, CATEGORY_KEYS } from "./categorize";

describe("categorizeTransaction", () => {
  it("matches note keywords over type fallback", () => {
    expect(
      categorizeTransaction({ txType: "internal_out", note: "Coffee fund" })
    ).toBe("food");
    expect(
      categorizeTransaction({ txType: "send", note: "rent for July" })
    ).toBe("bills");
    expect(
      categorizeTransaction({ txType: "send", merchant: "Uber Trip" })
    ).toBe("transport");
  });

  it("falls back to tx type when text is uninformative", () => {
    expect(categorizeTransaction({ txType: "onramp" })).toBe("income");
    expect(categorizeTransaction({ txType: "offramp", note: "zzz" })).toBe(
      "transfers"
    );
    expect(categorizeTransaction({ txType: "unknown_type" })).toBe("other");
  });

  it("category guard accepts every defined key and rejects junk", () => {
    for (const k of CATEGORY_KEYS) expect(isCategory(k)).toBe(true);
    expect(isCategory("gambling")).toBe(false);
  });
});

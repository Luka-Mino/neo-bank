import { describe, expect, it } from "vitest";
import { checkAmount, parseAmount, sanitizeAmount, toApiAmount } from "./money-input";

describe("sanitizeAmount", () => {
  it.each([
    ["", ""],
    ["12", "12"],
    ["12.5", "12.5"],
    ["12.567", "12.56"],
    ["1.2.3", "1.23"],
    ["$1,250.50", "1250.50"],
    ["007", "7"],
    ["0", "0"],
    ["0.5", "0.5"],
    [".5", "0.5"],
    ["00.50", "0.50"],
    ["abc", ""],
    ["-20", "20"],
    ["1e5", "15"],
  ])("%j → %j", (raw, out) => {
    expect(sanitizeAmount(raw)).toBe(out);
  });
});

describe("parseAmount / toApiAmount", () => {
  it("parses positive amounts and treats junk as zero", () => {
    expect(parseAmount("12.5")).toBe(12.5);
    expect(parseAmount("")).toBe(0);
    expect(parseAmount("0")).toBe(0);
    expect(parseAmount(".")).toBe(0);
  });
  it("formats two decimals for the API", () => {
    expect(toApiAmount("12.5")).toBe("12.50");
    expect(toApiAmount("7")).toBe("7.00");
  });
});

describe("checkAmount", () => {
  it("requires an amount", () => {
    expect(checkAmount("")).toEqual({ ok: false, message: "Enter an amount" });
  });
  it("blocks amounts over the available balance", () => {
    const r = checkAmount("100.01", { available: 100 });
    expect(r.ok).toBe(false);
  });
  it("allows exactly the available balance", () => {
    expect(checkAmount("100", { available: 100 })).toEqual({ ok: true });
  });
  it("enforces the field maximum", () => {
    expect(checkAmount("1000000.01").ok).toBe(false);
  });
});

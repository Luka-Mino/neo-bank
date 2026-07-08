import { describe, expect, it } from "vitest";
import {
  CLAWBACK_STATUSES,
  isTransitionAllowed,
  isValidAmount,
  ledgerTxType,
} from "./transaction-transitions";

describe("isTransitionAllowed", () => {
  it("allows any starting status for a new row", () => {
    expect(isTransitionAllowed(null, "pending")).toBe(true);
    expect(isTransitionAllowed(undefined, "completed")).toBe(true);
  });

  it("ignores duplicate deliveries of the same status", () => {
    expect(isTransitionAllowed("pending", "pending")).toBe(false);
    expect(isTransitionAllowed("completed", "completed")).toBe(false);
  });

  it("allows normal forward progression", () => {
    expect(isTransitionAllowed("pending", "processing")).toBe(true);
    expect(isTransitionAllowed("processing", "completed")).toBe(true);
    expect(isTransitionAllowed("pending", "failed")).toBe(true);
  });

  it("allows out-of-order arrivals to settle on the reported status", () => {
    // Webhooks are not ordered — a late "pending" after "processing" is legal
    // to apply (status is the source of truth), but not after terminal states.
    expect(isTransitionAllowed("processing", "pending")).toBe(true);
  });

  it("only allows return/reversal paths out of completed (ACH clawback)", () => {
    expect(isTransitionAllowed("completed", "pending_return")).toBe(true);
    expect(isTransitionAllowed("completed", "returned")).toBe(true);
    expect(isTransitionAllowed("completed", "pending_reversal")).toBe(true);
    expect(isTransitionAllowed("completed", "reversed")).toBe(true);
    expect(isTransitionAllowed("completed", "pending")).toBe(false);
    expect(isTransitionAllowed("completed", "failed")).toBe(false);
  });

  it("never leaves hard-terminal states", () => {
    for (const terminal of ["failed", "canceled", "cancelled", "rejected", "invalid", "timed_out", "returned", "reversed"]) {
      expect(isTransitionAllowed(terminal, "completed")).toBe(false);
      expect(isTransitionAllowed(terminal, "pending")).toBe(false);
    }
  });

  it("handles both Dakota spellings of cancelled", () => {
    expect(isTransitionAllowed("canceled", "completed")).toBe(false);
    expect(isTransitionAllowed("cancelled", "completed")).toBe(false);
  });
});

describe("ledgerTxType", () => {
  it("maps Dakota transaction types to ledger types", () => {
    expect(ledgerTxType("onramp")).toBe("deposit");
    expect(ledgerTxType("offramp")).toBe("withdrawal");
    expect(ledgerTxType("swap")).toBe("swap");
  });
});

describe("isValidAmount", () => {
  it("accepts positive decimal strings", () => {
    expect(isValidAmount("1.50")).toBe(true);
    expect(isValidAmount("1000")).toBe(true);
    expect(isValidAmount("0.000001")).toBe(true);
  });

  it("rejects everything an attacker or bug could smuggle into SQL", () => {
    expect(isValidAmount(1.5)).toBe(false); // numbers — intents/receipts use strings
    expect(isValidAmount("0")).toBe(false);
    expect(isValidAmount("-5")).toBe(false);
    expect(isValidAmount("1.5e3")).toBe(false);
    expect(isValidAmount("1.5; DROP TABLE accounts")).toBe(false);
    expect(isValidAmount("")).toBe(false);
    expect(isValidAmount(null)).toBe(false);
    expect(isValidAmount(undefined)).toBe(false);
  });
});

describe("CLAWBACK_STATUSES", () => {
  it("covers exactly the two funds-reversal terminals", () => {
    expect([...CLAWBACK_STATUSES].sort()).toEqual(["returned", "reversed"]);
  });
});

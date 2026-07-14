// Security-regression tests: assert the input-hardening invariants hold so a
// future refactor can't silently loosen them.
import { describe, expect, it } from "vitest";
import { internalTransferSchema } from "./transfer";
import { createTransactionSchema } from "./transaction";

describe("strict money schemas reject unknown fields", () => {
  it("internal transfer rejects an injected field", () => {
    const r = internalTransferSchema.safeParse({
      fromAccountId: "11111111-1111-4111-8111-111111111111",
      toAccountId: "22222222-2222-4222-8222-222222222222",
      amount: "10",
      isAdmin: true, // not in the schema
    });
    expect(r.success).toBe(false);
  });

  it("transaction rejects an injected field", () => {
    const r = createTransactionSchema.safeParse({
      accountId: "11111111-1111-4111-8111-111111111111",
      amount: "10",
      sourceAsset: "USDC",
      destinationId: "dst_1",
      destinationAsset: "USD",
      developer_fee_bps: 9999, // not accepted from the client
    });
    expect(r.success).toBe(false);
  });

  it("internal transfer refuses non-positive and same-account", () => {
    const same = internalTransferSchema.safeParse({
      fromAccountId: "11111111-1111-4111-8111-111111111111",
      toAccountId: "11111111-1111-4111-8111-111111111111",
      amount: "10",
    });
    expect(same.success).toBe(false);

    const zero = internalTransferSchema.safeParse({
      fromAccountId: "11111111-1111-4111-8111-111111111111",
      toAccountId: "22222222-2222-4222-8222-222222222222",
      amount: "0",
    });
    expect(zero.success).toBe(false);
  });
});

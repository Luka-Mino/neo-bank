import { describe, expect, it } from "vitest";
import { createDestinationSchema } from "./recipient";
import { createTransactionSchema } from "./transaction";

const usBank = {
  destinationType: "fiat_us",
  name: "Chase checking",
  abaRoutingNumber: "021000021",
  accountNumber: "987654321",
  accountType: "checking",
  accountHolderName: "Jane Doe",
  bankName: "Chase Bank",
};

describe("createDestinationSchema", () => {
  it("accepts a complete fiat_us destination", () => {
    expect(createDestinationSchema.safeParse(usBank).success).toBe(true);
  });

  it("rejects fiat_us without the Dakota-required holder/bank names", () => {
    for (const missing of [
      "accountHolderName",
      "bankName",
      "abaRoutingNumber",
      "accountNumber",
      "accountType",
    ]) {
      const rest: Record<string, unknown> = { ...usBank };
      delete rest[missing];
      const result = createDestinationSchema.safeParse(rest);
      expect(result.success, `should reject when ${missing} is missing`).toBe(false);
    }
  });

  it("enforces Dakota's 35-char limit on holder and bank names", () => {
    const result = createDestinationSchema.safeParse({
      ...usBank,
      accountHolderName: "A".repeat(36),
    });
    expect(result.success).toBe(false);
  });

  it("accepts a crypto destination and rejects one without an address", () => {
    expect(
      createDestinationSchema.safeParse({
        destinationType: "crypto",
        name: "My wallet",
        cryptoAddress: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        networkId: "base-sepolia",
      }).success
    ).toBe(true);
    expect(
      createDestinationSchema.safeParse({
        destinationType: "crypto",
        name: "My wallet",
      }).success
    ).toBe(false);
  });

  it("requires the full IBAN shape including assets and capabilities", () => {
    const iban = {
      destinationType: "fiat_iban",
      name: "EU account",
      iban: "DE89370400440532013000",
      accountHolderName: "Jane Doe",
      accountHolderAddress: {
        street1: "1 Hauptstr",
        city: "Berlin",
        country: "DE",
      },
      bankName: "Deutsche Bank",
      assets: ["EUR"],
      capabilities: ["swift"],
    };
    expect(createDestinationSchema.safeParse(iban).success).toBe(true);
    expect(
      createDestinationSchema.safeParse({ ...iban, capabilities: [] }).success
    ).toBe(false);
    // BIC without a bank address is rejected (Dakota requires it together)
    expect(
      createDestinationSchema.safeParse({ ...iban, bic: "DEUTDEFF" }).success
    ).toBe(false);
  });
});

describe("createTransactionSchema payment references", () => {
  const base = {
    accountId: "0f8fad5b-d9cb-469f-a165-70867728950e",
    amount: "10.00",
    sourceNetworkId: "base-sepolia",
    sourceAsset: "USDC",
    destinationId: "2LfYm5KMnRvLFtRP7nJJug4zBAN",
    destinationAsset: "USD",
  };

  it("enforces ACH's 18-char alphanumeric reference limit", () => {
    expect(
      createTransactionSchema.safeParse({ ...base, paymentReference: "MONETA 12345" })
        .success
    ).toBe(true);
    expect(
      createTransactionSchema.safeParse({
        ...base,
        paymentReference: "THIS REFERENCE IS FAR TOO LONG FOR ACH",
      }).success
    ).toBe(false);
    expect(
      createTransactionSchema.safeParse({ ...base, paymentReference: "INV-2024" })
        .success
    ).toBe(false); // hyphen not allowed on ACH
  });

  it("allows long references on wire", () => {
    expect(
      createTransactionSchema.safeParse({
        ...base,
        destinationPaymentRail: "fedwire",
        paymentReference: "Invoice #2024-042 — consulting services Q3",
      }).success
    ).toBe(true);
  });
});

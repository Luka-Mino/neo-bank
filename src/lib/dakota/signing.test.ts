import { describe, expect, it } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import {
  canonicalizeIntent,
  getPlatformSignerKey,
  signIntent,
  verifyIntentSignature,
  type SendTransactionIntent,
} from "./signing";

function testKeyPair() {
  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "P-256",
  });
  return {
    privatePem: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
    publicPem: publicKey.export({ type: "spki", format: "pem" }).toString(),
  };
}

const intent: SendTransactionIntent = {
  wallet_id: "2LfTd6QQrUyPKwRR9qMMyk7CMHS",
  caip2: "eip155:84532",
  operation: {
    kind: "transfer",
    from: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    to: "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
    amount: "1.50",
    asset_id: "USDC",
  },
  idempotency_key: "0f8fad5b-d9cb-469f-a165-70867728950e",
};

describe("canonicalizeIntent", () => {
  it("produces RFC 8785 canonical form (sorted keys, no whitespace)", () => {
    expect(canonicalizeIntent(intent)).toBe(
      '{"caip2":"eip155:84532","idempotency_key":"0f8fad5b-d9cb-469f-a165-70867728950e",' +
        '"operation":{"amount":"1.50","asset_id":"USDC",' +
        '"from":"0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA","kind":"transfer",' +
        '"to":"0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"},' +
        '"wallet_id":"2LfTd6QQrUyPKwRR9qMMyk7CMHS"}'
    );
  });

  it("is invariant to key insertion order", () => {
    const reordered = {
      idempotency_key: intent.idempotency_key,
      operation: {
        to: intent.operation.to,
        kind: "transfer",
        asset_id: "USDC",
        amount: "1.50",
        from: intent.operation.from,
      },
      caip2: intent.caip2,
      wallet_id: intent.wallet_id,
    };
    expect(canonicalizeIntent(reordered)).toBe(canonicalizeIntent(intent));
  });

  it("strips undefined optional fields", () => {
    const withUndefined = { ...intent, context_digest: undefined };
    expect(canonicalizeIntent(withUndefined)).toBe(canonicalizeIntent(intent));
    expect(canonicalizeIntent(withUndefined)).not.toContain("context_digest");
  });

  it("throws on null fields instead of signing a bad intent", () => {
    const withNull = { ...intent, context_digest: null };
    expect(() => canonicalizeIntent(withNull)).toThrow(/context_digest.*null/);
  });
});

describe("signIntent / verifyIntentSignature", () => {
  it("roundtrips: a signed intent verifies against the public key", () => {
    const { privatePem, publicPem } = testKeyPair();
    const sig = signIntent(intent, privatePem);
    expect(verifyIntentSignature(intent, sig, publicPem)).toBe(true);
  });

  it("verifies regardless of key insertion order (server re-canonicalizes)", () => {
    const { privatePem, publicPem } = testKeyPair();
    const sig = signIntent(intent, privatePem);
    const reordered = JSON.parse(canonicalizeIntent(intent));
    expect(verifyIntentSignature(reordered, sig, publicPem)).toBe(true);
  });

  it("rejects a tampered intent", () => {
    const { privatePem, publicPem } = testKeyPair();
    const sig = signIntent(intent, privatePem);
    const tampered = {
      ...intent,
      operation: { ...intent.operation, amount: "999.00" },
    };
    expect(verifyIntentSignature(tampered, sig, publicPem)).toBe(false);
  });

  it("rejects a signature from a different key", () => {
    const alice = testKeyPair();
    const mallory = testKeyPair();
    const sig = signIntent(intent, mallory.privatePem);
    expect(verifyIntentSignature(intent, sig, alice.publicPem)).toBe(false);
  });

  it("emits ASN.1 DER (SEQUENCE of two INTEGERs), not raw P1363", () => {
    const { privatePem } = testKeyPair();
    const der = Buffer.from(signIntent(intent, privatePem), "base64");
    expect(der[0]).toBe(0x30); // SEQUENCE
    expect(der[1]).toBe(der.length - 2); // length byte covers the rest
    expect(der[2]).toBe(0x02); // first INTEGER (r)
    const rLen = der[3];
    expect(der[4 + rLen]).toBe(0x02); // second INTEGER (s)
    // P1363 is always exactly 64 raw bytes; DER for P-256 is 68-72
    expect(der.length).toBeGreaterThanOrEqual(68);
    expect(der.length).toBeLessThanOrEqual(72);
  });
});

describe("getPlatformSignerKey", () => {
  it("throws a descriptive error when unset", () => {
    delete process.env.DAKOTA_SIGNER_PRIVATE_KEY;
    expect(() => getPlatformSignerKey()).toThrow(/dakota-bootstrap/);
  });

  it("rejects values that are not base64-encoded PEM", () => {
    process.env.DAKOTA_SIGNER_PRIVATE_KEY = Buffer.from("not a pem").toString("base64");
    try {
      expect(() => getPlatformSignerKey()).toThrow(/PKCS#8 PEM/);
    } finally {
      delete process.env.DAKOTA_SIGNER_PRIVATE_KEY;
    }
  });

  it("decodes a base64-encoded PKCS#8 PEM and the key actually signs", () => {
    const { privatePem, publicPem } = testKeyPair();
    process.env.DAKOTA_SIGNER_PRIVATE_KEY = Buffer.from(privatePem).toString("base64");
    try {
      const sig = signIntent(intent, getPlatformSignerKey());
      expect(verifyIntentSignature(intent, sig, publicPem)).toBe(true);
    } finally {
      delete process.env.DAKOTA_SIGNER_PRIVATE_KEY;
    }
  });
});

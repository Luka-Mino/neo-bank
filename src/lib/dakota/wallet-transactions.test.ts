import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import { sendWalletTransaction } from "./wallet-transactions";
import { verifyIntentSignature } from "./signing";
import { dakota } from "./client";

vi.mock("./client", () => ({
  dakota: { post: vi.fn() },
}));

const mockedPost = vi.mocked(dakota.post);

const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
const publicPem = publicKey.export({ type: "spki", format: "pem" }).toString();

beforeEach(() => {
  process.env.DAKOTA_SIGNER_PRIVATE_KEY = Buffer.from(
    privateKey.export({ type: "pkcs8", format: "pem" }).toString()
  ).toString("base64");
  mockedPost.mockResolvedValue({
    id: "2LfZn6LNoSvMGuSQ0pLLof1OneA",
    resource_type: "wallet",
    wallet_id: "wal123",
    status: "pending",
  });
});

afterEach(() => {
  delete process.env.DAKOTA_SIGNER_PRIVATE_KEY;
  delete process.env.DAKOTA_NETWORK_ID;
  vi.clearAllMocks();
});

const params = {
  walletId: "wal123",
  from: "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  to: "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
  amount: "1.50",
  assetId: "USDC",
  idempotencyKey: "0f8fad5b-d9cb-469f-a165-70867728950e",
};

describe("sendWalletTransaction", () => {
  it("POSTs an endorsed request: signatures + intent at top level, no wrapper", async () => {
    await sendWalletTransaction(params);

    expect(mockedPost).toHaveBeenCalledTimes(1);
    const [path, body, opts] = mockedPost.mock.calls[0] as [
      string,
      { signatures: string[]; intent: Record<string, unknown> },
      { idempotencyKey: string },
    ];

    expect(path).toBe("/wallets/wal123/transactions");
    expect(Object.keys(body).sort()).toEqual(["intent", "signatures"]);
    expect(body.signatures).toHaveLength(1);
    expect(body.intent).toEqual({
      wallet_id: "wal123",
      caip2: "eip155:84532", // base-sepolia default
      operation: {
        kind: "transfer",
        from: params.from,
        to: params.to,
        amount: "1.50",
        asset_id: "USDC",
      },
      idempotency_key: params.idempotencyKey,
    });
    // Same idempotency key rides the HTTP header for safe retries
    expect(opts).toEqual({ idempotencyKey: params.idempotencyKey });
  });

  it("signs the exact intent that is submitted", async () => {
    await sendWalletTransaction(params);
    const [, body] = mockedPost.mock.calls[0] as [
      string,
      { signatures: string[]; intent: object },
    ];
    expect(verifyIntentSignature(body.intent, body.signatures[0], publicPem)).toBe(true);
  });

  it("uses the mainnet CAIP-2 id when networkId is base-mainnet", async () => {
    await sendWalletTransaction({ ...params, networkId: "base-mainnet" });
    const [, body] = mockedPost.mock.calls[0] as [string, { intent: { caip2: string } }];
    expect(body.intent.caip2).toBe("eip155:8453");
  });

  it("fails loudly when the platform signer key is missing", async () => {
    delete process.env.DAKOTA_SIGNER_PRIVATE_KEY;
    await expect(sendWalletTransaction(params)).rejects.toThrow(/dakota-bootstrap/);
    expect(mockedPost).not.toHaveBeenCalled();
  });
});

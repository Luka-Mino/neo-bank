import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { generateKeyPairSync, sign } from "node:crypto";
import { parseEventEnvelope, verifyWebhookSignature } from "./webhooks";

const { privateKey, publicKey } = generateKeyPairSync("ed25519");

function rawPubHex(): string {
  const der = publicKey.export({ type: "spki", format: "der" });
  return Buffer.from(der).subarray(-32).toString("hex");
}

function signPayload(payload: string): string {
  return sign(null, Buffer.from(payload, "utf8"), privateKey).toString("base64");
}

const body = JSON.stringify({
  id: "evt_1",
  type: "transaction.auto.updated",
  created: 1737457500,
  data: { object: { id: "tx_1", status: "completed" } },
});

beforeAll(() => {
  process.env.DAKOTA_WEBHOOK_PUBLIC_KEY = rawPubHex();
});

afterEach(() => {
  process.env.DAKOTA_WEBHOOK_PUBLIC_KEY = rawPubHex();
});

describe("verifyWebhookSignature", () => {
  it("accepts a signature over timestamp + body (no separator)", async () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const sig = signPayload(ts + body);
    expect(await verifyWebhookSignature(body, sig, ts)).toBe(true);
  });

  it("REGRESSION: rejects the old `timestamp.body` dot-separator scheme", async () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const sig = signPayload(`${ts}.${body}`);
    expect(await verifyWebhookSignature(body, sig, ts)).toBe(false);
  });

  it("rejects a tampered body", async () => {
    const ts = String(Math.floor(Date.now() / 1000));
    const sig = signPayload(ts + body);
    const tampered = body.replace('"completed"', '"failed"');
    expect(await verifyWebhookSignature(tampered, sig, ts)).toBe(false);
  });

  it("rejects timestamps outside the 5-minute replay window", async () => {
    const stale = String(Math.floor(Date.now() / 1000) - 600);
    const sig = signPayload(stale + body);
    expect(await verifyWebhookSignature(body, sig, stale)).toBe(false);
  });

  it("rejects garbage timestamps", async () => {
    const sig = signPayload("nan" + body);
    expect(await verifyWebhookSignature(body, sig, "nan")).toBe(false);
  });

  it("rejects signatures from a different key", async () => {
    const { privateKey: otherKey } = generateKeyPairSync("ed25519");
    const ts = String(Math.floor(Date.now() / 1000));
    const sig = sign(null, Buffer.from(ts + body, "utf8"), otherKey).toString("base64");
    expect(await verifyWebhookSignature(body, sig, ts)).toBe(false);
  });
});

describe("parseEventEnvelope", () => {
  it("parses the standard envelope with data.object", () => {
    const envelope = parseEventEnvelope(body);
    expect(envelope.id).toBe("evt_1");
    expect(envelope.type).toBe("transaction.auto.updated");
    expect(envelope.data.object).toEqual({ id: "tx_1", status: "completed" });
  });

  it("lifts the legacy flat shape into data.object", () => {
    const legacy = JSON.stringify({
      event: "customer.kyb_status.updated",
      data: { customer_id: "cst_1", kyb_status: "active" },
    });
    const envelope = parseEventEnvelope(legacy);
    expect(envelope.type).toBe("customer.kyb_status.updated");
    expect(envelope.data.object).toEqual({ customer_id: "cst_1", kyb_status: "active" });
  });

  it("preserves previous_attributes on update envelopes", () => {
    const withPrev = JSON.stringify({
      id: "evt_2",
      type: "transaction.auto.updated",
      created: 1,
      data: { object: { id: "tx_1", status: "completed" }, previous_attributes: { status: "pending" } },
    });
    expect(parseEventEnvelope(withPrev).data.previous_attributes).toEqual({
      status: "pending",
    });
  });
});

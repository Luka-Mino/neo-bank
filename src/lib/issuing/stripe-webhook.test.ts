import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  parseStripeEvent,
  verifyStripeSignature,
} from "@/lib/issuing/stripe-webhook";

const SECRET = "whsec_test_secret";

function sign(body: string, t: number, secret = SECRET): string {
  const v1 = crypto.createHmac("sha256", secret).update(`${t}.${body}`, "utf8").digest("hex");
  return `t=${t},v1=${v1}`;
}

describe("verifyStripeSignature", () => {
  const body = JSON.stringify({ type: "issuing_authorization.request" });
  const now = 1_700_000_000;

  it("accepts a valid, fresh signature", () => {
    expect(verifyStripeSignature(body, sign(body, now), SECRET, now)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const header = sign(body, now);
    expect(verifyStripeSignature(body + "x", header, SECRET, now)).toBe(false);
  });

  it("rejects a wrong secret", () => {
    expect(verifyStripeSignature(body, sign(body, now, "whsec_other"), SECRET, now)).toBe(false);
  });

  it("rejects a stale timestamp (replay guard)", () => {
    const old = now - 3600;
    expect(verifyStripeSignature(body, sign(body, old), SECRET, now)).toBe(false);
  });

  it("rejects a missing or malformed header", () => {
    expect(verifyStripeSignature(body, null, SECRET, now)).toBe(false);
    expect(verifyStripeSignature(body, "garbage", SECRET, now)).toBe(false);
    expect(verifyStripeSignature(body, `t=${now}`, SECRET, now)).toBe(false);
  });

  it("accepts when any of multiple v1s matches (secret rotation)", () => {
    const good = crypto.createHmac("sha256", SECRET).update(`${now}.${body}`, "utf8").digest("hex");
    const header = `t=${now},v1=deadbeef,v1=${good}`;
    expect(verifyStripeSignature(body, header, SECRET, now)).toBe(true);
  });

  it("returns false with no secret", () => {
    expect(verifyStripeSignature(body, sign(body, now), "", now)).toBe(false);
  });
});

describe("parseStripeEvent", () => {
  it("parses a well-formed event", () => {
    expect(parseStripeEvent('{"type":"issuing_authorization.request"}')?.type).toBe(
      "issuing_authorization.request"
    );
  });

  it("returns null for invalid JSON or a typeless object", () => {
    expect(parseStripeEvent("{not json")).toBeNull();
    expect(parseStripeEvent('{"foo":1}')).toBeNull();
  });
});

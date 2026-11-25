import { beforeAll, describe, expect, it } from "vitest";
import { encryptField, decryptField, tryDecryptField } from "./field";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-auth-secret-16chars-plus";
});

describe("field encryption", () => {
  it("roundtrips and hides the plaintext", () => {
    const blob = encryptField("+1 415 555 0199", "phone");
    expect(blob).not.toContain("415");
    expect(decryptField(blob, "phone")).toBe("+1 415 555 0199");
  });

  it("is domain-separated by purpose (wrong purpose fails)", () => {
    const blob = encryptField("secret-value", "phone");
    expect(() => decryptField(blob, "bank")).toThrow();
  });

  it("rejects a truncated auth tag", () => {
    const [iv, ct, tag] = encryptField("secret-value", "phone").split(".");
    const short = Buffer.from(tag, "base64").subarray(0, 4).toString("base64");
    expect(() => decryptField([iv, ct, short].join("."), "phone")).toThrow();
  });

  it("fresh IV each call", () => {
    expect(encryptField("x", "phone")).not.toBe(encryptField("x", "phone"));
  });

  it("tryDecryptField returns null on malformed/legacy values", () => {
    expect(tryDecryptField("not-a-blob", "phone")).toBeNull();
    expect(tryDecryptField(null, "phone")).toBeNull();
  });
});

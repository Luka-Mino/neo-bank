import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-for-totp-encryption";
});

describe("totp secret encryption", () => {
  it("roundtrips a secret", async () => {
    const { encryptSecret, decryptSecret } = await import("./totp");
    const blob = encryptSecret("JBSWY3DPEHPK3PXP");
    expect(blob).not.toContain("JBSWY3DPEHPK3PXP");
    expect(decryptSecret(blob)).toBe("JBSWY3DPEHPK3PXP");
  });

  it("produces a different blob every time (fresh IV)", async () => {
    const { encryptSecret } = await import("./totp");
    expect(encryptSecret("JBSWY3DPEHPK3PXP")).not.toBe(
      encryptSecret("JBSWY3DPEHPK3PXP")
    );
  });

  it("rejects tampered ciphertext", async () => {
    const { encryptSecret, decryptSecret } = await import("./totp");
    const [iv, ct, tag] = encryptSecret("JBSWY3DPEHPK3PXP").split(".");
    const flipped = Buffer.from(ct, "base64");
    flipped[0] ^= 0xff;
    expect(() =>
      decryptSecret([iv, flipped.toString("base64"), tag].join("."))
    ).toThrow();
  });

  it("rejects malformed blobs", async () => {
    const { decryptSecret } = await import("./totp");
    expect(() => decryptSecret("not-a-blob")).toThrow();
  });
});

describe("totp verification", () => {
  it("accepts the current code and rejects wrong ones", async () => {
    const { generateTotpSecret, verifyTotpCode, currentTotpCode } =
      await import("./totp");
    const { base32Secret, otpauthUrl } = generateTotpSecret("user@moneta.test");

    expect(otpauthUrl).toContain("otpauth://totp/");
    expect(otpauthUrl).toContain("issuer=Moneta");

    const good = currentTotpCode(base32Secret);
    expect(verifyTotpCode(base32Secret, good)).toBe(true);
    expect(verifyTotpCode(base32Secret, "000000")).toBe(false);
    expect(verifyTotpCode(base32Secret, "abc123")).toBe(false);
    expect(verifyTotpCode(base32Secret, "12345")).toBe(false);
  });
});

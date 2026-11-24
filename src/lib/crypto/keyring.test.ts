// Keys separate from AUTH_SECRET (PRE-DAKOTA-PLAN C3). The point is rotation
// without lockouts: values written before the keyring existed keep working,
// new values name their key, and AUTH_SECRET can change once its old value is
// listed as `legacy`.
import { afterEach, describe, expect, it } from "vitest";
import { currentKey, keyring, parseKeyring } from "./keyring";
import { decryptField, encryptField } from "./field";
import { decryptSecret, encryptSecret } from "@/lib/auth/totp";
import { hashInviteToken, inviteTokenHashCandidates } from "@/lib/orgs";
import { hashPayload, payloadHashMatches } from "@/lib/approvals";
import { deviceFingerprint } from "@/lib/auth/login-devices";

const A = "auth-secret-A-0123456789abcdef";
const B = "auth-secret-B-0123456789abcdef";
const K1 = "k1-material-0123456789abcdef0123456789";
const K2 = "k2-material-0123456789abcdef0123456789";

const saved = { ...process.env };
function setEnv(env: Record<string, string | undefined>) {
  for (const k of ["AUTH_SECRET", "FIELD_ENCRYPTION_KEYS", "HMAC_KEYS"]) delete process.env[k];
  for (const [k, v] of Object.entries(env)) if (v !== undefined) process.env[k] = v;
}
afterEach(() => {
  process.env = { ...saved };
});

describe("parseKeyring", () => {
  it("parses id:secret lists, current first", () => {
    expect(parseKeyring(`k2:${K2}, k1:${K1}`, "HMAC_KEYS")).toEqual([
      { id: "k2", material: K2 },
      { id: "k1", material: K1 },
    ]);
  });

  it("rejects short keys, bad ids and duplicates", () => {
    expect(() => parseKeyring("k1:short", "HMAC_KEYS")).toThrow(/at least 32/);
    expect(() => parseKeyring(`bad id:${K1}`, "HMAC_KEYS")).toThrow(/bad key id/);
    expect(() => parseKeyring(`k1:${K1},k1:${K2}`, "HMAC_KEYS")).toThrow(/duplicate/);
  });

  it("allows a short explicit legacy entry (an old AUTH_SECRET)", () => {
    expect(parseKeyring("legacy:sixteen-chars-ok", "HMAC_KEYS")).toEqual([{ id: "legacy", material: "sixteen-chars-ok" }]);
  });
});

describe("keyring", () => {
  it("defaults to the legacy AUTH_SECRET entry, matching pre-keyring behaviour", () => {
    expect(keyring("HMAC_KEYS", { AUTH_SECRET: A })).toEqual([{ id: "legacy", material: A }]);
  });

  it("appends the implicit legacy entry after configured keys", () => {
    const ring = keyring("FIELD_ENCRYPTION_KEYS", { AUTH_SECRET: A, FIELD_ENCRYPTION_KEYS: `k1:${K1}` });
    expect(ring.map((k) => k.id)).toEqual(["k1", "legacy"]);
    expect(currentKey("FIELD_ENCRYPTION_KEYS", { AUTH_SECRET: A, FIELD_ENCRYPTION_KEYS: `k1:${K1}` }).id).toBe("k1");
  });

  it("an explicit legacy entry overrides AUTH_SECRET", () => {
    const ring = keyring("HMAC_KEYS", { AUTH_SECRET: B, HMAC_KEYS: `k1:${K1},legacy:${A}` });
    expect(ring).toEqual([
      { id: "k1", material: K1 },
      { id: "legacy", material: A },
    ]);
  });
});

describe("encryption across key changes", () => {
  it("reads blobs written before the keyring, and prefixes new ones", () => {
    setEnv({ AUTH_SECRET: A });
    const oldTotp = encryptSecret("JBSWY3DPEHPK3PXP");
    const oldPhone = encryptField("+15555550123", "phone");
    expect(oldTotp).not.toContain("$"); // legacy format, unchanged

    setEnv({ AUTH_SECRET: A, FIELD_ENCRYPTION_KEYS: `k1:${K1}` });
    expect(decryptSecret(oldTotp)).toBe("JBSWY3DPEHPK3PXP");
    expect(decryptField(oldPhone, "phone")).toBe("+15555550123");
    const newTotp = encryptSecret("JBSWY3DPEHPK3PXP");
    expect(newTotp.startsWith("k1$")).toBe(true);
    expect(decryptSecret(newTotp)).toBe("JBSWY3DPEHPK3PXP");
  });

  it("survives an AUTH_SECRET rotation when the old value is listed as legacy", () => {
    setEnv({ AUTH_SECRET: A });
    const oldTotp = encryptSecret("JBSWY3DPEHPK3PXP");

    setEnv({ AUTH_SECRET: B }); // rotated carelessly: old blobs break
    expect(() => decryptSecret(oldTotp)).toThrow();

    setEnv({ AUTH_SECRET: B, FIELD_ENCRYPTION_KEYS: `k1:${K1},legacy:${A}` }); // the runbook way
    expect(decryptSecret(oldTotp)).toBe("JBSWY3DPEHPK3PXP");
  });

  it("can't read a blob whose key was removed", () => {
    setEnv({ AUTH_SECRET: A, FIELD_ENCRYPTION_KEYS: `k1:${K1}` });
    const blob = encryptField("x", "phone");
    setEnv({ AUTH_SECRET: A, FIELD_ENCRYPTION_KEYS: `k2:${K2}` });
    expect(() => decryptField(blob, "phone")).toThrow(/no key with id "k1"/);
  });
});

describe("hashes across key changes", () => {
  it("invite tokens hashed under the old key still match", () => {
    setEnv({ AUTH_SECRET: A });
    const stored = hashInviteToken("invite-token");
    setEnv({ AUTH_SECRET: A, HMAC_KEYS: `k1:${K1}` });
    expect(hashInviteToken("invite-token")).not.toBe(stored); // new writes use k1
    expect(inviteTokenHashCandidates("invite-token")).toContain(stored);
  });

  it("approval payload hashes verify under any key, and reject tampering", () => {
    setEnv({ AUTH_SECRET: A });
    const payload = { amount: "10", toAccountId: "x" };
    const stored = hashPayload(payload);
    setEnv({ AUTH_SECRET: A, HMAC_KEYS: `k1:${K1}` });
    expect(payloadHashMatches(payload, stored)).toBe(true);
    expect(payloadHashMatches({ ...payload, amount: "1000" }, stored)).toBe(false);
  });

  it("device fingerprints are unchanged for the legacy key", () => {
    setEnv({ AUTH_SECRET: A });
    const before = deviceFingerprint("u1", "UA", "10.1.2.3");
    expect(deviceFingerprint("u1", "UA", "10.1.2.3", A)).toBe(before);
  });
});

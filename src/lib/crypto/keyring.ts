// Versioned key material, separate from AUTH_SECRET (PRE-DAKOTA-PLAN C3).
//
// Two keyrings, each an env list of `id:secret` entries, first = current:
//   FIELD_ENCRYPTION_KEYS  encryption at rest (2FA secrets, phone numbers)
//   HMAC_KEYS              keyed hashes (backup codes, invite tokens,
//                          approval payloads, device fingerprints)
// e.g. FIELD_ENCRYPTION_KEYS="k2:<random ≥32 chars>,k1:<older>"
//
// Every ring also holds a `legacy` entry: by default the current AUTH_SECRET,
// which is exactly how values were derived before this module, so nothing
// already stored breaks. To rotate AUTH_SECRET (sessions) without locking
// anyone out, list its OLD value explicitly as `legacy:<old AUTH_SECRET>` in
// both rings, then change AUTH_SECRET. See DR-RUNBOOK.md "Secret rotation".
//
// Writes use the current entry. Encrypted values record their key id; hashes
// are checked against every entry.

export type KeyringName = "FIELD_ENCRYPTION_KEYS" | "HMAC_KEYS";
export type KeyEntry = { id: string; material: string };

export const LEGACY_KEY_ID = "legacy";
const ID = /^[A-Za-z0-9_-]{1,32}$/;
const MIN_MATERIAL = 32;

/** Parse `id:secret,id:secret`. Throws on malformed config (fail at boot, not at use). */
export function parseKeyring(raw: string | undefined, name: KeyringName): KeyEntry[] {
  if (!raw || !raw.trim()) return [];
  const seen = new Set<string>();
  return raw.split(",").map((part) => {
    const at = part.indexOf(":");
    const id = part.slice(0, at).trim();
    const material = part.slice(at + 1).trim();
    if (at <= 0 || !ID.test(id)) throw new Error(`${name}: bad key id in entry ${seen.size + 1}`);
    if (seen.has(id)) throw new Error(`${name}: duplicate key id "${id}"`);
    // The legacy entry is an old AUTH_SECRET, which may be shorter.
    if (id !== LEGACY_KEY_ID && material.length < MIN_MATERIAL) {
      throw new Error(`${name}: key "${id}" must be at least ${MIN_MATERIAL} characters`);
    }
    if (!material) throw new Error(`${name}: key "${id}" is empty`);
    seen.add(id);
    return { id, material };
  });
}

/** All entries, current first, with the implicit legacy (AUTH_SECRET) entry appended. */
export function keyring(name: KeyringName, env: Record<string, string | undefined> = process.env): KeyEntry[] {
  const entries = parseKeyring(env[name], name);
  if (!entries.some((e) => e.id === LEGACY_KEY_ID) && env.AUTH_SECRET) {
    entries.push({ id: LEGACY_KEY_ID, material: env.AUTH_SECRET });
  }
  if (entries.length === 0) throw new Error(`${name} and AUTH_SECRET are both unset`);
  return entries;
}

export function currentKey(name: KeyringName, env?: Record<string, string | undefined>): KeyEntry {
  return keyring(name, env)[0];
}

export function keyById(name: KeyringName, id: string, env?: Record<string, string | undefined>): KeyEntry {
  const key = keyring(name, env).find((k) => k.id === id);
  if (!key) throw new Error(`${name}: no key with id "${id}"`);
  return key;
}

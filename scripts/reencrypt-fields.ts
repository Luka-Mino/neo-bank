/**
 * Re-encrypt stored secrets under the CURRENT FIELD_ENCRYPTION_KEYS key, so an
 * older key (including the implicit `legacy` AUTH_SECRET one) can be removed
 * from the keyring afterwards. See DR-RUNBOOK.md "Secret rotation".
 *
 *   npm run keys:reencrypt            # dry run: counts only
 *   npm run keys:reencrypt -- --apply # rewrite rows, one transaction
 *
 * Covers users.totp_secret (2FA seeds) and users.phone. Hashed values (backup
 * codes, invites, approvals, device fingerprints) can't be re-keyed: they keep
 * verifying under old HMAC_KEYS entries until they're used up or expire.
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"] });

async function main() {
  const apply = process.argv.includes("--apply");
  // Dynamic imports: the db module connects at import time, after dotenv.
  const { db } = await import("../src/lib/db");
  const { users } = await import("../src/lib/db/schema");
  const { currentKey } = await import("../src/lib/crypto/keyring");
  const { decryptSecret, encryptSecret } = await import("../src/lib/auth/totp");
  const { decryptField, encryptField } = await import("../src/lib/crypto/field");
  const { eq, isNotNull, or } = await import("drizzle-orm");

  const current = currentKey("FIELD_ENCRYPTION_KEYS");
  const onCurrent = (blob: string) =>
    current.id === "legacy" ? !blob.includes("$") : blob.startsWith(`${current.id}$`);

  const rows = await db
    .select({ id: users.id, totpSecret: users.totpSecret, phone: users.phone })
    .from(users)
    .where(or(isNotNull(users.totpSecret), isNotNull(users.phone)));

  let totp = 0;
  let phone = 0;
  let failed = 0;
  const updates: { id: string; totpSecret?: string; phone?: string }[] = [];
  for (const row of rows) {
    const u: { id: string; totpSecret?: string; phone?: string } = { id: row.id };
    try {
      if (row.totpSecret && !onCurrent(row.totpSecret)) {
        u.totpSecret = encryptSecret(decryptSecret(row.totpSecret));
        totp++;
      }
      if (row.phone && !onCurrent(row.phone)) {
        u.phone = encryptField(decryptField(row.phone, "phone"), "phone");
        phone++;
      }
    } catch (e) {
      failed++;
      console.error(`user ${row.id}: can't decrypt (${e instanceof Error ? e.message : e}); left unchanged`);
      continue;
    }
    if (u.totpSecret || u.phone) updates.push(u);
  }

  console.log(`current key: ${current.id}`);
  console.log(`to re-encrypt: ${totp} 2FA secret(s), ${phone} phone number(s); ${failed} unreadable`);
  if (!apply) {
    console.log("dry run: nothing written. Re-run with --apply.");
    process.exit(0);
  }

  await db.transaction(async (tx) => {
    for (const u of updates) {
      const { id, ...set } = u;
      await tx.update(users).set({ ...set, updatedAt: new Date() }).where(eq(users.id, id));
    }
  });
  console.log(`done: ${updates.length} user row(s) updated.`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

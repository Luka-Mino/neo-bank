# Disaster Recovery Runbook

> Backend recovery procedures for Moneta. Review quarterly. Owner: eng.

## Data stores

| Store | What | Backups |
|---|---|---|
| Supabase Postgres (project `jrjnfpuhevuputxupdgm`) | all app + money data | Supabase automated daily backups (Pro plan); PITR available |
| Local Postgres (`~/.moneta-pgdata`, dev only) | disposable dev data | none needed |
| Vercel | app hosting, env vars (secrets) | env vars are the source of truth; keep an offline copy of the signer key |

## Backups

- **Cadence:** Supabase Pro takes daily automated backups with point-in-time
  recovery. Verify in the Supabase dashboard → Database → Backups.
- **Retention:** per Supabase plan (typically 7 days daily + PITR window).
- **Manual snapshot before risky migrations:** `pg_dump "$OWNER_DATABASE_URL" > backup-$(date +%F).sql`. Use the **owner** connection (the one migrations use), never `DATABASE_URL`. Since migration 0021, `DATABASE_URL` is the restricted `moneta_app` role, and `pg_dump` as that role fails ("permission denied for schema drizzle"; row-level security would hide rows anyway). Confirmed in the 2026-11-24 drill.

## Restore procedures

### Full database restore (Supabase)
1. Supabase dashboard → Database → Backups → choose a point in time.
2. Restore into the same project (or a new one if corruption is suspected).
3. If a new project: run `scripts/sql/db-roles.sql` there (new passwords),
   then update `DATABASE_URL` (moneta_app) and `SYSTEM_DATABASE_URL`
   (moneta_system) in the host's env and local `.env.local`, and redeploy.
   Restoring into the same project keeps the roles.
4. Run `npx drizzle-kit migrate` to confirm schema is current.
5. Verify: `curl https://<app>/api/health` returns `{"status":"ok"}` with
   `"databaseRoles": "ok"` (row-level security posture).
6. Run the ledger-drift and stuck-transaction checks:
   `GET /api/maintenance/cleanup` with `Authorization: Bearer $CRON_SECRET`
   → `ledgerDrift: 0`. Note it also purges expired tokens and old webhook
   events; that's harmless, but it isn't read-only.

### Restore from a manual pg_dump
```
createdb moneta_restore
psql "$OWNER_URL/moneta_restore" < backup-YYYY-MM-DD.sql
# On a NEW server only: the restore prints "role moneta_app does not exist"
# for each GRANT (expected). Then create the roles, which also re-applies grants:
psql "$OWNER_URL/moneta_restore" -v ON_ERROR_STOP=1 < scripts/sql/db-roles.sql   # passwords replaced
DATABASE_URL="$OWNER_URL/moneta_restore" npx drizzle-kit migrate   # must no-op
```
Then check:
- Row-level security survived: `select relname from pg_class where relname in ('accounts','transactions') and relrowsecurity and relforcerowsecurity;` returns both rows (11 tables in all).
- The audit log is still append-only: as `moneta_app`, `update audit_log …` gives "permission denied".
- Row counts match the source for `users`, `accounts`, `transactions`.
- Point `DATABASE_URL` (moneta_app) and `SYSTEM_DATABASE_URL` at the restore, then run the health and drift checks. On a non-production copy, the integration tests can run against it too (`INTEGRATION=1 RLS_REQUIRED=1 npx vitest run --dir src --testNamePattern integration`).

### Drill log
| Date | Drill | Result |
|---|---|---|
| 2026-11-24 | Local: `pg_dump` (owner) → restore into a new DB on the same server, and into a brand-new server | Both restored: 22 migrations, RLS + FORCE on all 11 tables, audit trigger, matching row counts, all 16 integration tests pass as `moneta_app`. Found and fixed in this runbook: backups must use the owner URL (the app role fails); a new server needs `db-roles.sql` after the restore. Not drilled: Supabase dashboard restore (no hosted DB yet) |

### Signer key loss (Dakota)
The platform signer private key (`DAKOTA_SIGNER_PRIVATE_KEY`) is **not
recoverable** if lost — it only exists in env/secret storage. Keep an
encrypted offline copy. If truly lost: generate a new keypair via
`npm run dakota:bootstrap`, register the new signer/group with Dakota, and
re-provision wallet policies. Existing wallets keep working only if the new
signer is added to their signer group before the old one is detached.

## Secret rotation

Scheduled rotation every **90 days**, and immediately on any suspected
exposure. Record each rotation (date, who, which secret) in the incident log.
Put new values into Vercel (Production and Preview) yourself. Never paste
them in chat or commit them. Checked 2026-11-24: no `.env*` file has ever
been committed (`git log --all -- .env.local` is empty).

| Secret | Rotate | How | Watch out for |
|---|---|---|---|
| `DAKOTA_API_KEY` | 90 days | New key in Dakota's dashboard → Vercel → redeploy → revoke the old key | Brief overlap is fine; revoke only after the deploy is live |
| `DAKOTA_WEBHOOK_PUBLIC_KEY` | When Dakota rotates its signing key | Update Vercel, redeploy | Events signed with the old key fail verification; `npm run dakota:reconcile` backfills them |
| `RESEND_API_KEY` / `SMTP_URL` | 90 days | New key → Vercel → redeploy → revoke the old one | — |
| `CRON_SECRET` | 90 days | New random value in Vercel (crons read it from env) | — |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | Only if abused | New DSN in Sentry | The DSN is public by design; it only allows sending events |
| Upstash (`UPSTASH_REDIS_REST_TOKEN`) | 90 days | New token in Upstash → Vercel | A missing or invalid token makes rate limits fall back and raise an ops alert |
| `DATABASE_URL` password | 90 days | Rotate in Supabase → Vercel → redeploy | Update `MIGRATION_DATABASE_URL` too once it exists (plan C1) |
| `DAKOTA_SIGNER_PRIVATE_KEY` | **Only on exposure** | See "Signer key loss" above: add the new signer to every signer group **before** detaching the old one | Detaching a wallet's last signer group bricks the wallet |
| `FIELD_ENCRYPTION_KEYS` | Yearly, or on exposure | Prepend a new `id:secret` (≥32 random chars), deploy, run `npm run keys:reencrypt -- --apply` with the owner DB URL, then drop the old entry | Never drop an entry before re-encrypting: blobs name their key id and become unreadable without it |
| `HMAC_KEYS` | Yearly, or on exposure | Prepend a new `id:secret`, deploy. Keep old entries until what they hashed has expired | Hashes can't be re-keyed: backup codes (until users regenerate), pending invites and approvals (until they expire). Device fingerprints re-stamp themselves at the next sign-in |
| `AUTH_SECRET` | 90 days, or on exposure, with the steps below | See below | Since 2026-11-24 it's only the session key plus the implicit `legacy` keyring entry for data written before the keyrings existed (`src/lib/crypto/keyring.ts`) |

### Rotating `AUTH_SECRET` safely

`AUTH_SECRET` used to root 2FA and phone encryption, backup-code hashes,
invite and approval hashes and device fingerprints. Those now use the
`FIELD_ENCRYPTION_KEYS` and `HMAC_KEYS` keyrings (`src/lib/crypto/keyring.ts`).
Data written before the keyrings existed still uses the old `AUTH_SECRET`
through the keyrings' implicit `legacy` entry, so keep that value reachable:

1. Copy the **current** `AUTH_SECRET` value.
2. Add it as `legacy:<that value>` at the **end** of both `FIELD_ENCRYPTION_KEYS`
   and `HMAC_KEYS`. If a keyring is empty, put a new key first, e.g.
   `k1:<random ≥32 chars>,legacy:<old value>`.
3. Set the new `AUTH_SECRET` and redeploy. Everyone is signed out once
   (sessions are signed with it); nothing else breaks. A malformed keyring
   fails at startup (`validateSecretsAtStartup`), not at sign-in.
4. Optional, to stop depending on the old value for encryption: run
   `npm run keys:reencrypt -- --apply` with the owner DB URL, then remove
   `legacy:` from `FIELD_ENCRYPTION_KEYS`. Keep it in `HMAC_KEYS` until old
   backup codes are regenerated and pending invites and approvals expire.
5. Check that a 2FA login and a phone-number read work, then record the rotation.

Tested 2026-11-24 (`src/lib/crypto/keyring.test.ts` and a re-encryption run
on a copy of the dev DB): after re-encrypting, a 2FA secret decrypts with only
the new key and a different `AUTH_SECRET`.

## Recovery objectives

- **RPO (max data loss):** ≤ 24h (daily backups) — tighter with PITR.
- **RTO (max downtime):** ≤ 1h for a Supabase restore + Vercel redeploy.

## Post-incident checklist

- [ ] `/api/health` green
- [ ] Ledger drift = 0
- [ ] Latest migration applied (`drizzle-kit migrate` no-ops)
- [ ] Webhook reconcile caught up (`npm run dakota:reconcile`)
- [ ] Audit log continuous (no suspicious gap around the incident)
- [ ] Rotate any secret that may have been exposed during recovery

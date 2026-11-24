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
- **Manual snapshot before risky migrations:** `pg_dump "$DATABASE_URL" > backup-$(date +%F).sql`

## Restore procedures

### Full database restore (Supabase)
1. Supabase dashboard → Database → Backups → choose a point in time.
2. Restore into the same project (or a new one if corruption is suspected).
3. If a new project: update `DATABASE_URL` in Vercel env + local `.env.local`,
   redeploy.
4. Run `npx drizzle-kit migrate` to confirm schema is current.
5. Verify: `curl https://<app>/api/health` returns `{"status":"ok"}`.
6. Run the ledger-drift check: `GET /api/maintenance/cleanup` → `ledgerDrift: 0`.

### Restore from a manual pg_dump
```
createdb moneta_restore
psql moneta_restore < backup-YYYY-MM-DD.sql
# point DATABASE_URL at moneta_restore, run health + drift checks
```

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
| `AUTH_SECRET` | **Only on exposure, with the steps below** | See below | **Not a plain session key.** It also roots: the AES key for stored TOTP secrets (`src/lib/auth/totp.ts`), field encryption for phone numbers (`src/lib/crypto/field.ts`), the backup-code hash pepper (`src/lib/auth/backup-codes.ts`), invite-token HMACs (`src/lib/orgs.ts`), approval payload hashes (`src/lib/approvals.ts`) and device fingerprints (`src/lib/auth/login-devices.ts`) |

### Rotating `AUTH_SECRET` safely

Swapping it alone would sign everyone out (fine), but also:
- make every stored 2FA secret and phone number undecryptable, locking out every user with an authenticator app;
- make every 2FA backup code stop matching (they're stored as peppered hashes, so they can't be re-keyed);
- invalidate every pending team invite and fail the integrity check on every pending approval;
- change every device fingerprint, so every next sign-in sends a "new device" alert.

Until separate, versioned keys exist (follow-up in `PRE-DAKOTA-PLAN.md` C3), do this:
1. Announce a short maintenance window.
2. Run a one-off script that, in one transaction, decrypts each `users.totp_secret` and each encrypted phone number with the old key and re-encrypts it with the new one.
3. Delete all 2FA backup codes and email the affected users to generate new ones in Settings.
4. Expire pending invitations (the inviters re-send them) and reject pending approval requests (the requesters re-submit).
5. Pause "new sign-in" alerts for 7 days, or warn users to expect one.
6. Set the new `AUTH_SECRET` in Vercel and redeploy.
7. Check that a 2FA login and a phone-number read work, then record the rotation.

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

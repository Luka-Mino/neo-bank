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

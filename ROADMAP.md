# Moneta Roadmap

> Updated 2026-07-10. The deep Dakota integration reference is
> `DAKOTA-PLAN.md` (API sequences, gotchas, module designs). This file is the
> working queue: what we're building, in what order, and what it's waiting on.
> Parked ideas live in `BACKLOG.md`.

## Where we are

**All credential-free engineering is done** (through commit `54b745f`,
75 passing tests): signing core, webhook pipeline, provisioning, bootstrap,
two-leg withdrawals, client hardening (throttle/retry/Retry-After), events
reconciliation (retry phase + cursor sweep, `npm run dakota:reconcile` or
`POST /api/dakota/reconcile`), and money-flow UI wired to real shapes
(LinkBankDialog → fiat_us destinations, fee-honest transfer-out, deposit
provisioning state, PoA prompts, receipt breakdown). Security review: clean;
hardening applied (timingSafeEqual cron auth, destination ownership check).

**The pipeline is drill-verified** on a local Postgres 16 (see "Local dev
DB" below): simulated deposit lifecycle credits exactly once, dedupes
replays, survives duplicate deliveries, and claws back ACH returns exactly
once — this drill caught and fixed a real pool self-deadlock in the webhook
handlers (`logStatusChange` now takes the caller's tx).

**Blocked on two things, both external:**
1. **Dakota sandbox credentials** (email was expected ~2026-07-09 — chase it).
   `DAKOTA_API_KEY` in `.env.local` is still a placeholder.
2. **The Supabase dev database is unreachable** ("tenant not found" —
   project likely paused or deleted; discovered 2026-07-10). Decide: restore
   it in the Supabase dashboard, or stay on the local Postgres.

## Local dev DB (since 2026-07-10)

Supabase being dead, dev now runs on Homebrew PostgreSQL 16:
- Data dir `~/.moneta-pgdata`, port `54321`, superuser `moneta`, db `moneta`.
- Start after reboot:
  `/opt/homebrew/opt/postgresql@16/bin/pg_ctl -D ~/.moneta-pgdata -o "-p 54321" -l ~/.moneta-pgdata/server.log start`
- `.env.local` points `DATABASE_URL` here (old Supabase URL kept commented).
- Migrations 0000–0004 applied. Drill seed user exists
  (`drill@moneta.test`, account `2222…`, onramp rail `acct_drill_…`).
- `DAKOTA_WEBHOOK_PUBLIC_KEY` is set to the **dev simulator key**; the real
  sandbox key is commented above it — swap back for real Dakota webhooks.

**Repeat the drill anytime** (dev server on :3001):
fixtures in `fixtures/dakota/` with `REPLACE_WITH_DAKOTA_ACCOUNT_ID` swapped
to the seeded rail id, then
`npx tsx scripts/dakota-simulate-webhook.ts --file <fixture> --url http://localhost:3001/api/webhooks/dakota`
(pending → completed → completed again → returned; balance should go
0 → 1.49 → 1.49 → 0).

## Workstream A — done (was: buildable right now)

All six items shipped: withdrawal orchestration (`d31ac2c`), destination
client fixes (`d31ac2c`), client hardening (`5d0e438`), events
reconciliation (`a929e33`), frontend wiring (`536567d`), legal pages
(`/terms`, `/privacy` — shipped with the design overhaul).

## Workstream B — the moment sandbox credentials arrive

Exact sequence (≈30 minutes):
1. Dashboard → create sandbox API key → `DAKOTA_API_KEY` in `.env.local`.
2. DB: local Postgres already migrated through 0004. (If back on Supabase:
   `npx drizzle-kit migrate`.)
3. `npm run dakota:bootstrap` — first run mints the platform signer key
   (paste env line), second run registers signer/group/policy and prints
   `DAKOTA_SIGNER_GROUP_ID` / `DAKOTA_POLICY_ID`.
4. Restore the real `DAKOTA_WEBHOOK_PUBLIC_KEY` (commented in `.env.local`),
   `BYPASS_KYC=false`, `NEXT_PUBLIC_DEMO_MODE=false`.
5. Webhooks: public tunnel (`cloudflared tunnel --url http://localhost:3001`)
   + re-run bootstrap with `--url`, or lean on `npm run dakota:reconcile`
   (no tunnel needed — pulls GET /events; also verify the sweep's event
   ordering assumption, see `orderingSuspect` in reconcile.ts).
6. **End-to-end drill**: fresh signup → onboarding creates real customer →
   hosted KYC (sandbox auto-approves ~5s) → webhook provisions wallet + rails
   → deposit page shows real virtual account numbers →
   `POST /sandbox/simulate/inbound` ($1.50 ACH) → balance credits →
   withdrawal of $1 end-to-end → simulate an ACH return → clawback shows.
   ($2/txn sandbox cap applies to everything.)

## Workstream C — after sandbox proves out

- Recipients UX polish; external crypto sends (compliance-block handling).
- `developer_fee_bps` revenue configuration + fee display.
- Rate-limit telemetry, Sentry, structured logs (see BACKLOG infra items).
- Production cutover per `DAKOTA-PLAN.md` §7 Phase 6 (mainnet network IDs,
  prod keys + webhook target, signer key into a secrets manager, KYC bypass
  and demo mode hard-off, low-value live tests first).

## Separate workstreams (not Dakota — need their own partners)

- **Cards** (currently mocked UI): requires a card-issuing partner
  (Lithic / Marqeta / Stripe Issuing). Virtual cards first, physical later.
  Real design work: millisecond authorization against our ledger + settlement
  prefunding swept from Dakota. Not started; do not conflate with Dakota work.
- **Yield/APY on savings**: treasury partner + regulatory review. Parked.
- **Loans**: page is a coming-soon stub. Parked.
- **Direct deposit of paychecks**: structurally already works (per-user
  virtual account numbers accept ACH credits) — this is a positioning/UX
  feature more than an engineering one once deposits are live.

## Launch-ready definition (MVP)

A customer can: sign up → verify identity → get personal account & routing
numbers → receive/deposit USD → hold balance in buckets → send instantly to
other Moneta users → pay any US bank account (ACH/wire, clean statement
reference) → see honest receipts, including fees and any returned payments —
with legal pages, PoA flow, and production monitoring in place.

# Moneta Roadmap

> Updated 2026-07-10 (evening). This is the master plan: what we're building,
> how each piece gets done, and the definition of done for every milestone.
> Deep Dakota reference: `DAKOTA-PLAN.md`. Parked ideas: `BACKLOG.md`.
> Session context for future work: `HANDOFF.md`.

## The goal — what "achieved" looks like

A stranger with no help from us can: visit the site → open an account →
verify identity → receive personal account & routing numbers → deposit USD
by ACH/wire → hold balances in named accounts → send instantly to other
Moneta users → pay any US bank account → see honest receipts including fees
and returned payments — on a production domain, with every screen at brand
quality, legal pages live, and monitoring watching every money movement.

Everything below rolls up to that sentence.

---

## M0 — Foundation ✅ DONE

Brand identity + multi-account UI, complete Dakota integration (signing,
webhooks, provisioning, two-leg withdrawals, client throttle/retry, events
reconciliation), 75 passing tests, security review clean, deposit lifecycle
drill-verified against a real Postgres (credits exactly once, dedupes
replays, claws back returns). Commits through `8f46dc1`.

## M1 — Design-complete product  ← ACTIVE (no external dependencies)

**How:** screen-by-screen pass to the dashboard's quality bar (the ported
Claude Design reference). Each screen: brand tokens only, pill money-CTAs,
honest data (no invented fees/claims), real loading/empty/error states, no
dead controls, zero console errors — verified by screenshot in the browser.

**Scorecard (2026-07-10 audit):**

| Screen | State |
|---|---|
| Dashboard | ✅ reference quality |
| Card | ✅ |
| Transactions | ✅ |
| Insights | ✅ (category data still placeholder — real categorization is M5) |
| Loans (stub) | ✅ |
| Landing / marketing | ✅ (copy de-overclaimed) |
| Send | ✅ this session (honest flow, no network picker, pill CTA) |
| Withdraw | ✅ this session (selected-state method cards) |
| Deposit | ✅ this session |
| Between accounts | ✅ (renamed from "Move funds") |
| Accounts | ✅ |
| Recipients | ✅ (hydration bug fixed) |
| Auth (login/register/reset) | ✅ acceptable (copy fixed) |
| Settings | 🔲 thin — needs KYC status card, notification prefs stub, better layout |
| /recipients/new | 🔲 functional but plain — bring up to form standard |
| Onboarding | 🔲 unreviewed in browser (KYC bypass hides it) — review with bypass off |
| Mobile pass | 🔲 every screen at 390px — sidebar drawer, tables, hero cards |

**Done when:** every row is ✅; `npm test` + `npm run build` green; a full
click-through at 1440px and 390px produces zero console errors and zero
dead buttons.

## M2 — Sandbox proof  ⛔ blocked on Dakota credentials (user action)

**How:** the moment the API key arrives (~30 min setup):
1. `DAKOTA_API_KEY` into `.env.local`.
2. DB: local Postgres already migrated through 0004 (see "Local dev DB").
3. `npm run dakota:bootstrap` twice (mints signer key, then registers
   signer/group/policy → paste the printed env lines).
4. Restore the real `DAKOTA_WEBHOOK_PUBLIC_KEY` (commented in `.env.local`),
   set `BYPASS_KYC=false`, `NEXT_PUBLIC_DEMO_MODE=false`.
5. Webhooks: cloudflared tunnel + re-run bootstrap with `--url`, or rely on
   `npm run dakota:reconcile` (verify the GET /events ordering assumption —
   `orderingSuspect` in `src/lib/dakota/reconcile.ts`).

**Done when** this drill passes on the real sandbox: fresh signup → hosted
KYC auto-approves → webhook provisions wallet + self-destination + onramp
rail → deposit page shows real virtual account numbers →
`POST /sandbox/simulate/inbound` $1.50 ACH credits the balance exactly once
→ link a bank via the UI → withdraw $1 end-to-end (two legs, correct
`send_amount` fee accounting on the receipt) → simulated ACH return claws
back with notification. ($2/txn sandbox cap.)

## M3 — Production readiness  (after M2)

**How / items:**
- Production Dakota API key; swap network IDs to `base-mainnet`; register
  production webhook target; production webhook public key.
- Platform signer key into a proper secrets manager (not env).
- Hosted production Postgres + migrations (Supabase restore or replacement —
  decision needed), `CRON_SECRET` set, reconcile on a cron schedule.
- Deploy target (Vercel or similar) + real domain + `NEXT_PUBLIC_APP_URL`.
- Monitoring: Sentry, structured logs, alerting on webhook processing
  failures and stuck non-terminal transactions.
- `BYPASS_KYC` and demo mode hard-off; key-rotation calendar (90 days).

**Done when:** checklist above complete AND a low-value real-dollar test in
production passes: real deposit in, real withdrawal out, one forced return
path — all visible in monitoring, ledger invariants intact.

## M4 — Launch MVP

**How / items:** onboarding funnel usability pass with a real outsider;
support channel (email at minimum); legal pages linked from footer +
signup; "not a bank" disclosures verified; first external users invited.

**Done when:** the goal sentence at the top of this file is true, witnessed
end-to-end for at least one person who isn't us.

## M5 — Post-launch growth (parked — see BACKLOG.md)

Revenue (`developer_fee_bps`, premium tiers), real transaction
categorization for Insights, savings APY (treasury partner), card issuing
partner (Lithic/Marqeta/Stripe Issuing — separate integration), referrals,
passkey-endorsed transactions, external crypto sends, multi-currency.

---

## How we work (method)

- Pick the top unblocked milestone item; verify before commit (tests +
  browser for UI, drill for money paths); push directly to main.
- Money-path changes must keep the drill invariants: credit exactly once,
  dedupe replays, clawback exactly once, holds refund exactly once.
- Unused ideas go to BACKLOG.md, not into scope.

## Blockers needing YOU (as of 2026-07-10)

1. **Dakota sandbox credentials** — email was expected ~2026-07-09; chase
   sales if it hasn't landed. Gates M2 (and everything after).
2. **Supabase decision** — the old dev project is unreachable ("tenant not
   found"). Restore it in the dashboard, or we stay on local Postgres for
   dev and provision a fresh hosted DB at M3.
3. **(M3, later)** production hosting + domain choice.

## Local dev DB (since 2026-07-10)

Dev runs on Homebrew PostgreSQL 16 (Supabase project is dead):
- Data dir `~/.moneta-pgdata`, port `54321`, superuser `moneta`, db `moneta`.
- Start after reboot:
  `/opt/homebrew/opt/postgresql@16/bin/pg_ctl -D ~/.moneta-pgdata -o "-p 54321" -l ~/.moneta-pgdata/server.log start`
- `.env.local` points `DATABASE_URL` here (old Supabase URL kept commented).
- Migrations 0000–0004 applied. Drill seed user exists
  (`drill@moneta.test`, account `2222…`, onramp rail `acct_drill_…`).
- `DAKOTA_WEBHOOK_PUBLIC_KEY` is the **dev simulator key**; the real
  sandbox key is commented above it — swap back for real Dakota webhooks.

**Local money drill** (dev server on :3001): copy fixtures from
`fixtures/dakota/` with `REPLACE_WITH_DAKOTA_ACCOUNT_ID` →
`acct_drill_2tQRvRAIL00000000001`, then
`npx tsx scripts/dakota-simulate-webhook.ts --file <fixture> --url http://localhost:3001/api/webhooks/dakota`
(pending → completed → completed replay → returned; balance
0 → 1.49 → 1.49 → 0).

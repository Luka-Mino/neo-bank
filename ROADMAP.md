# Moneta Roadmap

> Updated 2026-07-08. The deep Dakota integration reference is
> `DAKOTA-PLAN.md` (API sequences, gotchas, module designs). This file is the
> working queue: what we're building, in what order, and what it's waiting on.
> Parked ideas live in `BACKLOG.md`.

## Where we are

Dakota infrastructure is built and pushed (commits `c88c185`, `6a6afe2`,
`ffb5ed7`): signing core, webhook pipeline (verified against a local
simulator), post-KYC provisioning, bootstrap script, 41 passing tests.
Waiting on: Dakota sandbox credentials (email expected ~2026-07-09).
Migration `0002` is written but **not applied** to the dev database yet.

## Workstream A — buildable RIGHT NOW (no credentials needed)

Ordered; each item is independently shippable.

1. **Withdrawal orchestration** — the last money-moving flow.
   `POST /api/transactions` becomes: KYC gate → create Dakota one-off →
   learn `send_amount` (includes fees) → atomically debit the source account
   (optimistic lock, `WHERE balance >= send_amount`) → wallet-send exactly
   `send_amount` to the one-off's deposit address (platform signer) → ledger
   rows for both legs. Webhooks finalize; terminal failure or ACH return
   refunds the hold exactly once (same `moneta_debited` metadata pattern as
   deposit credits). Includes best-effort cancel of the one-off if the wallet
   leg fails.
2. **Destination client fixes** — Dakota *requires* `account_holder_name` and
   `bank_name` on `fiat_us` destinations (≤35 chars each) and a fuller shape
   for `fiat_iban` (holder name/address, bank name, `assets`, `capabilities`).
   Our client and validators omit them → every real bank payout would 400.
3. **Dakota client hardening** — retry on 429/5xx honoring `Retry-After`,
   exponential backoff, and a light in-process throttle for the 60 req/min
   key budget.
4. **Events reconciliation poller** — cursor-based `GET /events` sweep (cron
   or on-demand route) to catch webhooks Dakota gave up retrying (48h) and to
   make local dev workable without a tunnel.
5. **Frontend wiring to real shapes**
   - Transfer-out: full bank form (routing, account, holder name, bank name,
     address), fee-aware confirm (`send_amount` vs requested amount), live
     status from the ledger.
   - Deposit: render the `bank_account` object from provisioning; pending /
     completed / returned states.
   - Onboarding: "setting up your account" state while provisioning runs;
     proof-of-address prompt (reason codes are already handled server-side).
   - Transaction detail: receipt breakdown (fees, FX rate, statement
     reference, IMAD/OMAD), returned/reversed explanations.
6. **Legal/compliance pages** — ToS, privacy, "Moneta is not a bank"
   disclosures. No credentials needed; launch-blocking eventually. (Lawzy
   repo has reusable legal-page scaffolding.)

## Workstream B — the moment sandbox credentials arrive

Exact sequence (≈30 minutes):
1. Dashboard → create sandbox API key → `DAKOTA_API_KEY` in `.env.local`.
2. Apply migration: `npx drizzle-kit migrate` (adds the two provisioning
   columns from `0002`).
3. `npm run dakota:bootstrap` — first run mints the platform signer key
   (paste env line), second run registers signer/group/policy and prints
   `DAKOTA_SIGNER_GROUP_ID` / `DAKOTA_POLICY_ID`.
4. `BYPASS_KYC=false`, `NEXT_PUBLIC_DEMO_MODE=false` for testing.
5. Webhooks: public tunnel (`cloudflared tunnel --url http://localhost:3001`)
   + re-run bootstrap with `--url`, or lean on the reconciliation poller.
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

# Dakota Integration Plan

> Written 2026-07-08 from a full read of docs.dakota.xyz (all guide pages + API reference)
> plus a survey of our current code. This is the roadmap for taking Moneta from
> demo-mode to running on real Dakota rails.

---

## 1. What Dakota gives us (TL;DR)

Dakota is regulated stablecoin infrastructure: hosted KYC/KYB, non-custodial wallets,
fiat on/off-ramps (ACH, Fedwire, SWIFT, SEPA/IBAN), swaps, policy-governed transaction
signing, and webhooks. We are the **Client**; each Moneta user becomes a Dakota
**Customer** (`customer_type: "individual"`).

The resource chain for money movement:

```
Customer → Recipient → Destination → Account (reusable) or One-off Transaction
Customer → Wallet (non-custodial, policy-governed, signed intents)
```

Key facts that shape our design:

- **KYB/KYC gate**: until a customer's `kyb_status` is `"active"`, we cannot create
  recipients, destinations, accounts, wallets, or transactions for them.
- **Wallets are non-custodial.** Dakota never holds keys. Every send is a signed
  *intent* (JCS canonicalize → SHA-256 → ECDSA P-256 → DER → base64) checked against
  wallet policies. A wallet with zero policies is **deposit-only** (sends 403).
  One EVM address covers all EVM chains.
- **Onramp accounts provision real virtual bank account details** (ABA routing +
  account number). User wires/ACHs USD → Dakota auto-converts → USDC lands at the
  crypto destination. No API call needed per deposit.
- **Offramp**: reusable offramp accounts (persistent deposit address) or **one-off
  transfers** (single-use address, `payment_reference` on the bank statement,
  per-transaction rail override + `developer_fee_bps`).
- **Webhooks** are Ed25519-signed (not HMAC), 40 event types, 10 retries over 48h,
  may arrive out of order. Pull-based `GET /events` exists for reconciliation.
- **Sandbox** is real custody on testnets + mocked fiat (Lead Bank): $2/txn cap,
  testnet network IDs only, USDC/USD/RD only (no USDT), KYB auto-approves in ~5s,
  full simulation API for inbound payments and onboarding transitions.
- **Monetization lever**: `developer_fee_bps` (0–10000) on accounts and one-off
  transactions — our cut of every ramp.

Auth mechanics: `x-api-key` on everything; `x-idempotency-key` (UUID) required on every
POST (and only POST); 60 req/min per API key; RFC 9457 problem+json errors; IDs are
27-char KSUIDs. Sandbox base `https://api.platform.sandbox.dakota.xyz`, production
`https://api.platform.dakota.xyz`. Dashboards: `platform.sandbox.dakota.xyz` /
`platform.dakota.xyz`.

---

## 2. Architecture: how Moneta maps onto Dakota

| Moneta concept | Dakota resource | Notes |
|---|---|---|
| Moneta (the company) | Client | Onboarded via Dakota sales; holds API keys |
| A user | Customer (`individual`) + hosted KYC application | `external_id` = our `users.id` |
| User's funds | One Wallet per user (`family: "evm"`) | USDC on **Base**; address shared across EVM chains |
| Checking/Savings/buckets | Our `accounts` table (book-entry layer) | Unchanged — Dakota knows nothing about these |
| Deposit (fiat in) | Onramp Account → virtual ACH/wire details | Destination = user's own wallet address |
| Withdraw / transfer-out | One-off transfer (offramp) + wallet send | Two-leg: create one-off, then send USDC from wallet to its deposit address |
| Payees | Recipient + Destinations (`fiat_us`, `fiat_iban`, `crypto`) | Already modeled in our DB |
| Internal transfers | **Stay off-chain** (atomic book entries) | Already built; no Dakota involvement |
| Card spend | Not a Dakota product | Stays mocked; separate issuer later |

### Decisions (recommended defaults — say the word if you want different)

1. **Network: Base.** `base-mainnet` in production, `base-sepolia` in sandbox.
   Cheap gas, native USDC. CAIP-2 for wallet intents: `eip155:8453` / `eip155:84532`.
2. **Asset: USDC only at launch.** RD is Base-native but state-restricted
   (FL, GA, NY, TX, WA, LA → `state-restricted-rd` errors); USDT isn't in sandbox.
3. **Custody/signing: one platform ES256 signer** (P-256 keypair we hold server-side),
   one signer group, one default policy (`approval_threshold`, threshold 1, allow).
   Attached to every user wallet. Server signs all sends. Later upgrade path:
   register users' passkeys as `WEBAUTHN` signers so users endorse their own
   transactions (Dakota supports mixing ES256 + WebAuthn in one signatures array).
4. **KYC: use Dakota's hosted application URL** (`apply.dakota.com/...`) rather than
   building a custom UI against the application endpoints. Our onboarding page
   already links out to it. Custom UI (individual-details PUT + document upload +
   the six attestations with the e_sign-first timestamp ordering) is a later
   polish item, not launch-blocking.
5. **Deposits: one reusable onramp account per user** — show the virtual ABA
   routing/account number on the deposit page permanently.
   **Withdrawals: one-off transfers** — we get `payment_reference` (e.g.
   `MONETA <ref>`, ACH limit: 18 chars, letters/digits/spaces only) and per-txn rail
   choice (`ach` default, `fedwire` for same-day).

---

## 3. What we already have vs. what's missing

### Already built (and matches the docs)
- `src/lib/dakota/client.ts` — correct base URLs, `x-api-key`, `x-idempotency-key`
  on POSTs, RFC 9457 error parsing.
- `customers.ts`, `recipients.ts`, `accounts.ts` (rails), `transactions.ts` (one-off) —
  request/response shapes line up with the API reference.
- `webhooks.ts` — Ed25519 verification over `timestamp + rawBody`, 300s replay window,
  per-env public keys (docs confirm: sandbox `7a2f…8a5f`, production `65b7…8be4`).
- Webhook inbox table with `dakota_event_id` idempotency; status history; notifications.
- DB schema is Dakota-shaped end to end (`dakota_customers`, `wallets`, `dakota_rails`,
  `recipients`, `destinations`, ledger with `dakota_tx_id`).
- Onboarding page that polls KYC status and links to `application_url`.

### Gaps (ranked by severity)

1. **No wallet signing implementation.** Nothing in the repo can sign a
   `SendTransactionIntent` (RFC 8785 JCS → SHA-256 → ECDSA P-256 → **DER** → base64).
   Without it we cannot move a single token out of any wallet. Biggest single
   build item. (`canonicalize` npm package + `node:crypto` with
   `dsaEncoding: 'der'` — server-side, so no browser P1363→DER trap.)
   Worse: the existing `sendFromWallet()` in `wallets.ts` POSTs to
   `/wallets/{id}/send` — **an endpoint that does not exist**. It must be replaced
   with the endorsed-request flow, not fixed.
2. **Wallets are created send-disabled.** `POST /api/wallets` passes
   `signerGroups: []` — and `policies` is a *required* field. Per docs, a wallet
   with no policies default-denies every send. We need the platform
   signer/group/policy bootstrapped first and passed on every wallet create.
3. **The webhook pipeline is broken at four layers** (verified against the code
   2026-07-08):
   - *Signature verification fails on every real delivery*: `webhooks.ts` verifies
     `` `${timestamp}.${rawBody}` `` but Dakota signs `timestamp + rawBody` with
     **no separator**. Every genuine webhook returns 401.
   - *Wrong envelope*: `parseWebhookEvent` expects `{event_id, event_type, data}`;
     Dakota actually sends `{id, type, created, api_version, data: {object: {...}}}`.
     Every `data.foo` read in the handler would be `undefined`.
   - *Wrong/missing event types*: the handler listens for
     `transaction.status.updated`, which does not exist in Dakota's 40-event
     catalog, and handles neither `transaction.auto.created/updated` (onramp
     lifecycle) nor `wallet.deposit` — so deposits would never credit anyone's
     balance.
   - *Poison-row inbox*: the route inserts the inbox row **before** processing and
     the idempotency check returns `already_processed` for any existing row — so a
     single processing failure permanently drops that event (Dakota's retries all
     short-circuit). Inbox must distinguish "seen" from "processed".
4. **No post-KYC provisioning pipeline.** When `customer.kyb_status.updated` →
   `active`, we should automatically: create wallet → create "self" recipient +
   crypto destination (user's own wallet address) → create onramp account → store
   the virtual bank details. Today each piece is a separate manual API route.
5. **Withdrawal flow is one-legged.** `/api/transactions` creates the Dakota one-off
   transfer but never performs the second leg — sending `send_amount` USDC from the
   user's wallet to the returned `crypto_address`. (Note: `send_amount` can exceed
   the requested amount because it includes fees — debit the ledger by `send_amount`.)
6. **Returns/reversals unhandled.** One-off and auto transactions carry
   `pending_return`/`returned`/`reversed` states and NACHA `return_code`s (e.g. R01) —
   ACH can claw back *after* `completed`. Ledger needs a re-debit/credit path plus
   user notification.
7. **Proof-of-Address ceiling.** Individuals crossing **$3,000 inbound in any rolling
   7-day window** get deposits held until PoA is uploaded (`poa_status`,
   `reason_code: pending_proof_of_address`). Needs UI surfacing + a "finish
   verification" link (the hosted application URL reopens for PoA upload).
8. **No Dakota-side rate limiting.** 60 req/min per key. Balance polling across users
   would blow this fast — need a throttled queue + rely on our `wallet_balances`
   cache + webhook-driven updates instead of polling.
9. **Customer creation at register is fire-and-forget.** If the Dakota call fails,
   the user exists with no `dakota_customers` row and nothing retries. Move creation
   to onboarding start with retry; or add a repair job.
10. **No SDK.** We hand-rolled the client. Optional: adopt `@dakota-xyz/ts-sdk`
    (generated from their OpenAPI). Recommendation: keep the hand-rolled client for
    now (it's thin and correct), revisit if drift hurts.

---

## 4. One-time setup (operational)

1. **Get access**: Dakota is sales-gated — request a dashboard account via
   dakota.xyz/talk-to-sales. Get **sandbox** dashboard access first
   (`platform.sandbox.dakota.xyz`).
2. **Create a sandbox API key** in the dashboard (shown once — straight into
   `.env.local` as `DAKOTA_API_KEY`, `DAKOTA_ENV=sandbox`).
3. **Bootstrap script** (`scripts/dakota-bootstrap.ts`, idempotent, run once per env):
   - Generate ES256 P-256 keypair → private key to `DAKOTA_SIGNER_PRIVATE_KEY`
     (env now; KMS before production).
   - `POST /signers` `{name: "moneta-platform", key_type: "ES256", public_key: <b64 SPKI>}`
   - `POST /signer-groups` `{name: "moneta-ops", member_keys: [<pubkey>]}`
   - `POST /policies` `{name: "moneta-default", signer_group_id, rules: [{rule_type: "approval_threshold", action: "allow", definition: {threshold: 1}}]}`
     (rules included at creation need no endorsement signatures)
   - `POST /webhooks/targets` `{url: "<APP_URL>/api/webhooks/dakota", global: true}`
     (HTTPS only — in dev, a cloudflared/ngrok tunnel URL)
   - Persist the four IDs (new `dakota_config` table or env vars).
4. **Env additions**: `DAKOTA_SIGNER_PRIVATE_KEY`, `DAKOTA_SIGNER_GROUP_ID`,
   `DAKOTA_POLICY_ID`, `DAKOTA_NETWORK_ID` (`base-sepolia` / `base-mainnet`).
5. **Optional dev nicety**: hook Dakota's read-only MCP server into Claude Code for
   live sandbox inspection:
   `claude mcp add --transport http dakota-platform https://mcp.platform.dakota.xyz/mcp`

---

## 5. Core flows (exact API sequences)

### 5a. User onboarding (KYC)
```
register → local user row (as today)
onboarding start → POST /customers {name, customer_type: "individual", external_id: userId}
               → store dakota_customer_id, application_id, application_url
UI → "Verify your identity" button → opens application_url (Dakota-hosted form)
webhook customer.kyb_status.updated → update dakota_customers.kyc_status
   status active → run provisioning pipeline (5b)
   status rejected / partner_review / frozen → surface state in onboarding UI
```
Sandbox: KYB auto-approves ~5s after submission (or drive it explicitly with
`POST /sandbox/simulate/onboarding` `{type: "kyb_approve", applicant_id, simulation_id}`;
use `X-Sandbox-Skip-Auto-Approval: true` to test the pending state).

### 5b. Provisioning pipeline (on KYC → active; idempotent job)
```
1. POST /wallets {customer_id, name: "<user> primary", family: "evm",
                  signer_groups: [DAKOTA_SIGNER_GROUP_ID], policies: [DAKOTA_POLICY_ID]}
2. POST /customers/{cid}/recipients {name: <user's legal name>}          ← "self" recipient
3. POST /recipients/{rid}/destinations {destination_type: "crypto",
        name: "Moneta wallet", crypto_address: <wallet.address>, network_id: DAKOTA_NETWORK_ID}
4. POST /accounts {account_type: "onramp", crypto_destination_id: <dest>,
        source_asset: "USD", destination_asset: "USDC",
        destination_network_id: DAKOTA_NETWORK_ID, capabilities: ["ach","fedwire"], rail: "ach"}
   → response.bank_account = virtual ABA routing + account number → store in dakota_rails
```
Each step records completion so retries skip done steps (avoid duplicate resources;
idempotency keys should be deterministic per user+step, since Dakota replays cached
responses for a repeated key).

### 5c. Deposit (fiat → USDC)
```
Deposit page shows stored virtual bank details (already built).
User sends ACH/wire → Dakota auto-converts →
  webhooks: transaction.auto.created → create ledger row (status pending)
            transaction.auto.updated → update status; on completed:
              credit user's primary account balance by receipt output amount
            wallet.deposit → confirms funds at wallet address (reconcile)
```
Amounts live in `data.object.receipt` (`initial_amount`, `outgoing_amount`, fee
fields, `exchange_rate`) — there is no top-level amount, and no separate `.failed`
event; failure is a `status` value. Events may arrive out of order — trust `status`,
not arrival order.

Sandbox test: `POST /sandbox/simulate/inbound`
`{simulation_id, type: "ach_inbound", account_id: <onramp account>, amount: "1.50", currency: "USD"}`
(cap $2) → full webhook sequence fires exactly like production.

### 5d. Withdrawal (USDC → user's bank)
```
1. Ensure recipient + fiat_us destination exists
   (fiat_us requires: aba_routing_number, account_number, account_type,
    account_holder_name ≤35 chars, bank_name ≤35 chars; recipient needs an address)
2. POST /transactions {transaction_type: "one_off", customer_id, amount: "100.00",
        source_network_id: DAKOTA_NETWORK_ID, source_asset: "USDC",
        destination_id, destination_asset: "USD",
        destination_payment_rail: "ach", payment_reference: "MONETA <ref>"}
   → {id, crypto_address, send_amount, status}
3. Debit ledger by send_amount (hold), then wallet send:
   POST /wallets/{wid}/transactions
   {signatures: [<platform ES256 sig>],
    intent: {wallet_id, caip2: "eip155:84532",           ← Base Sepolia; 8453 in prod
             operation: {kind: "transfer", from: <wallet.address>,
                         to: <crypto_address>, amount: <send_amount>, asset_id: "USDC"},
             idempotency_key: <uuid>}}
4. webhooks: wallet.transaction.updated (leg 1) + transaction.one_off.updated (leg 2)
   → on one_off completed: finalize ledger row
   → on failed/returned: release hold / re-credit + notify
```
Intent signing rules: snake_case fields, amounts as **strings**, omit optional fields
entirely (never null), JCS canonicalize before hashing — `JSON.stringify` is not
deterministic and will produce `invalid_signature`.

### 5e. External crypto send (later phase)
Recipient + crypto destination → direct wallet send to that address (one leg).
Compliance note: Dakota screens addresses; `compliance-blocked` (422) is a real
outcome to handle in UI. Sandbox mocks risk by address substring ("hack"/"scam" →
high risk).

### 5f. Internal transfers
Unchanged — atomic book entries in our DB. Never touches Dakota.

---

## 6. Webhook handling (target state)

Verify Ed25519 signature → dedupe on `X-Dakota-Event-ID` → respond 2xx fast
(<30s; do work async) — inbox table already gives us this shape.

| Event | Handler |
|---|---|
| `customer.kyb_status.updated` | Update kyc_status; on `active` → provisioning job; handle `reason_code` (`pending_proof_of_address`, `proof_of_address_approved/rejected`) |
| `transaction.auto.created/updated` | Upsert ledger row for deposits; credit balance on `completed`; handle returns |
| `transaction.one_off.created/updated` | Update withdrawal ledger rows; finalize/rollback holds |
| `wallet.transaction.created/updated` | Track the on-chain leg of withdrawals/sends |
| `wallet.deposit` | Reconciliation signal for inbound funds |
| `auto_account.created/updated` | Sync `dakota_rails` (bank details ready) |
| `recipient.*`, `destination.*` | Keep local mirrors in sync |

Plus a **reconciliation poller** (cron): `GET /events?starting_after=<cursor>` to
catch missed deliveries (webhook retries stop after 48h), and `GET /transactions`
sweep for stuck non-terminal states. This also makes local dev workable without a
tunnel.

---

## 7. Phased implementation

**Phase 0 — Access & bootstrap** *(blocked on Dakota sales for credentials)*
Sandbox account, API key, bootstrap script (signer/group/policy/webhook target),
tunnel for dev webhooks, smoke test: create a throwaway customer, simulate
`kyb_approve`, confirm webhook lands. Exit: green end-to-end ping.

**Phase 1 — Real onboarding**
Move customer creation to onboarding start (with retry). Hosted KYC flow wired to
real status transitions (BYPASS_KYC off in dev). Provisioning pipeline (5b) fires on
activation. Exit: fresh signup → verified → wallet + self-destination + onramp rail
exist, deposit page shows real sandbox bank details.

**Phase 2 — Deposits**
Webhook handlers for `transaction.auto.*` + `wallet.deposit`; ledger crediting;
simulate ACH/wire inbound (immediate, delayed, and failure scenarios via
`X-Sandbox-Scenario`). Exit: simulated $1.50 ACH shows up as a completed deposit
crediting the user's primary account.

**Phase 3 — Withdrawals (the signing milestone)**
Implement intent signing module (`src/lib/dakota/signing.ts`: JCS + ECDSA-DER).
Two-leg withdrawal orchestration with ledger holds. Handle
`insufficient-balance`, cancellations (`POST /transactions/{id}/cancellations`),
failures. Exit: sandbox withdrawal completes end-to-end with correct fee accounting
from `receipt`.

**Phase 4 — Recipients & external sends**
Real fiat_us/crypto destination creation from the UI (fields per API reference —
note responses mask account numbers), external wallet sends, transaction detail page
showing receipt breakdown (exchange rate, dakota/client/gas fees, IMAD/OMAD for wires).

**Phase 5 — Hardening**
Returns/reversals (R-codes → clawback + notify), PoA flow ($3k/7-day), Dakota-call
throttle queue (60 rpm), events reconciliation cron, deterministic idempotency keys,
`Retry-After`-aware retries, alerting on webhook delivery failures.

**Phase 6 — Production cutover**
Dakota's own checklist: production API keys, swap every `*-sepolia`→mainnet network
ID (prod rejects testnet IDs), real amounts (no $2 cap), platform signer key into
proper secret storage, register production webhook target, start with low-value
transactions + monitoring + rollback plan. Plus ours: KYC bypass hard-off, demo mode
off, key-rotation calendar (Dakota recommends 90 days).

Phases 1–3 are the critical path to "a real dollar in, a real dollar out."
Everything else layers on top.

---

## 8. Gotchas cheat sheet (learned from the docs, keep handy)

- `x-idempotency-key` on POST **only** — do not send it on GET/PUT/PATCH/DELETE.
- Reused idempotency key returns the **cached original response** (not an error).
- Wallet `policies: []` is legal but produces a deposit-only wallet.
- Policy evaluation: deny wins, allow loses, **silence is deny**.
- Never detach a wallet's last signer group (bricks the wallet).
- Amounts: strings in intents (`"10.5"`); policy `min_amount` is an **integer in cents**.
- `send_amount` ≥ requested amount (fees included) — send *exactly* `send_amount`.
- Status enums are inconsistent across resources (`cancelled` vs `canceled`;
  auto_account union member is camelCase) — normalize at the client boundary.
- `application_expires_at` is **nanoseconds**; most other timestamps are seconds.
- Application tokens (hosted KYC URL): 30-day validity, 100 req/hour.
- Attestations (custom KYC UI only): `e_sign` first, others strictly-after timestamps.
- Webhook payload: amounts inside `data.object.receipt`; no `.failed` event types.
- Sandbox: $2 cap, testnets only, USDT unsupported, TRM risk mocked by address
  substrings, `/sandbox/*` returns 403 in production.
- RD stablecoin: Base-only AND state-restricted (FL/GA/NY/TX/WA/LA) — skip for now.
- Docs are LLM-friendly: append `.md` to any page URL; index at docs.dakota.xyz/llms.txt.

---

## 9. Module designs — the credential-free build

Everything in this section is buildable and testable **today**, before Dakota
credentials arrive. Shipped as three PRs, in this order.

> **Status (2026-07-08): all three PRs shipped** — `c88c185` (signing core),
> `6a6afe2` (webhook pipeline), `ffb5ed7` (bootstrap + provisioning).
> 41 tests green. Remaining before first sandbox run: real `DAKOTA_API_KEY`
> in `.env.local`, apply migration 0002 (`npx drizzle-kit migrate`), run
> `npm run dakota:bootstrap` (twice: once to mint the signer key, once to
> register), add its output env lines, flip `BYPASS_KYC=false` +
> `NEXT_PUBLIC_DEMO_MODE=false` for testing.

### PR 1 — Signing core (gap #1)

**New dev dependencies**: `vitest` (first test framework in the repo; script
`"test": "vitest run"`), `tsx` (script runner), `canonicalize` (RFC 8785 JCS).

**`src/lib/dakota/networks.ts`** — single source of truth for network config:

```ts
export const NETWORKS = {
  "base-mainnet":  { caip2: "eip155:8453"  },
  "base-sepolia":  { caip2: "eip155:84532" },
  // extend as we add chains
} as const;
export function defaultNetworkId(): NetworkId  // env.DAKOTA_NETWORK_ID
```

**`src/lib/dakota/signing.ts`** — pure crypto, no I/O:

```ts
export interface TransferOperation {
  kind: "transfer";
  from: string; to: string;
  amount: string;      // decimal STRING — never a number
  asset_id: string;    // "USDC"
}
export interface SendTransactionIntent {
  wallet_id: string;
  caip2: string;
  operation: TransferOperation;
  idempotency_key: string;
}
export function canonicalizeIntent(intent: object): string
  // deep-strips undefined, THROWS on null fields (docs: omit, never null)
export function signIntent(intent: object, privateKeyPem: string): string
  // JCS → createSign("SHA256") → sign({ key, dsaEncoding: "der" }) → base64
export function verifyIntentSignature(intent, sigB64, publicKeyPem): boolean
  // test/debug helper — mirrors what Dakota's server does
export function getPlatformSignerKey(): string
  // DAKOTA_SIGNER_PRIVATE_KEY holds BASE64-OF-PEM (PKCS#8) so it fits
  // one env line; decoded here, cached, throws a clear error if unset
```

**`src/lib/dakota/wallet-transactions.ts`** — replaces the bogus
`sendFromWallet` (delete it):

```ts
export async function sendWalletTransaction(params: {
  walletId: string;
  from: string;            // wallet address
  to: string;              // destination address
  amount: string;          // EXACT decimal string (send_amount for withdrawals)
  assetId: string;         // "USDC"
  networkId?: NetworkId;   // default from env
  idempotencyKey: string;  // caller supplies — deterministic (see PR 3)
}): Promise<WalletTransaction>
// builds intent → signIntent(platform key) →
// POST /wallets/{id}/transactions  body: { signatures: [sig], intent }
// (EndorsedRequest: signatures + intent at top level, no wrapper)
```

**`client.ts` tweak**: `post<T>(path, body, opts?: { idempotencyKey?: string })` —
callers pass deterministic keys; falls back to `uuidv4()` as today.

**Tests** (`src/lib/dakota/signing.test.ts`):
- roundtrip: `generateKeyPairSync("ec", { namedCurve: "P-256" })` → sign → verify.
- JCS stability: fixed intent → exact expected canonical string (catches
  accidental `JSON.stringify` regressions).
- key-order invariance: same fields, different insertion order → both verify.
- null rejection + undefined stripping.
- DER shape: signature parses as ASN.1 SEQUENCE of two INTEGERs.

### PR 2 — Webhook pipeline rewrite (gap #3, all four layers)

**`src/lib/dakota/webhooks.ts`**:
- Fix signed payload to `timestamp + rawBody` (**no separator**).
- Replace `WebhookEvent` with the real envelope:

```ts
export interface DakotaEventEnvelope<T = Record<string, unknown>> {
  id: string;            // event KSUID
  type: string;          // one of the 40 EventTypes
  created: number;       // unix seconds
  api_version: string;
  data: { object: T; previous_attributes?: Partial<T> };
}
```

**`src/lib/dakota/webhook-handlers.ts`** — registry keyed by event type; the
route stays thin (verify → inbox → dispatch → mark processed):

```ts
type Handler = (object: any, envelope: DakotaEventEnvelope) => Promise<void>;
export const handlers: Record<string, Handler> = {
  "customer.kyb_status.updated": onKybStatus,      // → provisioning on "active"
  "transaction.auto.created":    onAutoTx,          // deposits
  "transaction.auto.updated":    onAutoTx,
  "transaction.one_off.created": onOneOffTx,        // withdrawals
  "transaction.one_off.updated": onOneOffTx,
  "wallet.transaction.created":  onWalletTx,        // on-chain legs
  "wallet.transaction.updated":  onWalletTx,
  "wallet.deposit":              onWalletDeposit,   // reconciliation + notify
  "auto_account.created":        onAutoAccount,     // rail/bank details sync
};
// unknown types: inbox row marked processed as no-op (we register global: true)
```

**Inbox semantics fix** (route): upsert with `onConflictDoNothing` on
`dakota_event_id`; if a row exists **with** `processedAt` → `already_processed`;
if it exists **without** → reprocess (this is Dakota's retry). On handler throw:
write `processing_error`, return **500** so Dakota keeps retrying; our
reconciliation poller (Phase 5) is the backstop after their 48h retry window.

**Money-safety invariants** (in `onAutoTx` / `onOneOffTx`):
- Ledger row upserted by `dakota_tx_id` (deposits originate externally — the row
  may not exist yet; resolve user via `auto_account_id` → `dakota_rails`).
- Status transitions guarded: never leave a terminal state; "credit exactly once"
  enforced by doing the balance update in the **same DB transaction** as a
  conditional status flip (`UPDATE … SET status='completed' WHERE dakota_tx_id=$1
  AND status <> 'completed' RETURNING id` — no row returned → no credit).
- Amounts come from `data.object.receipt` (`outgoing_amount` etc.) — there is no
  top-level amount.
- `returned` / `reversed` after `completed` (ACH clawbacks, NACHA `return_code`) →
  compensating ledger entry + user notification, never a silent balance edit.

**`scripts/dakota-simulate-webhook.ts`** — the piece that makes all of this
testable with zero credentials:
- Generates a dev Ed25519 keypair on first run (stored in `scripts/.dev-webhook-key`,
  gitignored); prints the `DAKOTA_WEBHOOK_PUBLIC_KEY=<hex>` override for `.env.local`.
- `npx tsx scripts/dakota-simulate-webhook.ts --fixture deposit-completed
  [--url http://localhost:3001/api/webhooks/dakota]` — signs `timestamp + body`
  exactly like Dakota, sends with real headers (`x-webhook-signature`,
  `x-webhook-timestamp`, `x-dakota-event-id`, `x-dakota-event-type`).
- `fixtures/dakota/*.json`: realistic envelopes straight from the docs — KYB
  activated, deposit pending→completed, withdrawal lifecycle, ACH return,
  wallet.deposit. Doubles as our event-shape documentation.

**Tests**: verify-signature roundtrip against a self-signed payload (correct +
tampered + stale timestamp + dot-separator regression test); handler dispatch;
double-delivery of `completed` credits exactly once (needs a DB, so this one runs
against local Postgres — same `DATABASE_URL` pattern drizzle already uses).

### PR 3 — Bootstrap + provisioning (gaps #2, #4, #9)

**`src/env.ts` additions** (all optional so the app boots pre-bootstrap; modules
that need them throw descriptive errors):
`DAKOTA_SIGNER_PRIVATE_KEY` (base64 PEM), `DAKOTA_SIGNER_GROUP_ID`,
`DAKOTA_POLICY_ID` (27-char KSUIDs), `DAKOTA_NETWORK_ID`
(enum, default `base-sepolia`).

**`scripts/dakota-bootstrap.ts`** — one command per environment, idempotent by
lookup-before-create (signer groups, policies, and webhook targets are all
listable):
1. No `DAKOTA_SIGNER_PRIVATE_KEY`? → generate P-256 keypair, print the env line,
   exit (key material never exists only in process memory).
2. `POST /signers` (ES256, base64 SPKI pubkey) + `POST /signer-groups`
   (`moneta-ops`) — skipped if a group named `moneta-ops` already exists.
3. `POST /policies` `moneta-default` with rule
   `{rule_type: "approval_threshold", action: "allow", definition: {threshold: 1}}`
   (rules at creation need no endorsement).
4. `POST /webhooks/targets` `{url: <APP_URL>/api/webhooks/dakota, global: true}`.
5. Print the `DAKOTA_SIGNER_GROUP_ID=` / `DAKOTA_POLICY_ID=` lines to paste.

**`src/lib/dakota/provisioning.ts`** — the post-KYC pipeline, called from
`onKybStatus` and from a manual retry endpoint (`POST /api/customers/provision`)
the onboarding page can hit if a step failed:

```ts
export async function provisionCustomer(userId: string): Promise<void>
// step 1: wallet        — skip if wallets row exists
//   createWallet(customer_id, family "evm",
//                signer_groups [env], policies [env])
// step 2: self recipient — skip if dakota_customers.self_recipient_id set
// step 3: crypto destination (wallet.address on DAKOTA_NETWORK_ID)
//                        — skip if self_destination_id set
// step 4: onramp account — skip if dakota_rails has an onramp row
//   (USD→USDC, capabilities ["ach","fedwire"], rail "ach")
//   → bank_account details into dakota_rails.bank_account_info
```
- **Idempotency keys are deterministic**: `uuidv5(`${userId}:${step}`, MONETA_NS)`
  — a retried step replays Dakota's cached response instead of creating a
  duplicate resource.
- **Migration 0002**: add `self_recipient_id`, `self_destination_id` (nullable
  text) to `dakota_customers` — step-completion tracking lives where the state is.
- `/api/wallets` POST is rewritten to delegate to the provisioning module (no
  more `signerGroups: []`).
- **Customer-creation move** (gap #9): out of `register` (fire-and-forget) into
  onboarding start — `POST /api/customers` creates the Dakota customer on first
  visit if missing, with the same deterministic-idempotency retry pattern.

### Definition of "ready for credentials"

When all three PRs land: `npm test` green, plus a scripted local drill —
simulate KYB activation → provisioning runs against a mocked Dakota client →
simulate deposit webhooks → balance credits exactly once → simulate ACH return →
clawback entry appears. The day the sandbox key arrives, the only new code is
`npx tsx scripts/dakota-bootstrap.ts` and flipping `BYPASS_KYC=false`.

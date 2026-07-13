# Dakota Docs Audit — 2026-07-13

> Full read of docs.dakota.xyz (all 129 pages + OpenAPI 3.0.3 spec) diffed
> against our implementation. Method: two parallel agents (docs digest vs
> code inventory), findings verified in code. Fixes applied same day.

## Verified CORRECT (no action)

- Base URLs, `x-api-key`, `x-idempotency-key` on POST (UUID), 60 req/min
  (our 55/min throttle), `Retry-After` handling, RFC 9457 error parsing.
- Intent signing byte-for-byte: RFC 8785 JCS → SHA-256 → ECDSA P-256 →
  ASN.1 DER → base64; snake_case; string amounts; omit-never-null; flat
  `{signatures, intent}`; SendTransactionIntent has no `type` field; the
  NEW optional `context_digest` field is already in our types.
- Webhook verification exactly right: Ed25519 over `timestamp + body` (no
  separator), 300s window, headers, and both published public keys match
  our hardcoded constants (sandbox `7a2f…8a5f`, prod `65b7…8be4`).
  Retry contract (10 attempts/~48h), at-least-once, unordered — all match
  our inbox design. Our tolerance for the legacy `{event, data}` envelope
  shape is justified (docs still show it in customer-event examples).
- One-off path is `POST /transactions` (docs pages saying
  `/transactions/one-off` are stale — not in the spec). `send_amount`
  semantics, cancellations endpoint, status enums incl. both `cancelled`
  and `canceled` spellings: all as implemented.
- fiat_us / fiat_iban / crypto destination required fields: our validators
  match the OpenAPI spec (which is STRICTER than the guide pages — we
  match the spec).
- Bootstrap resource creation (signers/groups/policies/webhook targets),
  provisioning payloads, PoA reason codes and $3k/7-day threshold,
  transition guard (permissive between non-terminal states covers the
  `pending → in_progress → completed` wallet flow).

## FIXED (commit accompanying this doc)

1. **Wallet balances shape** — we parsed `{data:[{network_id, asset,
   balance}]}`; the API returns `{wallet_id, address, balances:[{asset:
   AssetDeployment, amount_usd}], total_amount_usd}`. Balance fetch would
   have crashed on first real call. Client type + route consumer fixed.
2. **Onramp `capabilities`** — we sent `["ach","fedwire"]`; docs: "you can
   only request one in this list". Now `["us_bank_account"]`, which for
   onramps means ACH **and** Fedwire deposits.
3. **Sandbox KYB status value** — `kyb_approve` simulations emit
   `kyb_status: "approved"` (2 events, one per provider); our handler only
   activated on `"active"` → provisioning would never fire in the sandbox
   drill. Handler now normalizes `approved` → `active` (idempotent, so
   the duplicate event is harmless).
4. **`application_expires_at` is Unix NANOSECONDS** — we passed it to
   `new Date(string)` → Invalid Date. Now `Number(v) / 1e6`.
5. **ACH `payment_reference` length** — docs conflict (guide: ≤18; OpenAPI:
   1–10). Our default was 15 chars; now `MNTA XXXXX` = 10, safe under both.
6. **Recipient `external_id`** — not a documented RecipientRequest field;
   dropped from the self-recipient create (our DB tracks the linkage).

## OPEN QUESTIONS (verify on first sandbox run — listed in M2 drill)

- `GET /events` ordering is genuinely undocumented ("paginated event
  stream", no sort stated). Our oldest-first assumption + `orderingSuspect`
  runtime guard stands. Verify on first sweep; flip to `ending_before`
  pagination if it fires.
- Idempotency-key replay window duration is undocumented ("a certain time
  window") — our deterministic keys assume long replay; watch for
  duplicate-resource creation on long-delayed retries.
- Docs conflict on whether PUT/PATCH also want `x-idempotency-key`
  (auth.md says yes, api-keys page + OpenAPI say POST-only). We send
  POST-only per the spec; harmless to add later if PUTs appear.

## ENHANCEMENTS ADOPTED INTO THE PLAN (not blocking)

- **Webhook delivery-history API** (`GET /webhooks`, newest-first, 30-day
  retention, `cursor` pagination) + **`POST /webhooks/events/{id}/replay`**
  (operator role, 10 replays/event) — a second reconciliation path with
  DOCUMENTED ordering; candidate replacement for the /events sweep if
  ordering bites.
- **New outbound simulation types** (`ach_outbound_settled/returned/
  rejected/failed`, `fedwire_*`, `*_reversal`) — the M2 withdrawal drill
  should use these; also `GET /sandbox/scenarios` + stateful
  `simulations/{id}/advance` for compliance-hold/manual-review testing.
- Webhook attempt timeout is **20s** (not 30) — provisioning inside the
  KYB webhook can exceed it on a slow run; harmless (retries + idempotent
  steps drive completion) but consider async provisioning at M3.
- `X-RateLimit-Remaining` response headers exist — adaptive throttle
  possible later. MCP server (`mcp.platform.dakota.xyz`) available for
  read-only sandbox inspection from Claude Code.
- Sub-clients, `developer_fee_bps` (0–10000) on accounts AND one-offs,
  Sumsub token import, custom onboarding API — all confirmed available
  (BACKLOG items unchanged).

## SECURITY POSTURE vs DOCS GUIDANCE

Matches: HTTPS-only, key never logged, webhook signature + replay window,
per-env keys, 90-day rotation noted in M3, `DELETE /api-keys` (kill-all)
documented for incident response — worth noting in an ops runbook.
Gap accepted until M3: platform signer key + API key live in env, not a
secrets manager; single signer (threshold 1) — passkey/WEBAUTHN signers
and amount-threshold policies are documented and compatible with our
bootstrap when we want them (BACKLOG).

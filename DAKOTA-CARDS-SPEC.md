# Dakota Cards — Integration Spec (card provider)

Source: docs.dakota.xyz Cards guides + API reference (OpenAPI), read 2026-11-23. Cards.js package metadata checked on registry.npmjs.org the same day.
Audience: the engineer implementing a Dakota card provider next to the existing Dakota customers / wallets / transfers / webhooks integration.

> **Status: sandbox only.** Every Cards endpoint is marked "Sandbox only" and Dakota says endpoints, fields and flows can still change before release. Production responses never include the wallet `card` balance object. Build behind a flag and expect churn.

## 0. Read first — facts that change the design

1. **Virtual cards only.** Dakota issues virtual Visa debit cards. Physical cards are explicitly "not in the first release". No physical-card, shipping or PIN endpoints exist.
2. **No card balance.** A card spends the funding wallet's on-chain balance of one asset on one network (the wallet's *spend option*, default `RD` on Base). Dakota authorizes each purchase against the wallet's `card.available` in real time. There is no top-up step and no ledger transfer into a card.
3. **Async everything.** Cardholders and cards are created as `pending` and become `active` by webhook (`cardholder.updated`, `card.updated`). The card's `last4` can be `null` until then. Expiry is never returned by the API.
4. **PAN/CVV/expiry never touch our servers.** They render in the browser inside Lithic iframes through `@dakota-xyz/cards-js`. Our backend only mints a single-use reveal session.
5. **Codebase conflicts found** (read-only check of this repo):
   - `src/lib/dakota/provisioning.ts` attaches the one shared `DAKOTA_POLICY_ID` to every wallet. Card enablement needs **exactly one customer policy attached to that wallet only**, so enablement will fail with `409 card-enablement-precondition` / `customer_policy_shared`. See §2.3.
   - Wallets are funded with **USDC on Base**, but the default spend option is **RD on Base**. USDC deposits will not fund cards unless the account is allowed a USDC-on-Base spend option. The docs' only USDC example is `ethereum-mainnet`. See §8.
   - `src/middleware.ts` CSP has no `frame-src`, so `default-src 'self'` will block the Lithic reveal frames. See §6.4.
   - The project `.npmrc` maps the `@dakota-xyz` scope to `https://npm.pkg.github.com`, but Cards.js is published on public npm. `npm i @dakota-xyz/cards-js` currently fails with 401 from this repo. See §6.1.
   - `IssuedCard` in `src/lib/card-issuer.ts` requires `expMonth`, `expYear` and `panToken` synchronously. Dakota returns none of these (only `last4`, possibly `null` at create). The interface needs a pending/async shape.
   - The webhook target is registered with `global: true` (`scripts/dakota-bootstrap.ts`), so card events arrive with no target change. Unknown types must keep being ignored safely.

---

## 1. Capabilities and limits

| Topic | What the docs say |
| - | - |
| Card form | **Virtual only.** "Physical cards are not in the first release." No physical card support today. |
| Network | **Visa** debit. Transactions carry a nullable `network` string. |
| Currency | **USD only.** `currency` on create defaults to `USD` ("v1 is USD-only"); any other value is `400 invalid-request`. Foreign-currency purchases are converted by the network. Transactions expose `merchant_amount`, `merchant_currency`, `conversion_rate`. |
| Funding wallets | **EVM wallets only** (`family: "evm"`), owned by the customer the cards are for (wallet created with that `customer_id`). A Solana wallet gives `422 wallet-family-not-supported` on enablement and `400 invalid-request` on card create. |
| Funding asset/network | One **spend option** per wallet: one `spend_asset` on one `spend_network_id`, fixed forever at enablement. Default: `RD` on `base-mainnet` (sandbox: testnet RD on `base-sepolia`). Allowed options per account come from `GET /cards/spend_options` (doc example: `RD`/`base-mainnet`, `USDC`/`ethereum-mainnet`). Only that token on that network counts toward the card balance. Anything else does not fund cards, and purchases decline `insufficient_funds`. |
| Cards per wallet / cardholder | A wallet can fund many cards. A cardholder can hold many cards. All cards on a wallet share one available balance. |
| Cardholders per customer | Business customer: many (people on the onboarding application, or new people). Individual customer: **exactly one**, the customer themself. |
| Max active cards per cardholder | A cap exists (`400 limit-reached`). **The number is not documented.** |
| Spend limits | At most one per card: `{ interval, amount }`. `interval` is `per_transaction`, `daily`, `weekly`, `monthly`, `yearly` or `lifetime`. `amount` is an integer in **minor units** (cents), minimum 1. Calendar windows reset at midnight US Eastern (daily, Monday weekly, 1st monthly, Jan 1 yearly). A limit can be replaced but never removed. A program-wide cap set by Dakota can also apply; the lower wins. Without a limit, a card can spend up to the wallet's available balance. |
| Hold padding | A hold can be larger than the purchase. Restaurants/fast food (MCC 5812, 5814): +30%. Bars, taxis, beauty/barber/spa (5813, 4121, 7230, 7298), caterers (5811), parking (7523): +20%. Lodging (7011, 3501–3999) and cruise (4411): +15%. Car/truck/RV rental (7512, 7513, 7519, 3351–3500): the greater of +15% or +75 USD. US fuel pump status check (5542, 1.00 USD): holds 175 USD. Non-USD merchant currency: +3%. Holds do not stack (the highest wins). A purchase for the entire available balance can decline. |
| Reveal sessions | Single use, 5-minute TTL. Rate limit: **60/minute and 600/hour per account**, across all API keys (`429`). |
| 3-D Secure | Supported for merchants that ask. Dakota verifies the cardholder by their phone; we implement nothing. Result is `three_ds_result` on transactions. |
| Digital wallets | Apple Pay and Google Pay at launch, by **manual provisioning only**: the cardholder types or scans the card details into the wallet app. No push-provisioning API. Provisioning can send a code to the cardholder's phone or email. Transactions report `wallet_type` (`apple_pay`, `google_pay`, `samsung_pay`, `merchant`, `other`). |
| Card art | Dakota-configured designs per client: `GET /card_art`, chosen with `card_art_id` on create/update. Each design is approved per cardholder base (`commercial` = business, `consumer` = individual). Changing art on a card already in a wallet updates it there too. |
| Lost/stolen | `POST /cards/{card_id}/lost_stolen_report` and `/found_report` exist (§3.6). |
| PIN | Not shipped. The Cards.js changelog notes PIN setup is not in the package. |
| Country/state availability | **No list is published.** A customer in an unsupported country gets capability `unavailable` with `reason: "country_not_supported"` (or a `capability_enablement` requirement with that key). Phone validation is strict for `+1` numbers. The address model uses ISO 3166-1 alpha-2 countries and ISO 3166-2 subdivision regions. No US-state restrictions are documented. |
| Account cardholder base | Dakota configures whether our account issues to business customers, individual customers, or both. Otherwise: `403 cardholder-base-not-enabled`. |
| Not in first release | Physical cards. "Choosing which token and network fund cards" (yet the spend-option endpoint exists; see §8). Several assets per wallet. Withdrawing a wallet's enablement. Reading dispute reports back, and dispute webhooks. Refund payouts to the wallet (`refund_state` never reaches `paid`/`failed` yet). Cardholder review requests (always empty; submission returns `501`). |
| Fees | **Not mentioned anywhere** in the Cards docs. |

---

## 2. Prerequisites

Setup order: account activated (once) → customer accepts Cards terms (once per customer) → in parallel: create cardholder (once per person) and enable wallet (once per wallet) → create card.

### 2.1 Account activation (once, no API)

- Ask Dakota. Dakota configures business, individual, or both.
- **Sandbox:** no agreements needed; ask Dakota to switch Cards on for the sandbox account.
- **Production:** our company signs a **cards program addendum** and a **marketing attestation**.
- Until activated, every customer's `cards` capability is `unavailable`. On activation Dakota rechecks every customer and sends `customer.capability_status.updated` for each one that changes.
- Dakota must also provision the account's **card-settlement signer group** (Dakota-managed). If it is missing, enablement fails with `409 card-enablement-precondition` code `settlement_group_not_provisioned` or `settlement_group_ambiguous`. We will see `signer_group.member_added` at `signer_group_version` 0 when Dakota creates it.
- Detecting "account not activated": a create call returns `403 cards-capability-unavailable` with an `errors[]` entry whose `field` is `client_not_activated` and `code` is `capability_enablement`. Never show this to the customer as a task.

### 2.2 Per-customer terms acceptance

Precondition: the customer has finished Dakota onboarding and the application is **approved**. The terms link appears only then.

What we collect: **nothing ourselves.** The customer accepts on a Dakota-hosted page. There is no API to accept on their behalf. Our job is to show the link and track status.

1. `GET /customers/{customer_id}/capabilities`. Find the entry with `capability: "cards"`.
2. Act on `status`:

   | `status` | Meaning | Our action |
   | - | - | - |
   | `action_required` | Something the customer can do is outstanding | Show the `url` of the `terms_acceptance` requirement |
   | `enabling` | Customer accepted; Dakota finishing setup | Wait for the webhook |
   | `available` | Ready | Allow cardholder, enablement, card creation |
   | `unavailable` | Not in rollout, account not activated, or not offered | Only Dakota can change it; alert ops |

3. Requirement object: `type` (`terms_acceptance`, `document`, `capability_enablement`; treat unknown types as unsatisfied), `key`, `version?`, `title`, `url?`, `severity` (`required` blocks; `requested` is non-blocking). `requirements` lists only outstanding items.
4. Read the terms `key`; don't hard-code it. Business: `cards_tos`. Individual: may be `cards_consumer_tos`.
5. Link rules: send the `url` **exactly as received**. Fetch it **right before showing it**, because the token expires and Dakota sends **no webhook when it reissues the link**. Never reuse a link from an older webhook. An empty `url` means it can't be accepted online here; contact Dakota (Dakota can record an offline acceptance).
6. Wait for `customer.capability_status.updated` with `capability: "cards"` and `status: "available"`. Path: `action_required` → `enabling` → `available`. An individual can go straight to `available`. If it stays `enabling` for more than a few minutes, contact Dakota.

Until `available`, cardholder create, wallet enablement and card create return:
- `403 cards-tos-not-accepted`: only the terms are missing. `field` is the terms key; `resolution_url` carries the same link.
- `403 cards-capability-enabling`: the customer is done; Dakota is finishing. Retry when the webhook says `available`. Don't poll.
- `403 cards-capability-unavailable`: something else is outstanding (see `errors`).

Also collect for cardholders (§3.2): the cardholder's **own mobile number** (E.164) and **own email**. The phone is the 3-D Secure channel. Shared or placeholder numbers make online purchases fail.

### 2.3 Wallet card enablement (once per wallet)

**What it grants.** Wallets are non-custodial, so the customer signs a one-time "card-settlement enablement" per wallet. It lets Dakota recover settled card spend from **this wallet only**, to **one destination Dakota pins at enablement** (`settlement_destination`). It covers every card on the wallet. It does not let Dakota move funds from other wallets, send elsewhere, change the destination, or act as a general spending authority. The wallet keeps working normally. **It cannot be withdrawn yet** (`detach_requested`/`detached` states exist but have no API).

**Preconditions on the wallet.**
- EVM wallet created **with the customer's `customer_id`**. A wallet with no customer gives `400`. A card on another customer's wallet gives `404 not-found`.
- **Exactly one customer policy, attached to this wallet only.** Violations give `409 card-enablement-precondition` with `errors[0].code`:
  - `no_customer_policy`
  - `customer_policy_ambiguous` (more than one attached)
  - `customer_policy_shared` (the policy is also on another wallet)
- Dakota's documented setup: register the customer key (`POST /signers`) → signer group with it in `member_keys` (`POST /signer-groups`) → a **policy for this wallet only** with `signer_group_id` = that group (`POST /policies`) → `POST /wallets` with `name`, `customer_id`, `family: "evm"`, `signer_groups`, `policies`.

**Signing requirement (platform signer / policy).**
- The intent is an endorsed request, signed like every other intent: RFC 8785 JCS canonicalization → SHA-256 → ECDSA P-256 → ASN.1 DER → base64. Passkeys/WebAuthn are also accepted. The existing `signIntent()` in `src/lib/dakota/signing.ts` matches this pipeline.
- **Who must sign:** the **governance of the signer group named in the wallet's customer policy `signer_group_id`**: its members, or the members of its governing group if `governance_signer_group_id` is set. No approval threshold from the wallet's policies applies. A key from any other signer group on the wallet is refused.
- **How many:** that group's `effective_governance_threshold`. It is 1 by default. It is 2 when governance enforcement is on and the governing group has 3 or more members. An explicit `governance_threshold` overrides both. Each signature must come from a distinct key. Max 16 signatures, each up to 8192 bytes.
- Dakota-managed card-settlement signer keys never count toward governance.
- **Implication for this repo:** every wallet holds the shared platform policy `DAKOTA_POLICY_ID` (signer group = the platform group, single platform key). To enable a wallet:
  1. Create a **dedicated policy per card-funding wallet** (`POST /policies`, `signer_group_id` = platform group or a per-customer group).
  2. Attach it with an endorsed `attach_policy_to_wallet`.
  3. Detach the shared policy with an endorsed `detach_policy_from_wallet`. With governance enforcement on, these need the governance of every signer group on the wallet, except Dakota-managed ones.
  4. Or create card-funding wallets fresh with a dedicated policy.

  With the platform key as the only governance member, **the platform signs the enablement, not the end customer.** The docs describe this as "the customer signs" and call the completed event "their acceptance record". Confirm with Dakota that platform-signed enablement is acceptable (§8).

**Intent (signed exactly as sent):**
```json
{
  "type": "enable_card_settlement",
  "wallet_id": "<wallet KSUID>",
  "idempotency_key": "<UUID>",
  "spend_asset": "USDC",
  "spend_network_id": "base-mainnet"
}
```
- `idempotency_key` **must be a UUID** (else `400`). Use the same UUID as the `X-Idempotency-Key` header, as the docs do.
- `spend_asset` and `spend_network_id` are optional. Send **both or neither**: one alone is a `422` validation error. Never send `null` or `""` (`400`); omit them instead. Omitted means the account default, and the response/event then reports the default, unsigned.
- **Never include `settlement_destination`** (`400`). Dakota supplies it.

---

## 3. Endpoints, in call order

### 3.0 Conventions shared by every call

- **Hosts:** sandbox `https://api.platform.sandbox.dakota.xyz` (Cards live here only). Production `https://api.platform.dakota.xyz`.
- **Auth:** `x-api-key: <key>`.
- **Idempotency:** send `X-Idempotency-Key: <UUID>` on every `POST`, `PATCH` and `PUT`, **except `POST /cards/{card_id}/reveal_session`** (never send one there; every call mints a new session).
  - A key is scoped to client + method + path and kept 24 h after a successful (<400) response.
  - Same key + same body (key order and whitespace ignored) replays the first success. After an error, a retry with the same key executes again.
  - Same key + different body after a success gives `422 idempotency-key-reused`.
  - Exceptions: wallet enablement caches policy-engine refusals (§3.3). Sandbox simulation keys are single-simulation (§3.8).
  - `DELETE /cardholders/{id}` documents no idempotency header.
- **Errors** are problem+json: `{ type, title, status, detail, errors?: [{ field, message, code }], instance?, request_id? }`. `type` is `https://docs.dakota.xyz/api-reference/errors#<slug>`, so **switch on the slug after `#`**. Some problems add members such as `person_id`, `cardholder_id` or `resolution_url`.
- **Cards-wide 5xx:** `501` not yet implemented. `502` card provider unavailable (retry with backoff). `503` Cards not available in this environment.
- **Rate limits:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. A `429` carries `Retry-After`.
- **IDs** are 27-char KSUIDs (`^[0-9A-Za-z]{27}$`).
- **Pagination** on list endpoints: `limit` (1–100, default 20), `starting_after`, `ending_before`. Response: `{ data: [...], meta: { total_count, has_more_after, has_more_before } }`.
- **Amounts:** card transaction amounts are decimal strings in major units with trailing zeros dropped (`"39.5"`, `"39"`), so parse them as decimals. `spend_limit.amount` is an integer in minor units. Wallet `card` balances are 2-dp decimal strings.
- **Timestamps:** resources use Unix seconds (`created_at`, `updated_at`). Reveal `expires_at` and dispute timestamps are RFC 3339.

### 3.1 Customer Cards capability

**`GET /customers/{customer_id}/capabilities`**
- 200: `{ capabilities: [{ capability, status, requirements: [CapabilityRequirement], reason? }] }`
  - `status`: `available`, `enabling`, `action_required` or `unavailable`.
  - `reason`: only on `unavailable`; known value `country_not_supported`. Treat unknown values as "unavailable, reason not known".
- Errors: `400`, `401`, `404`, `500`, `503` (capability provider not configured).

### 3.2 Cardholders

**`GET /customers/{customer_id}/persons`** (business customers; not paginated)
- 200: `{ data: [{ id, first_name, last_name, roles[], cardholder_id|null, phone_number?, missing_for_cards[] }] }`
  - `roles`: `ubo`, `control_person`, `applicant`, `individual`.
  - `missing_for_cards`: `phone` and/or `email`. Empty means `person_id` alone is enough.
  - `cardholder_id` is set if a live cardholder exists. A `declined` one still counts, so delete it before re-enrolling. Deleted/closed cardholders don't count.
  - `phone_number` is E.164. It can be present but unusable; `phone` then stays in `missing_for_cards`.
- Empty list if the customer has no approved application. Persons whose own decision was declined, auto-declined or withdrawn are excluded.
- A UBO or control person added by a later review has no bank record yet. Creating from them gives `409 cardholder-person-unavailable` until Dakota adds it.

**`POST /customers/{customer_id}/cardholders`** (idempotency key required). The body is one of three shapes, chosen by which fields are present:

| Shape | Customer | Required | Optional |
| - | - | - | - |
| `CreateCardholderForIndividualCustomerRequest` | Individual | — | `phone` (required if none usable on file), `email` (required only if none on file; must match the one on file otherwise), `external_id`, `address` |
| `CreateCardholderFromPersonRequest` | Business | `person_id` | `phone`, `email` (same on-file rules), `external_id`, `address` |
| `CreateCardholderForNewPersonRequest` | Business | `first_name`, `last_name`, `email` (≤254), `phone` | `external_id`, `address` |

- Individual customers must not send `person_id`, `first_name` or `last_name`. `person_id` together with names is ambiguous and refused.
- `phone`: E.164. A `+1` number must have 10 digits after `+1`, with area code and exchange not starting with 0/1. A sent `phone` overrides the one on file for the card only; the file is unchanged.
- `address` (optional; defaults to the customer's address): `street1*`, `street2`, `street3`, `city*`, `region` (ISO 3166-2 subdivision part, e.g. `CA`), `postal_code`, `country*` (ISO alpha-2).
- `external_id`: our lookup key. Not unique.
- **201** Cardholder: `{ id, customer_id, first_name, last_name, email, phone, status, open_requirements: { count, types[] }, external_id, created_at, updated_at }`. `status` is `pending`.
- Errors:
  - `400 validation-error`: missing or invalid phone (`errors[].code: cardholder_phone_invalid`), email mismatch or missing, bad `person_id`.
  - `403 cards-tos-not-accepted`, `cards-capability-enabling`, `cards-capability-unavailable`, `cardholder-base-not-enabled`.
  - `409 cardholder-person-exists`: the email belongs to another person. If the problem has `person_id`, retry with it; otherwise use another email.
  - `409 cardholder-already-exists`: use the `cardholder_id` it names. An individual customer may hold one non-deleted cardholder.
  - `409 cardholder-person-unavailable`: contact Dakota.
  - `409 conflict` (replay).
  - `422 idempotency-key-reused`, `501`, `502`, `503`.

**Cardholder `status`:**

| Status | Meaning |
| - | - |
| `pending` | Screening; usually seconds |
| `under_review` | Reviewer holds it |
| `request_for_information` | Reviewer needs something from **us**; never cardholder-facing |
| `active` | Cards can be issued |
| `suspended` | All cards frozen, no unfreeze, no new cards; only Dakota lifts it. Lifting restores cards the suspension froze, unless they were closed or changed meanwhile |
| `declined` | Final; delete before re-enrolling |
| `closed` | Deleted; appears only in the final `cardholder.updated`; no longer returned by REST |

Transitions: `pending`→`active` · `pending`→`under_review`→(`request_for_information`⇄`under_review`)→`active`|`declined` · `active`⇄`suspended` · `active`|`suspended`|`declined`→`closed`.

**`GET /cardholders/{cardholder_id}`** returns the Cardholder. Errors: `401`, `403`, `404`.

**`GET /customers/{customer_id}/cardholders?external_id=&limit=&starting_after=&ending_before=`** is a paginated list. The `external_id` match is exact and case-sensitive, and can return several.

**`PATCH /cardholders/{cardholder_id}`** (idempotency key). Body: any of `first_name`, `last_name`, `email`, `phone`.
- Only `email` and `phone` reach the card processor; names update Dakota's record only.
- `400` if the processor can't accept the value.
- `409` while still being screened or reviewed. A screened enrolled cardholder's email/phone can't change: delete and re-enroll. An individual's email always comes from the application.

**`DELETE /cardholders/{cardholder_id}`**: soft delete, `204`.
- **Close every card first** (including frozen ones). The reference says the refusal is `409 cardholder-has-open-cards` with `errors[]` listing `{ field: "card_id", message: <card id>, code: "card_<status>" }` (up to 50). The guide says it currently arrives as a `502` with a count in `detail`. **Handle both.**
- Also `409 cardholder-provisioning` (still being set up).
- Then wait for `cardholder.updated` with `status: "closed"`. Transactions on closed cards keep arriving. The person can be enrolled again.

**Review (not live):**
- `GET /cardholders/{cardholder_id}/application` returns `{ cardholder_id, status, requested_information[], created_at, updated_at }`.
  - `status`: `submitted`, `under_review`, `request_for_information`, `approved` or `declined`.
  - Each `requested_information` item: `{ id, type, description, status }`, with `type` `document`/`field`/`question` and `status` `missing`/`on_file`.
- `POST /cardholders/{cardholder_id}/application/information` takes `{ responses: [{ request_id, value? }] }` (≤50) and returns `202` `{ application, upload_targets? }`.
- **Today the list is always empty and submission returns `501`.** Build only an ops alert.

### 3.3 Wallet enablement

**`GET /cards/spend_options`** (optional, before enabling)
- 200: `{ options: [{ spend_asset, spend_network_id }], default: { spend_asset, spend_network_id } | null }`.
- `default: null` means every enablement must name an option. Use the strings exactly as listed; sandbox networks are testnets such as `base-sepolia`.
- `404`: Cards not enabled in this environment.

**`GET /wallets/{wallet_id}/card_enablement`** (read state; no side effects)
- 200: `{ state, settlement_destination, spend_asset?, spend_network_id? }`.
  - For `not_enabled`, `settlement_destination` is the destination that would be pinned; it is informational and never signed.
  - `spend_*` appear once an enablement exists.
- `403` capability problems, only when nothing is on record. `404`. `422 wallet-family-not-supported`. `500`, `503`.

**`POST /wallets/{wallet_id}/card_enablement`** (idempotency key; use the intent's `idempotency_key`)
- Body: `{ "signatures": ["<base64>"...], "intent": { type: "enable_card_settlement", wallet_id, idempotency_key, spend_asset?, spend_network_id? } }`. Both spend fields must also be in the request `intent` with identical values.
- 200: `{ state, settlement_destination, spend_asset, spend_network_id }`. `state` is usually `active`, but can be `attaching`; **handle both**. `wallet.card_enablement.completed` fires once when it becomes `active`, either in this call or later.

| `state` | Meaning |
| - | - |
| `not_enabled` | Nothing signed |
| `attaching` | Signed but not in force; cards can't be issued. **Nothing moves it forward without another call.** |
| `active` | Cards can be issued |
| `detach_requested` / `detached` | Withdrawal states; no API to trigger them yet |

**Refusals:**

| Response | Cause | Action |
| - | - | - |
| `400` | Malformed; wallet without customer; `settlement_destination` in intent; null/empty spend field; non-UUID `idempotency_key`; freshly re-signed copy of an intent already submitted | Fix and resend |
| `403 cards-tos-not-accepted` / `cards-capability-enabling` / `cards-capability-unavailable` | Capability not `available` | §2.2 |
| `404` | Not found / not ours | — |
| `422 wallet-family-not-supported` | Non-EVM wallet | Check `family` before asking for a signature |
| `422 card-spend-option-not-allowed` / `card-spend-option-required` | Option not allowed, or none named and no default | `errors[]` lists allowed options as `{ field: "spend_option", message: "ASSET:network", code: "allowed_option" }`; split at the first colon |
| `422` validation | Only one spend field sent | Send both or neither |
| `409 card-spend-option-conflict` | Wallet already enabled on another option | Read GET and use its option |
| `409 card-enablement-precondition` `no_customer_policy` / `customer_policy_ambiguous` / `customer_policy_shared` | Policy setup | Fix policies, then **new** `idempotency_key`, **re-sign**, resubmit |
| `409 card-enablement-precondition` `settlement_group_not_provisioned` / `settlement_group_ambiguous` / `settlement_policy_ambiguous` | Dakota-side setup | Contact Dakota |
| `409 card-enablement-conflict` | Destination changed, withdrawal in progress, or a concurrent change | Retry if `detail` says so; else contact Dakota |
| `409 conflict` | Other conflicts, **or a replay of an already-refused request** (24 h) | Read `detail` |
| `503` | Transient | Replay the **same intent with the same signatures** |
| `500` | Unexpected | — |

Ordering: a `422` comes before a `403`. Only `card-enablement-precondition` carries `errors[0].code`, so switch on `type` first.

Retry rules:
- Replaying on an `active` enablement returns `200` and does nothing.
- After a transient failure, replay identical intent + signatures. A re-signed identical intent is refused (`400`), because the signatures are part of the replay key.
- After a rejected endorsement or a fixed precondition, use a new `idempotency_key` and new signatures.
- If GET reports `attaching` after a refusal, submit a new signed intent with a new key; this resumes it. **Don't only wait for the webhook.**

### 3.4 Card art (optional)

- **`GET /card_art?cardholder_base=commercial|consumer`** (paginated) returns `{ id, name, status, is_default, cardholder_bases[], image_url, background_color, text_color, created_at, updated_at }`.
  - `status`: `active` or `retired`. Retired designs are listed but can't be used for new cards.
  - At most one design has `is_default`.
- **`GET /card_art/{card_art_id}`** returns one design; `404` if unknown or not ours.

### 3.5 Cards

**`POST /customers/{customer_id}/cards`** (idempotency key)
- Required: `cardholder_id`, `wallet_id`.
- Optional:
  - `spend_limit: { interval, amount }`
  - `currency` (default `"USD"`; USD only)
  - `external_id` (not unique)
  - `nickname` (≤64)
  - `card_art_id`. Omit it to use our default art if approved for the customer's base, otherwise the program's standard design.
- **201** Card (status `pending`):
  - `id`, `cardholder_id`, `customer_id`, `wallet_id`, `status`, `version`
  - `spend_asset`, `spend_network_id`, `last4|null`, `spend_limit?`
  - `external_id`, `nickname`, `card_art_id`, `card_art: { id, name, image_url, background_color, text_color } | null`
  - `freeze_sources[]`, `created_at`, `updated_at`
  - GET responses also embed `cardholder` and `wallet: { address, family }`.
- Then wait for `card.updated` with `status: "active"`. In the UI, `pending` means "being issued", not an error.
- Errors:

| Response | Meaning |
| - | - |
| `400 invalid-request` | Malformed body, non-USD `currency`, bad `spend_limit`, non-EVM wallet |
| `400 spend-limit-rejected` | The program refused the limit (`errors[]` names `spend_limit`) |
| `400 limit-reached` | Cardholder already has the max active cards |
| `403 cards-tos-not-accepted` / `cards-capability-enabling` / `cards-capability-unavailable` | §2.2 |
| `403 cardholder-not-active` | Cardholder not `active`; status reported |
| `403 wallet-not-card-enabled` | Wallet enablement not `active` |
| `403 account-under-review` | Customer frozen; existing cards held |
| `404` | Includes a wallet belonging to another customer |
| `409 cardholder-reenroll-required` | Close cards, delete and recreate the cardholder |
| `409 wallet-owes-card-debt` | Wallet owes Dakota; retry after it is paid |
| `409 card-art-not-active` / `card-art-base-not-approved` / `card-art-changed` | Retired art; art not approved for this base; retried with different art (resend the original `card_art_id`) |
| `409 card-spend-option-conflict` | Provider mismatch; contact Dakota |
| `409` (generic) | A card already exists for this request |
| `422 card-art-rejected`, `422 card-spend-option-unavailable` | Contact Dakota; retrying doesn't help |
| `422 idempotency-key-reused`, `501`, `502`, `503` | — |

**`GET /cards/{card_id}`** returns the Card with embedded `cardholder` and `wallet`. Closed cards are still returned (`status: "closed"`), not `404`.

**`GET /customers/{customer_id}/cards`**: filters `cardholder_id`, `status` (`pending`/`active`/`frozen`/`closed`/`overdrawn`), `external_id`, plus pagination. **Closed cards appear only under `status=closed`.**

**Card `status`:**

| Status | Purchases | Set by |
| - | - | - |
| `pending` | Declined | Create |
| `active` | Approved within available balance + limit | Webhook after issue; our unfreeze |
| `frozen` | Declined | Our freeze, lost/stolen, cardholder suspension |
| `overdrawn` | Declined | **Dakota only**, when the wallet owes card debt (uncovered spend or lost dispute). Returns to the prior `active`/`frozen` when paid |
| `closed` | Declined forever | Us or Dakota; terminal |

Transitions: `pending`→`active` · `active`⇄`frozen` · `active`|`frozen`→`overdrawn`→(previous) · `active`|`frozen`|`overdrawn`→`closed`.

`freeze_sources` lists everything holding a freeze, distinct and sorted. Values today: `manual` and `lost_stolen`. Only `manual` is liftable by us. Treat unknown values as not liftable. A card frozen by cardholder suspension shows `frozen` with an **empty** `freeze_sources`.

`version` is int64, +1 on every change that emits `card.created`/`card.updated`. Keep the highest applied version per card and **drop any event or API response whose version is not greater**.

**`PATCH /cards/{card_id}`** (idempotency key). Covers freeze, unfreeze, close, rename and art.
- Body: any of
  - `status`: `active` (unfreeze), `frozen` or `closed`
  - `nickname` (≤64; omit or `null` keeps it; can't be cleared)
  - `card_art_id` (omit or `null` keeps it; can't be cleared)
- With `status: "closed"`, nickname and art are ignored. A change applies from the next authorization; existing holds and approved purchases are not touched. Then wait for `card.updated` (it may fire even when nothing changed).
- Closing is permanent and idempotent: closing a closed card returns `200`. Closed cards stay readable; their transactions stay readable via `GET /card_transactions?card_id=`.
- Errors:

| Response | When |
| - | - |
| `403 card-closed` | Any change to a closed card, or a reveal |
| `403 cardholder-suspended` | Unfreeze while the cardholder isn't `active` (reported before `card-closed` if the cardholder wasn't deleted). Freeze and close still work |
| `403 card-freeze-held` | Unfreeze while a non-`manual` source holds it. `errors` names the sources. For `lost_stolen`, file a found report first |
| `403 card-not-activated` | Unfreeze of a pending or not-yet-activated card. The whole request fails, nickname included |
| `409 card-overdrawn` | Freeze or unfreeze of an overdrawn card. Whole request fails. Close and rename still work |
| `409 wallet-owes-card-debt` | Activation while the wallet owes debt |
| `409 card-art-not-active` / `card-art-base-not-approved`; `422 card-art-rejected` | Art problems |
| `400 spend-limit-rejected`, `422 idempotency-key-reused`, `501`, `502` | — |

**`PUT /cards/{card_id}/spend_limit`** (idempotency key)
- Body `{ interval, amount }`, both required. `amount` is an integer ≥1 in minor units.
- Wholesale replacement: idempotent, applies from the next purchase, claws nothing back. Allowed on frozen or held cards; `403 card-closed` on closed ones.
- Returns 200 with the Card.
- Errors: `400 spend-limit-rejected` (card keeps its old limit), `403 card-closed`, `404`, `422`, `502`.
- Limits count the purchase amount, not the hold. A `per_transaction` purchase exactly at the limit is allowed; strictly over is declined `spend_limit_exceeded`. Fuel and tip categories can settle above a per-transaction limit.

### 3.6 Lost / stolen

- **`POST /cards/{card_id}/lost_stolen_report`** (idempotency key; no body). Dakota freezes the card, pauses it at the issuer, and adds `lost_stolen` to `freeze_sources`.
  - Safe to repeat (200, no-op).
  - An `overdrawn` card keeps that status.
  - Errors: `403 card-closed`, `409 card-not-reportable` (not activated or already closed), `502`.
  - Not a dispute.
- **`POST /cards/{card_id}/found_report`** (idempotency key; no body). Clears the report (also one set by a dispute filed with `card_lost`/`card_stolen`).
  - **The card stays frozen.** Follow with `PATCH status: "active"`. A `manual` freeze stays until lifted separately.
  - Safe to repeat.
  - Errors: `403 card-closed`, `502`.

### 3.7 Secure card data: backend side of Cards.js `fetchSession`

**`POST /cards/{card_id}/reveal_session`** — **no `X-Idempotency-Key`**
- Body:
  - `session_type`: `"card_details"` (the only value)
  - `origin`: the exact HTTPS origin of the page showing the card. Scheme + host + non-default port only; no path, query or fragment. A trailing `/` counts as a path and returns `400`. Plain `http://localhost` is rejected, including in development.
- 200: `{ session: string, expires_at: RFC3339, provider?: string }`. Ignore `provider` and don't forward it. Sessions are single use and expire after 5 minutes.
- Errors:
  - `400` (origin).
  - `403 card-closed`.
  - `404`.
  - `409 card-not-active` (pending, frozen or overdrawn), per the reference. **The guide says these currently fail with a 5xx**, so check `status === "active"` before minting.
  - `429`: 60/min and 600/h per account.
  - `501`, `502`, `503`.
- **Our backend is the access check.** Authenticate the user and confirm they own `card_id` on every mint. Dakota only checks that the card belongs to our account.

### 3.8 Balances and transactions

**`GET /wallets/{wallet_id}/balances`** (existing endpoint) adds `card` (sandbox only):
`{ currency: "USD", total, held, outstanding, available, spend_asset, spend_network_id }`

| Field | Meaning |
| - | - |
| `total` | Confirmed balance of the spend asset; can trail the chain by minutes; rounded down |
| `held` | Card holds, including cleared-but-unswept spend, plus wallet sends in flight; rounded up |
| `outstanding` | Settled spend the wallet couldn't cover; rounded up. **Currently always `0.00`** |
| `available` | `max(0, total − held − outstanding)`. **Show this one** |

- `card` is present when the enablement is `active`, `detach_requested` or `detached`.
- It is **absent** (never `null`) when there is no enablement, while `attaching`, or when the live read fails or is slow. Treat absence as "try later", not an error.

**`GET /card_transactions`**: filters `customer_id`, `card_id`, `cardholder_id`, plus pagination. A foreign `customer_id`/`cardholder_id` gives `404`.
**`GET /card_transactions/{card_transaction_id}`**.

Card transaction object:

| Group | Fields |
| - | - |
| Identity | `id`, `card_id`, `customer_id`, `status` |
| Amounts | `auth_amount` (`null` only for force posts), `cleared_amount`, `outstanding_amount`, `returned_amount`, `hold_amount`, `currency` |
| Merchant | `merchant_descriptor`, `merchant_category`, `merchant_mcc`, `merchant_city`, `merchant_state`, `merchant_country`, `merchant_amount`, `merchant_currency`, `conversion_rate` |
| Authorization | `authorization_code`, `entry_mode` (`contactless`/`in_store`/`online`/`unknown`), `wallet_type`, `three_ds_result` (`authenticated`/`attempted`/`failed`/`not_performed`) |
| Settlement | `settlement_date` (date), `network` |
| Events | `events[]`: approved network events, each `{ type, amount, created_at }` |
| Refund | `refund_state` (`pending`/`paid`/`reversed`/`failed`, `null` = no refund) |
| Decline | `decline_reason`, `decline_code` (raw; support only), `decline_detail` (`hold_adjustment`) |
| Timestamps | `created_at`, `updated_at`, `completed_at` |

Notes:
- `hold_amount` is the reservation: the purchase plus any MCC or +3% currency padding.
- Event `type` is one of `authorization`, `authorization_increase`, `authorization_update`, `authorization_reversal`, `authorization_expiry`, `clearing`, `authorization_and_clearing`, `refund`, `refund_reversal`, `force_post`, `other`. Each amount means what its type states, so **never sum them**.

`status`: `pending`, `authorized`, `declined` (final), `partially_cleared`, `cleared`, `auth_reversed`, `expired`, `force_posted`, `returned`, or `disputed` (reserved, not sent).

### 3.9 Disputes

**`POST /card_dispute_reports`** (idempotency key)

| Field | Type | Req | Notes |
| - | - | - | - |
| `card_id` | KSUID | ✓ | |
| `card_transaction_id` | KSUID | | Send if known; must belong to `card_id` (else `400`). Don't delay reporting to find it |
| `client_reference` | string 1–255 | ✓ | Our case ID, unique per client. A duplicate returns `409` naming the existing report, so timeout retries are safe |
| `reason` | enum | ✓ | `unauthorized`, `not_received`, `incorrect_amount`, `duplicate`, `cancelled_recurring`, `other` |
| `description` | string ≤4000 | | Cardholder's account; not echoed back |
| `disputed_amount` + `disputed_currency` | decimal string (major units) + ISO 4217 | | Both or neither; omit for a full dispute |
| `consumer_notified_client_at` | RFC 3339 | ✓ | When the cardholder told us; ≤ `client_forwarded_at`; not in the future |
| `client_forwarded_at` | RFC 3339 | ✓ | When we told Dakota; not in the future |
| `filing_reason` | enum | | **Reference only (not in the guide).** If sent, Dakota files with the network during the request; this is irreversible. Values: `card_not_present`, `card_lost`, `card_stolen`, `card_never_received`, `counterfeit`, `account_takeover`, `product_not_received`, `not_as_described`, `credit_not_processed`, `cancelled_recurring`, `paid_by_other_means`, `duplicate_charge`, `late_presentment`, `incorrect_transaction_code`, `no_authorization`, `declined`, `incorrect_amount`, `atm_cash_not_dispensed`, `atm_deposit_wrong_amount`, `atm_deposit_missing` |
| `card_transaction_ids` | KSUID[] ≤100 | | Required with `filing_reason` (except `atm_deposit_missing`, which needs `[]`). Must include `card_transaction_id` |

- **201** report:
  - `id`, `card_id`, `card_transaction_id|null`, `client_reference`, `reason`
  - `state`: `received` when a transaction was named, `awaiting_transaction` otherwise; later `filed_at_vendor`, `linked`, `ambiguous`, `rejected`
  - `filing_state`: `not_filed`, `pending`, `filed`, `refused`, `withdrawn` or `abandoned`
  - `filing_reason|null`, `provider_filing_accepted_at|null`, `disputed_amount|null`, `disputed_currency|null`
  - `consumer_notified_client_at`, `client_forwarded_at`
  - `dakota_filed_with_vendor_at|null`, `vendor_dispute_reference|null`, `rejection_reason|null`
  - `created_at`, `updated_at`
- **Store the create response; it is our only view.** There is no GET and no webhook yet.
- Reporting does not change the card or transaction, reverse a charge, or credit the wallet.
- Errors:
  - `400`: invalid, and nothing stored. Exception: with `filing_reason`, the network may have refused the filing after the report was stored; a resend then gives `409`.
  - `404`: also possible when stored with `filing_reason`.
  - `409` duplicate `client_reference`.
  - `422` idempotency.
  - `500 card-dispute-not-fileable`: nothing recorded; don't resend; contact Dakota.
  - `502` / `503`: recorded with `filing_state: not_filed`; contact Dakota, don't resubmit.
- A `not_filed` report that carries a `filing_reason` needs follow-up with Dakota.

### 3.10 Sandbox simulation endpoints (`403` in production)

**`POST /sandbox/simulate/onboarding`** (idempotency key)
- Body: `{ type: "kyb_approve", applicant_id: <customer application_id>, simulation_id: <unique string 1–128> }`.
- Use `kyb_approve` for individuals and businesses. **Not `kyc_approve`**, which only changes the application status.

**`POST /sandbox/wallets/{wallet_id}/faucet`** (idempotency key)
- Body: `{ asset: "RD", amount: "2.00" }`. `asset` only supports `RD`; `amount` is a decimal string, max 2.00.
- 202: `{ simulation_id, wallet_id, asset, amount, status: "accepted", tx_hash? }`. Ignore `tx_hash`.
- Sends testnet RD on Base Sepolia through the normal deposit path.
- Errors:
  - `409`: key reused, used on another simulation, or a failed earlier attempt. Use a new key.
  - `422`: over the cap, unreachable wallet, or client not provisioned.
  - `429 sandbox-faucet-wallet-daily-limit` / `sandbox-faucet-client-daily-limit` (clear within 24 h; 5 calls per wallet per day).
  - `429 sandbox-faucet-float-floor`: contact Dakota.

**`GET /sandbox/simulations/{simulation_id}`**
- Relevant fields: `simulation_id`, `state` (`accepted`/`rejected`; **not progress**), `state_position`, `completed_at`, `metadata.failure_reason`, `card_transaction_id`, `wallet_id`, `operational_transfer_id`, `amount`, `currency`, `created_at`.
- Faucet: done when `state_position` is `completed`; failed when `state: rejected` + `state_position: failed` (call the faucet again with a new key).
- Card simulation: `accepted` while open, `failed` on failure (reason e.g. `declined:INSUFFICIENT_FUNDS`).

**`POST /sandbox/cards/simulate/transaction`** (idempotency key; "Simulate a card authorization")

| Field | Type | Req | Notes |
| - | - | - | - |
| `card_id` | KSUID | ✓ | Card must be `active` (else `409 card-not-active`) |
| `amount` | decimal string ≤2 dp | ✓ except `balance_inquiry` | Capped at 2 USD (`422 sandbox-amount-cap-exceeded`) |
| `merchant` | object | | `descriptor*` (1–40), `mcc` (4 digits), `acceptor_id` (≤32), `city`, `state`, `country` (ISO **alpha-3**, e.g. `USA`) |
| `type` | enum | | `authorization` (default), `credit_authorization`, `financial_authorization` (clears immediately), `balance_inquiry` (no amount, no card transaction, no webhook) |
| `partial_approval_capable` | bool | | Partial approvals aren't returned yet |

- 202: `{ simulation_id, card_transaction_id?, status }`, where `status` is `pending`, `completed` or `failed`.
  - `completed` names the transaction.
  - `pending` has no id yet: poll the simulation.
- A decline is **not** an HTTP error: it creates a `declined` card transaction and fires `card_transaction.created`.
- Errors: `400`, `403`, `404`, `409` (inactive card, key reuse, or failed simulation: use a new key), `422`, `429 sandbox-card-simulation-daily-limit`, `500`, `501`, `502`.

**`POST /sandbox/cards/simulate/transaction/{card_transaction_id}`** (idempotency key; `PATCH` on the same path is deprecated)
- Body: `{ action, amount?, merchant? }`.

| `action` | Effect | `amount` |
| - | - | - |
| `clear` | Settle | Optional (partial or over-capture) |
| `void` | Release | Optional (partial reversal) |
| `expire` | Lapse | Not allowed |
| `update_amount` | Set the new **total** | Required |
| `return` | Refund; creates a **new** transaction (the response names it); only `merchant.descriptor` is used | Required |
| `return_reversal` | Reverse a return; target the return transaction | Not allowed |

- 202: same shape as the authorization response. `pending` means watch the transaction you advanced, not the simulation.
- `card_transaction.updated` lags: near-instant for `clear`/`expire`, **30 s or more** for `void`/`return_reversal`.
- Errors: `422 sandbox-invalid-action-for-transaction` (missing or extra amount, wrong target, network refusal such as "Return reversal is not supported for debit transactions"), `409` key problems, `429` daily allowance.
- Known bug: after `update_amount`, `auth_amount` shows original + new total and the hold isn't raised. Settlement follows the new total.

---

## 4. Card funding model and our ledger

**Flow:**

| Stage | What happens |
| - | - |
| Authorization | Dakota checks card status, spend limit and wallet `available`, then places a hold of `hold_amount` and approves. Nothing moves on-chain |
| Clearing | Hours or days later; can differ from the authorized amount; can be split (`partially_cleared`). The cleared amount **stays in `held`** |
| Settlement | Dakota batches recoveries **per wallet** in a settlement sweep, an on-chain transfer to `settlement_destination` under the enablement. When the sweep is confirmed, `held` and `total` both fall by the swept amount and `available` does not change. **In sandbox no sweep runs on its own.** Cleared spend stays held; ask Dakota to sweep |

- Holds reduce what every card **and every ordinary send** from the wallet can spend. `held` also includes in-flight wallet sends.
- For card-enabled wallets, our send flow and our balance display should use `card.available`, not the raw token balance.

**How declines happen** (`status: declined`, final, nothing held). `decline_reason`:

| `decline_reason` | Meaning |
| - | - |
| `insufficient_funds` | `available` < the purchase's **hold** (`decline_detail: hold_adjustment` when the purchase fit but the padding didn't), wrong token/network deposited, **or** the authorization couldn't be evaluated (a retry may succeed) |
| `card_inactive` | Frozen, pending, overdrawn or closed |
| `spend_limit_exceeded` | Purchase over the limit |
| `merchant_not_allowed` | Merchant or category restriction |
| `card_details_incorrect` | Card number, expiry or CVV mismatch |
| `suspected_fraud` | Fraud screening |
| `authorization_timeout` | No decision in time |
| `other` | Also map unknown values here |

`decline_code` is raw; never branch on it.

**Shortfalls:**
- A **force post** (`force_posted`, no prior auth, can't be declined) or a clearing above its hold can leave a gap. Dakota has already paid the network and recovers the gap from future deposits.
- The wallet balance is never negative. The card may show `overdrawn`, and new or activated cards on that wallet are refused `409 wallet-owes-card-debt`.
- Read the per-transaction gap from `outstanding_amount`. Wallet-level `outstanding` is reserved and reads `0.00` today.

**Ledger rules** (key every entry by card transaction `id`; process under a per-id lock; see §5.3):

| Transaction state | Ledger action |
| - | - |
| `pending`, `authorized` | Upsert a **pending debit** = `auth_amount`. Optionally track `hold_amount` as a reservation. No posted movement |
| `declined` | Record the attempt for UX/notifications (amount = attempted `auth_amount`). No balance effect. Final |
| `partially_cleared`, `cleared`, `force_posted` | Post the debit at the **current cumulative** `cleared_amount`, adjusting by the delta from what we already posted (it can grow across partial clearings or differ from auth). Release the remaining pending. If `outstanding_amount` > 0, record a payable/receivable owed to Dakota and flag the customer |
| `auth_reversed`, `expired` | Remove the pending debit. Any refund on it still goes through the refund rules |
| `returned` with `cleared_amount` = 0 | Standalone refund: no charge; refund rules only |
| `returned` with `cleared_amount` ≠ 0 | Refund on the purchase itself: keep the posted debit at `cleared_amount`; refund rules apply |
| Any status with `refund_state` set | Refund settlement below |

**Refund settlement.** Keep a **settled total** per transaction `id`.
- `returned_amount` is `null`: settle nothing.
- `refund_state: pending`: show as a pending refund; settle nothing.
- `refund_state: paid`: compute `diff = returned_amount − settled_total`.
  - Positive: credit it.
  - Negative: the merchant reversed a refund after it was paid. Debit it back or flag for recovery; never ignore it.
  - Zero: no-op.
  - Then set `settled_total = returned_amount`.
- `refund_state: failed`: settle nothing, flag for review, and contact Dakota with the id.
- `refund_state: reversed`: nothing to settle. Flag if `settled_total` ≠ 0.
- **Never credit on `status: returned` alone.** Payouts to the wallet are not live yet, so `refund_state` stays `pending` or `reversed` for now.

**Settlement sweep vs. our wallet ingestion.** The docs **do not say** whether the on-chain sweep shows up as `wallet.transaction.*` events or as a plain balance drop. Card spend is already debited at clearing, so our reconcile and wallet-transaction ingestion must **not** book a sweep as a second user debit.
- Match outflows to the wallet's recorded `settlement_destination` (from the enablement record) and classify them as card settlement.
- Confirm the behaviour with Dakota (§8).

---

## 5. Webhooks

### 5.1 Envelope and signature: same as today

- The same stream and target, same envelope, signing and retries as the existing integration: `{ id, type, created, api_version, data: { object } }`.
- Ed25519 signature over `timestamp + body`, in headers `X-Webhook-Signature` and `X-Webhook-Timestamp` (reject anything older than 5 minutes). Other headers: `X-Dakota-Event-ID`, `X-Dakota-Event-Type`, `X-Dakota-Delivery-Attempt`.
- Same public keys per environment.
- Delivery is at least once: **dedupe on event `id`**. Up to 10 attempts over about 48 h; 20 s timeout per attempt.
- Events can arrive out of order (`card.created` can land after `card.updated`).
- Our target is `global: true`, so card events arrive automatically. A `global: false` target would need every card type in `event_types` (missing types are never delivered or retried).
- `data.previous_attributes` is never populated; diff against stored copies.

Differences in `data.object` from the REST shape:
- Optional fields with no value are **omitted** (REST sends `null`). Exception: `returned_amount` is always present (`null` when there is no refund). Read every optional field as "absent or null".
- Card events don't embed `cardholder` or `wallet`.
- Card transaction events add `transacted_at` (Unix seconds).
- Card events never contain PAN, CVV or expiry; at most `last4`.

### 5.2 Card-related events

| Event | Fires when | `data.object` | Our action |
| - | - | - | - |
| `customer.capability_status.updated` | Any capability changes; **filter `capability === "cards"`** | `{ customer_id, capability, status, requirements[], reason? }` | Update eligibility. `action_required`: show the "accept terms" CTA, **fetching the URL fresh** at render. `enabling`: show a waiting state. `available`: unblock cardholder, enablement and card creation, and retry operations parked on `403 cards-capability-enabling`. `unavailable`: hide Cards and alert ops if a `capability_enablement` requirement exists |
| `wallet.card_enablement.completed` | Enablement becomes `active` (once) | `wallet_id`, `customer_id`, `client_id`, `intent_kind` (`enable_card_settlement`), `intent_hash`, `signatures[]`, `signature` (first one), `signer_public_key` (empty for passkey or unidentified), `spend_asset`, `spend_network_id`, `settlement_destination`, `completed_at` (Unix s) | **Persist immutably as the acceptance record.** Mark the wallet card-enabled; store the spend option and settlement destination; release queued card creation |
| `cardholder.created` | Cardholder created | Cardholder | Upsert (ordering rule) |
| `cardholder.updated` | Any change, including `active` and `closed` | Cardholder | Upsert. `active`: issue queued cards. `under_review`/`request_for_information`: ops queue. `declined`: notify; re-enroll needs a delete first. `suspended`: show cards frozen and block unfreeze. `closed`: mark deleted (no longer readable) |
| `cardholder.information_requested` | Reviewer asks us for info. **Not live** | The open requests | Ops alert; `GET .../application` |
| `card.created` | Card issued, `pending` | Card | Upsert if `version` is greater |
| `card.updated` | Activation, freeze/unfreeze, close, limit change, rename, art, Dakota sets or clears `overdrawn`, or a no-op request | Card (always has `freeze_sources`, `spend_asset`, `spend_network_id`) | Upsert if `version` is greater. **Build activation off this event** (`status: active`); fill `last4`. `frozen`: inspect `freeze_sources`. `overdrawn`: show "declining: balance owed". `closed`: final record |
| `card_transaction.created` | First record: authorization, decline, refund or force post | Card transaction + `transacted_at` | Ledger rules (§4); notify |
| `card_transaction.updated` | Any later change to that transaction | Card transaction + `transacted_at` | Same handler. **Switch on `status`, not event type**: any status can arrive on either event |

Related (not card-specific): `signer_group.member_added` at version 0 appears when Dakota creates the card-settlement signer group.

### 5.3 Ordering and concurrency rules

- **Cards:** keep `max(version)` per card. Apply an event or API response only if its `version` is greater.
- **Cardholders and card transactions** (by `updated_at`, in seconds), under a lock on the object `id`:
  - Incoming older than stored: skip.
  - Equal: don't apply the event copy. **Re-fetch from the API while holding the lock**, with a short timeout. If the re-fetch fails, release the lock and return non-2xx so Dakota redelivers.
  - Newer: apply.
- Run the staleness check, read, ledger posting and store as **one atomic step per transaction id**. A conditional update alone isn't enough.

---

## 6. Cards.js

### 6.1 Package

- Name: **`@dakota-xyz/cards-js`** (MIT).
- Entry points: `@dakota-xyz/cards-js` (core), `@dakota-xyz/cards-js/react`, `@dakota-xyz/cards-js/styles.css`.
- Versions:
  - Docs changelog: 0.1.0 (2026-07-24), 0.1.1 (2026-07-28), **0.1.2 (2026-09-29, first public npm release)**.
  - **npm `latest` is `0.2.0`** (published 2026-11-06), which the docs changelog doesn't cover yet. Its types add an optional `art?: CardArt | null` handle option, with `CardArt = { image_url, background_color, text_color }`, and its README says the browser then loads that one `https` image.
  - **Pin an exact version.** Re-check the CSP table on every upgrade.
- Requirements: `engines.node >=22.18` (repo Node 25 is fine). Optional peer `react >=18` (repo React 19.2 is fine). Depends on `lithic-embed@0.1.0-beta.0`.
- Browser support: evergreen Chrome, Edge and Firefox; Safari 16+ (desktop and iOS).
- **Install blocker in this repo:** `.npmrc` has `@dakota-xyz:registry=https://npm.pkg.github.com`, so installs 401. Options:
  - A GitHub Packages token that can read the package, if Dakota mirrors it there.
  - Remap the scope to `https://registry.npmjs.org`. Check whether anything else under `@dakota-xyz` (for example the TS SDK) relies on GitHub Packages before changing it.

### 6.2 `fetchSession` contract (client)

```ts
type FetchSession = (ctx: SessionRequestContext) => Promise<RevealSession>;
interface SessionRequestContext { sessionType: 'card_details'; origin: string } // origin = window.location.origin
interface RevealSession { session: string; expiresAt: string /* RFC 3339 */; provider?: string /* reserved: omit */ }
```
- Forward `sessionType` and `origin` **unchanged** to our backend. Return `{ session, expiresAt }`.
- Throwing, or returning another shape, surfaces as the retryable `session_fetch_failed`.
- Every `reveal()` from the masked state calls `fetchSession` again. Only concurrent in-flight calls are de-duplicated.
- For several cards on one page, give each handle its own `fetchSession` bound to its `card_id`. In React, key each component by `card_id`, never by index.

### 6.3 Backend glue (Next.js route handler)

`POST /api/cards/[id]/reveal-session`:
1. Authenticate the session. Load the card and **assert the signed-in user owns it** (and is its cardholder or an authorized team member). 404 otherwise.
2. Optionally reject unless the stored card `status === "active"` (§3.7).
3. Validate `body.sessionType === "card_details"`. Validate that `body.origin` equals our known app origin: HTTPS, no trailing slash. Don't trust arbitrary values.
4. `POST {DAKOTA_BASE}/cards/{dakotaCardId}/reveal_session`, header `x-api-key`, body `{ session_type: body.sessionType, origin: body.origin }`. **No idempotency key.**
5. On non-2xx, pass the status through (the SDK only needs a 4xx/5xx). Otherwise return `{ session: data.session, expiresAt: data.expires_at }`.
6. Use the API host that matches the `environment` given to `new DakotaCards({ environment: 'sandbox' | 'production', fetchSession })`.
7. Never log the `session` value. Rate-limit per user, since the account-wide cap is 60/min.

### 6.4 CSP / network (exact values)

| `environment` | `frame-src` origin |
| - | - |
| `sandbox` | `https://sandbox.lithic.com` |
| `production` | `https://api.lithic.com` |

Both values are confirmed in the bundled `lithic-embed@0.1.0-beta.0`. Dakota warns they can change between releases. If both environments are used, list both.

- **No extra `connect-src`** (the SDK makes no XHR of its own).
- **No extra `font-src`** (fonts are self-hosted from our origin inside the package).
- **`img-src` must include `data:`** for the default stylesheet. Ours already does.
- If using the 0.2.0 `art` option, `img-src` must also allow the card-art image host. Its host isn't documented; the example is `https://card-art.dakota.xyz/...`.
- `frame-ancestors`: Dakota recommends `'self'` or `'none'` on the reveal page. Ours is `'none'`, which is fine.
- **Action in `src/middleware.ts`:** add `frame-src https://sandbox.lithic.com` (sandbox) or `https://api.lithic.com` (prod), selected by env.
- **HTTPS is mandatory**, including local dev: the frames don't work in an insecure context, and `http://localhost` origins are rejected by the API. Use `next dev --experimental-https` or a TLS tunnel, and keep the `origin` that is sent consistent with it.
- The frame URLs carry `session` as a query parameter. Configure Sentry, session replay and RUM to **drop or redact `session`** for those origins.

### 6.5 UI, lifecycle and theming hooks

- **Client:** `new DakotaCards({ environment, fetchSession })`, then `cards.cardDetails({ last4?, fetchSession?, theme?, autoMaskMs?, strings?, art? })`.
- **Handle:** `mount({ pan, cvv, expiryMonth, expiryYear })` (selectors or elements; paints the masked face; no network; call once), `reveal()`, `mask()`, `on(event, fn)` (returns an unsubscribe function), `destroy()`.
  - `state`: `idle`, `mounting`, `masked`, `revealing`, `revealed` or `destroyed`.
  - `mask()` during `revealing` is a no-op.
- **Events:** `ready`, `revealing`, `revealed`, `masked` (manual or failed attempt), `expired` (auto-mask), `copied` (`{ field, success }`). `error` is reserved and never emitted.
- **Errors:** `DakotaCardsError { code, retryable, diagnosticId? }` (check with `isDakotaCardsError`). Codes: `session_fetch_failed` (retryable), `session_rejected` (retryable), `origin_mismatch` (reserved), `mount_target_not_found`, `invalid_theme` (sync, from `cardDetails()`), `invalid_state` (sync from `mask()` on a destroyed handle), `reveal_failed` (usually not retryable). Branch on `retryable`. Origin mistakes surface as `reveal_failed` or `session_rejected`.
- **Reveal window:** `min(autoMaskMs, remaining TTL)`, with the TTL capped at 10 min and measured on the device clock. **Set `autoMaskMs`** (e.g. 30–60 s) for a bound that doesn't depend on the device clock.
- **React:** `<DakotaCardsProvider client>`, `<CardDetails ref last4 theme autoMaskMs strings fields className fetchSession />` (ref exposes `reveal` and `mask`), `useCardDetails(options)` → `{ refs, state, handle, reveal, mask }`, `useDakotaCards()`. Options are read on first render only; remount with a new `key` to change them.
- **Copy:** values are click-to-copy inside the frames. For a copy icon, place it under the frame's transparent tail and flip it on `copied`.
- **Theming layers:**
  1. Default stylesheet.
  2. CSS on the semver-stable DOM recipe: `.dk-card`, `.dk-card__pan`, `.dk-card__row`, `.dk-card__group`, `.dk-card__group--cvv`, `.dk-card__label`, `.dk-card__expiry`, `.dk-field`, `.dk-field__masked`, `.dk-field__frame`, `.dk-live`, `[data-dk-field]`. Custom properties on `.dk-card`: `--dk-card-bg` (`#0d0d0d`), `--dk-card-fg` (`#ffffff`), `--dk-card-muted` (`#8a8f8e`), `--dk-card-radius` (`12px`). Re-declaring `background` replaces the whole face.
  3. The `theme` option, forwarded into the frames: `color`, `fontFamily`, `fontSize`, `fontWeight`, `letterSpacing`. Values must be **concrete** (no `var()`), and fonts must be system-available because the frames load no webfonts.
- **Headless markup rules:**
  - Never `display:none` a frame host; use `visibility:hidden`.
  - Size frame hosts explicitly with a few px of slack.
  - The host height must cover the line-height.
  - Center inline revealed fields: `.dk-field:has(.dk-field__masked[hidden]) { vertical-align: middle }`.
  - The loading state selector is `.dk-field__frame:not([hidden]):empty`.
- **i18n `strings`:** `validThru`, `cvvLabel`, `panPlaceholder` (`'•••• •••• •••• {last4}'`), `revealedAnnouncement`, `maskedAnnouncement`.
- **PCI:** designed to keep our front end within SAQ A; confirm with our assessor.

---

## 7. Sandbox testing recipe

0. **Prereqs.**
   - Ask Dakota to enable Cards on the sandbox account (no agreements).
   - Confirm the webhook target receives card events (ours is `global: true`).
   - Serve the app over HTTPS.
   - Add `frame-src https://sandbox.lithic.com`.
1. **Customer.** Create the customer as today. Then `POST /sandbox/simulate/onboarding` with `{ type: "kyb_approve", applicant_id: <application_id>, simulation_id: <unique> }`. Check that `status` and `kyc_status` read `approved`.
2. **Terms.**
   - `GET /customers/{id}/capabilities`. Expect `cards` = `action_required` with a `terms_acceptance` requirement.
   - Open its `url` and accept the terms yourself.
   - Wait for `customer.capability_status.updated` (`cards`, `available`).
3. **Cardholder.**
   - Business: `GET /customers/{id}/persons`, then `POST /customers/{id}/cardholders` with `person_id` (+ `phone`/`email` if listed in `missing_for_cards`).
   - Individual: `{}` or `{ phone }`.
   - Wait for `cardholder.updated` with `status: active`.
4. **Wallet.**
   - Create an EVM wallet for the customer with a **dedicated** policy.
   - `GET /cards/spend_options`. In sandbox, expect testnet values such as `base-sepolia`.
   - Build and sign `enable_card_settlement`, then `POST /wallets/{id}/card_enablement`.
   - Handle `active` or `attaching`, and the `wallet.card_enablement.completed` event.
5. **Card.** `POST /customers/{id}/cards` with `{ cardholder_id, wallet_id, spend_limit: { interval: "per_transaction", amount: 200 } }`. Wait for `card.updated` with `status: active` and a `last4`.
6. **Reveal.**
   - Render Cards.js with `environment: 'sandbox'` and click reveal.
   - The backend mints `reveal_session` with the page origin.
   - Verify the values show, auto-mask fires `expired`, and a second reveal mints a new session.
7. **Fund.**
   - `POST /sandbox/wallets/{id}/faucet` `{ asset: "RD", amount: "2.00" }` **twice** (new key each time).
   - Poll `GET /sandbox/simulations/{sid}` until `state_position: completed`.
   - Check `GET /wallets/{id}/balances` shows `card.available` ≥ 2.60.
8. **Approve path.**
   - `POST /sandbox/cards/simulate/transaction` `{ card_id, amount: "2.00", merchant: { descriptor: "COFFEE ROASTERS", mcc: "5814", country: "USA" } }`.
   - Expect `card_transaction.created` with `authorized`, `hold_amount` `2.6`, `card.held` up and `available` down.
   - If the response is `pending`, poll the simulation for `card_transaction_id`.
9. **Clear.** Advance with `{ action: "clear" }` (or a partial `amount`). Expect `card_transaction.updated` → `cleared`. `card.held` stays up (no sweep in sandbox).
10. **Reverse paths** (new authorizations):
    - `{ action: "void" }` → `auth_reversed`; wait 30 s or more.
    - `{ action: "expire" }` → `expired`.
    - `{ action: "update_amount", amount: "1.50" }`: mind the known `auth_amount` bug.
11. **Refund.**
    - On a cleared transaction, `{ action: "return", amount: "1.00" }`. The response names a **new** transaction (`returned`, `refund_state: pending`).
    - Optionally `{ action: "return_reversal" }` on the return; it may be refused with `422 sandbox-invalid-action-for-transaction`.
    - Verify the ledger credits nothing while `pending`.
12. **Declines.**
    - Purchase on an unfunded or drained wallet: `declined` / `insufficient_funds`. Not an HTTP error.
    - Purchase over the `per_transaction` limit: `spend_limit_exceeded`.
    - Purchase on a frozen card: the simulator returns `409 card-not-active`.
13. **Card management.**
    - `PATCH` `{ status: "frozen" }`, then `{ status: "active" }` (expect `freeze_sources` `["manual"]` → `[]`).
    - Rename. `PUT /spend_limit`.
    - `lost_stolen_report`, then unfreeze (expect `403 card-freeze-held`), then `found_report`, then unfreeze (works).
    - `PATCH` `{ status: "closed" }`: the card disappears from the default list and `reveal_session` gives `403 card-closed`.
14. **Dispute.** `POST /card_dispute_reports` without `filing_reason`. Store the response (`state: received`, `filing_state: not_filed`). Resend the same `client_reference` and expect `409`.
15. **Offboarding.** Close all cards, `DELETE /cardholders/{id}` (expect `204`), and wait for `cardholder.updated` with `closed`. Also test the delete-with-open-cards refusal (`409` or `502`).
16. **Webhook robustness.** Replay events with the existing "Replay a webhook delivery" endpoint and confirm dedupe by event id. Deliver `card.updated` before `card.created` and confirm the version guard holds.

Sandbox limits:
- 2 USD per simulation or faucet call.
- 5 faucet calls per wallet per day, plus a per-client daily cap.
- A daily card-simulation allowance (`429`).
- A shared faucet float (`429 sandbox-faucet-float-floor` needs Dakota).
- One idempotency key per simulation.
- US fuel (175 USD hold) and car rental can't be funded in sandbox and will decline.

---

## 8. Open questions for Dakota

**Product scope**
1. **Physical cards:** roadmap and date? Will there be custom or branded card printing, shipping endpoints, PIN management, and ATM access? (The dispute `filing_reason` set includes `atm_*` values.)
2. **Production timeline:** when do Cards endpoints leave sandbox? What changes are expected before GA? What does the cards program addendum or marketing attestation require from us (for example, marketing review of card copy)?
3. **Fees:** issuance, monthly, interchange share, FX/cross-border, ATM, dispute, and card-settlement sweep or gas costs. None are documented.
4. **Countries and states:** which customer countries and US states are eligible, for business and consumer bases? Are non-US cardholders supported? Are there residency rules for cardholder `address`?
5. **Limits:** the max active cards per cardholder (`limit-reached`), any program-wide per-transaction, daily or monthly caps on our account, and per-customer aggregate limits.

**Funding and settlement**

6. **Spend option:** can our account use **USDC on `base-mainnet`** (and `base-sepolia` in sandbox)? Our wallets hold USDC on Base. The index lists "choosing which token and network fund cards" as not in the first release, while the wallet-enablement page and `GET /cards/spend_options` document it. Which is current? What is RD, and how would customers acquire it if RD is mandatory?
7. **Enablement signer:** our wallets are governed by a single platform signer group and key. Is a **platform-signed** `enable_card_settlement` acceptable as the customer's authorization, or must an end-user key or passkey sign it? Can one signer group serve many dedicated per-wallet policies?
8. **Shared policy migration:** for existing wallets with the shared platform policy, is attaching a dedicated policy and detaching the shared one the recommended path, or should we create new card-funding wallets?
9. **Settlement sweep visibility:** does the sweep emit `wallet.transaction.*` (or any) events? How do we link a sweep to the card transactions it covers? What is its cadence in production? Who pays gas?
10. **Debt recovery:** how is `outstanding` recovered (automatic sweep on the next deposit?). When will the wallet-level `outstanding` stop being hard-coded `0.00`? Is there an event when a wallet enters or leaves debt beyond `card.updated` → `overdrawn`?
11. **Refund payouts:** when will refunds pay out to the wallet (`refund_state: paid`)? By what mechanism, on-chain from `settlement_destination`?

**Digital wallets and card art**

12. **Apple Pay / Google Pay:** manual provisioning only. Is push provisioning (in-app "Add to Apple Wallet") on the roadmap? Does it need Apple or Google approval in our name?
13. **Card art for digital wallets:** what art and assets appear in Apple and Google Wallet? Can we upload our own designs to `GET /card_art` (process, specs, review time)? What host serves `image_url`, so we can allow it in `img-src` for the Cards.js 0.2.0 `art` option?

**Doc conflicts**

14. **Reveal on non-active cards:** the reference says `409 card-not-active`, the guide says 5xx today. Which applies now?
15. **Cardholder delete with open cards:** the reference says `409 cardholder-has-open-cards`, the guide says `502`. Which applies now?
16. **Disputes:** the guide says "record only, Dakota files". The reference adds `filing_reason` and `card_transaction_ids` for immediate filing. Is self-serve filing enabled for our account? When do report read-back, dispute webhooks, evidence upload and outcomes ship? How are dispute credits paid?
17. **Cards.js 0.2.0:** it is on npm but has no changelog entry. What changed beyond the `art` option? Are the CSP origins unchanged? Is the package also published to GitHub Packages for the `@dakota-xyz` scope?

**Operations**

18. **Cardholder review:** when do `request_for_information` handling and document uploads go live? What do reviewers typically request?
19. **3-D Secure and OTP:** what happens if the cardholder's phone changes? Is `PATCH /cardholders` enough, or is the screening lock a problem?
20. **Compliance responsibilities:** which disclosures, statements, Reg E/Reg Z obligations (for consumer cards) and complaint handling fall to us versus Dakota as program manager? Who is the issuing bank (for card-back copy)?
21. **Reveal rate limit:** the 60/min and 600/hour per-account cap is low for a consumer app at scale. Can it be raised?

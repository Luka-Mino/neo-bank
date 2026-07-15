# Card Issuing Plan — making Moneta's card real

> Research date: 2026-07-15. Sources are current Stripe/Lithic/Marqeta docs
> (linked at bottom). Today the card is a **visual mock** (`src/lib/cards.ts`
> — "no real issuer call"). This plan turns it into a real card that spends
> against a user's stablecoin balance. **Not being built end-to-end yet:**
> real issuing needs a registered corporation (Moneta doesn't have one). This
> is the pick-the-approach + scaffold-what-we-can phase.

## The core problem

Moneta's balance is **USDC custodied on Dakota**. A card, though, authorizes
in **fiat** at a Visa/Mastercard terminal. So the whole game is the **funding
model**: how does a real-time fiat card authorization get backed by an
on-chain dollar balance, and decided in **under 2 seconds**?

## Vendor landscape (2026)

| | Fit for Moneta | Notes |
|---|---|---|
| **Stripe Issuing** | ★ strongest | Most self-serve, best docs, Stripe-native. Since the **Bridge** acquisition (Feb 2025, $1.1B) Stripe now issues **stablecoin-backed cards natively** — JIT-pull USDC from a wallet at auth. |
| **Lithic (+ Rain)** | ★ strong, crypto-native | Auth Stream Access (ASA) real-time decisioning; Rain partnership issues USDC-drawing cards with POS conversion. The de-facto crypto-card stack. Alternative if we don't want Stripe. |
| **Marqeta** | overkill | Invented JIT funding; enterprise-grade, heavy onboarding. Too much for our stage. |

**Recommendation: Stripe Issuing.** We already lean Stripe, it's the least
operational lift, and post-Bridge it speaks stablecoin. Lithic+Rain is the
credible fallback if terms/onboarding disappoint.

## The funding fork — the one real decision

Two ways to run Stripe Issuing against a Dakota USDC balance. They build very
differently.

### Path A — Stripe + Bridge stablecoin cards (stablecoin-native)
- Card is linked to a wallet (Bridge custodial, Privy, or other non-custodial).
  At authorization **Bridge pulls USDC from the wallet just-in-time**, using a
  prior on-chain approval; rejects if the approval is inactive/insufficient or
  funds are short. Works anywhere Visa is accepted; 30 countries now → 100+ by
  end of 2026. All standard Issuing features (physical, Apple/Google Pay,
  controls, disputes).
- **Pro:** almost no treasury ops — no daily settlement, Bridge does the pull.
  Conceptually "a card on a stablecoin wallet," which *is* Moneta.
- **Con / open question:** it wants the float in a **Bridge-linked wallet**.
  Moneta already custodies on **Dakota** — so this either (a) adds Bridge as a
  second stablecoin infra layer alongside Dakota, or (b) requires Dakota's
  wallet to serve as the linked wallet with an on-chain approval, which we'd
  have to confirm Dakota supports. Onboarding ~**6–8 weeks**.

### Path B — Stripe Issuing classic "postfunding" (JIT, fiat settlement)
- Keep **all** custody on Dakota. Stripe issues the card; at auth, Stripe calls
  our `issuing_authorization.request` webhook and **we approve/decline within
  2s against the user's Moneta ledger balance**. Stripe's Issuing balance goes
  **negative** as spend accrues; each morning Stripe posts a `FundingObligation`
  we settle by **wire that day** (funded by off-ramping USDC→USD via Dakota).
  Requires a **reserve/collateral** with Stripe + a `CreditPolicy` credit line.
- **Pro:** Dakota stays the single custody + ramp layer; Stripe never touches
  crypto; clean separation (Stripe = card rails, Dakota = custody/ramps, Moneta
  = ledger + decisioning + treasury).
- **Con:** real treasury work — daily settlement, reserve management, and a
  timing gap (off-ramp isn't instant) we float across.

### Lean
For **keeping Dakota central and avoiding vendor overlap**, Path B is cleaner.
For **least operational lift and a true stablecoin card**, Path A wins — at the
cost of introducing Bridge. This is a strategy call (is Dakota our one custody
layer, or will we let card float live in Bridge?), so it's yours to make.
**Either way, the real-time authorization webhook + card/cardholder model +
provider abstraction are identical** and we can build them now.

## The pipeline (shared across both paths)

1. **Cardholder** — create a Stripe `Cardholder` per Moneta user (name,
   billing address, from KYC we already collect).
2. **Card** — create a `Card` (virtual instant; physical shippable) tied to the
   cardholder; set spending controls (limits, allowed MCCs).
3. **Authorization** — on swipe, Stripe fires `issuing_authorization.request`.
   Our endpoint verifies the signature, checks the user's Moneta balance +
   controls + fraud signals, and returns `{"approved": true|false}` **within
   2s** (Stripe auto-decides on timeout per our settings).
4. **Capture/settlement** — approved funds are held, then captured by the
   network (~T+1). In Path A, Bridge pulled USDC at step 3; in Path B, we settle
   the daily `FundingObligation` by wire.
5. **Webhooks** — `issuing_authorization.created/updated`,
   `issuing_transaction.created`, `issuing_card.*`, disputes. Reconcile to our
   ledger like we already do for Dakota events.

## Paperwork / prerequisites (the gate)

- **A registered corporation** — cert of incorporation, EIN, physical business
  address, beneficial-owner IDs (every >25% owner), selfie verification.
  **← this is the hard blocker; Moneta isn't incorporated yet.**
- **Stripe account** in good standing; **apply for Issuing** (form → Stripe
  underwrites eligibility: ~24–72h simple, 1–4 weeks complex).
- **US/UK/EU only, commercial use.**
- **Path A:** connect Stripe ↔ Bridge; ~6–8 week onboarding.
- **Path B:** negotiate `CreditPolicy` (credit limit) + fund a **reserve**;
  ability to send same-day wires.
- Issuing cards to our own consumers = Moneta is the issuer directly
  (Cardholder objects). Connect/Custom connected accounts are only needed if we
  ever issue to *other businesses* on a platform — not our case for v1.

## What we can build NOW (no corp, no Stripe account needed)

Same playbook as Dakota — build to spec, wire behind a flag, prove the shape:
1. **`IssuerProvider` interface** + a `StripeIssuingProvider` stub (mirrors our
   `SecretsProvider` / email-provider pattern). `src/lib/cards.ts`'s `issueCard`
   swaps its mock body for a provider call.
2. **Real-time auth webhook** `POST /api/webhooks/stripe-issuing` — signature
   verify, decision against the Moneta ledger, 2s-safe synchronous response.
   Unit-test the decision logic (sufficient balance, active card, controls).
3. **Card/cardholder data model** — extend schema for Stripe IDs, controls,
   physical-vs-virtual, shipping status.
4. **Settlement scaffolding (Path B)** — a `FundingObligation` handler stub +
   the Dakota off-ramp-to-fund hook, dormant until we settle.
5. Everything stays dark behind an `ISSUING_PROVIDER` flag (like `BYPASS_KYC`)
   until real credentials + corp land.

## What's blocked until incorporation

Live cardholders, the Stripe application/underwriting, the Bridge onboarding,
the reserve/CreditPolicy, and any real authorization. All the code above can be
written, unit-tested, and merged first — proven against the API shapes, exactly
like the Dakota money path is today.

## Sources
- Stripe Issuing — real-time authorizations: https://docs.stripe.com/issuing/controls/real-time-authorizations/quickstart
- Stripe Issuing — postfunding (JIT): https://docs.stripe.com/issuing/funding/post-fund
- Stripe Issuing — Bridge stablecoin cards: https://docs.stripe.com/issuing/bridge-stablecoin-cards
- Stripe Issuing — stablecoin-backed card issuing: https://docs.stripe.com/issuing/stablecoin-cards
- Apply for Issuing: https://support.stripe.com/questions/how-to-apply-for-issuing
- Bridge × Stripe Issuing announcement: https://www.bridge.xyz/blog/stablecoin-backed-cards-are-now-integrated-with-stripe-issuing
- Lithic vs Stripe vs Marqeta (2026): https://apiscout.dev/guides/stripe-issuing-vs-marqeta-vs-lithic-card-issuing-api-2026

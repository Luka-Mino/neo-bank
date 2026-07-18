# Moneta Growth Plan — Revolut-informed build-out

> Written 2026-07-18. Synthesizes the Revolut breakdown ([[reference_revolut]] /
> `RESEARCH-REVOLUT.md`) with Dakota's real capability surface ([[project_neobank]],
> `DAKOTA-PLAN.md`, `DAKOTA-AUDIT.md`). Three pillars: **(1) streamline the site**,
> **(2) map what we can actually integrate through Dakota**, **(3) set fees that
> stay competitive with Revolut.** This is a plan, not a build — sequencing at the end.

## 0. Honest starting point (no borrowed credibility)
Revolut's site leans on social proof we don't have — "#3 most downloaded finance
app," named partners, 70M users. **We will not fake any of it.** No invented
metrics, no placeholder partner logos, no "trusted by thousands." Instead we lead
with the trust we *can* substantiate — regulated rails (Dakota), FDIC pass-through,
bank-grade encryption, and radical fee transparency — and we slot real proof in
*as we earn it* (named Dakota partnership once live, first-user count, uptime).
Transparency is the wedge; fake polish would undercut it.

## 1. Website streamline — what to take from Revolut (honestly)
What makes Revolut's site work: one crisp section per product, relentless clarity,
motion that demonstrates rather than decorates, and an always-visible price/plan story.

| Take from Revolut | Moneta action | Status |
|---|---|---|
| Product-led sections, one job each | Tighten hero → account → card → send → deposit into clean, single-idea blocks | Have most; streamline |
| An always-available **Pricing/Plans page** | **Build one** — we have no pricing page today; this is a real gap | ❌ missing |
| Plan ladder (Standard→Metal) | Present Moneta tiers (see §3) even as "coming" | ❌ missing |
| Motion that shows the product | Extend the existing tilt-card; add a deposit/settle micro-demo | Have seed |
| Confident trust row | Use **real** signals only (regulated, FDIC pass-through, encryption) | Have |
| Fee clarity front-and-center | Promote the **fee-transparency** section to a hero pillar ("every fee on the receipt") | Have copy; elevate |

**Net site work (buildable now, no Dakota):** add a Pricing/Plans page, add a
fee-transparency comparison block (Moneta vs a legacy bank / vs Revolut's catches),
streamline the marketing sections into single-idea blocks, and extend tasteful
motion. All front-end — zero external dependency.

## 2. Dakota integration deep-dive — what we can actually build
Grounded in the audited capability map. **Verdict key:** ✅ built · 🔨 buildable now
(code + dark flag) · 🔜 needs Dakota confirmation/credentials · ❌ not Dakota's product.

| Revolut-style feature | Powered by | Moneta status |
|---|---|---|
| Deposit via ACH/wire w/ real account numbers | Dakota **onramp** (virtual ABA routing+acct) | ✅ built |
| Withdraw to bank (ACH / same-day Fedwire) | Dakota **one-off offramp** (+`payment_reference`, rail choice) | ✅ built |
| Instant P2P send | Wallet send / internal book entries | ✅ built |
| Pay by card | **Stripe Issuing** (not Dakota) | 🔨 scaffolded (`CARD-ISSUING-PLAN.md`) |
| International transfer (EUR/GBP, SEPA/SWIFT) | Dakota **SWIFT/SEPA/IBAN** destinations | 🔨 destinations modeled; build the flow |
| Send crypto to an external wallet | Dakota non-custodial **wallet send** | 🔨 partial; expose in UI |
| Stablecoin swap / convert | Dakota **swap** (account + txn type exist) | 🔜 scaffold |
| Savings / yield (APY) | Dakota **treasury-backed yield** (Dakota advertises "unmatched yield") | 🔜 confirm it's exposed to end-users via API |
| Multi-currency / FX | Dakota **"FX across 100+ jurisdictions"** | 🔜 confirm scope; likely narrower than Revolut's 25-ccy wallet |
| Business accounts | Dakota **sub-clients** | 🔜 future (BACKLOG) |
| Stocks / commodities / equities | — | ❌ not Dakota; out of scope by choice |

**Revenue lever baked into Dakota:** `developer_fee_bps` (0–10000 basis points) can
be attached to accounts *and* per-transaction — our cut on every ramp. This is what
funds a Revolut-competitive fee schedule without eating losses.

**Takeaways:**
- The **core money loop is already built** (deposit/withdraw/send). The near-term
  wins are *presentation + a few Dakota features already in the API*: international
  transfers, crypto-out, and swap — all buildable now, dark until credentials.
- **Yield and FX are the two high-value unknowns.** Dakota clearly markets both, but
  we must confirm what the *infrastructure API* exposes to *our end users* (vs.
  Dakota's own business-account product). If yield is passable, it's a huge Revolut
  parity feature (their savings) and a revenue-share line. **Question for Dakota.**
- **Don't chase investing.** No stocks/crypto-trading casino — position Moneta as
  "your money, moving," not a brokerage. Focus is a feature.

## 3. Fee strategy — comparable to Revolut, funded by our rails
Revolut monetizes via **interchange (~22%), subscriptions (~16%), FX markups (~13%)**,
plus trading + interest. Our rails let us match the good parts and *drop the parts
users hate* (weekend FX markup, hidden spreads). Because our balance is a **US-dollar
stablecoin**, USD users have **no FX to mark up at all** — a structural advantage.

**Proposed schedule (target framework — final margins depend on Dakota's wholesale
pricing, now public; confirm the actual numbers + Stripe's interchange share):**

| Line | Revolut | Moneta target | Why |
|---|---|---|---|
| Core account | Free (Standard) | **Free** | Table stakes |
| Instant P2P | Free | **Free** | Stablecoin makes this cheap |
| ACH deposit | Free | **Free** | Onramp; absorb cost, earn on interchange |
| Withdrawal | Tiered/limited | **Free ACH / small flat for same-day wire** | Transparent, undercut legacy |
| Card spend FX | ~1% weekend markup + limits | **No markup on USD; transparent bps on non-USD** | The wedge — kill the #1 grievance |
| ATM | Free cap then 2% | **Generous cap, transparent flat after** | Beat the "2% cliff" |
| Crypto/swap | 1.5–2.5% spread | **Thin transparent bps via `developer_fee_bps`** | Show it on the receipt |
| Card interchange | 0.2–1.5% (hidden) | **Same — our primary invisible revenue** | Stripe Issuing earns this |
| Subscriptions | $0/3.99/9.99/16.99 | **Mirror the ladder** (see below) | Fastest-growing line for Revolut |

**Tier ladder (mirror Revolut, differentiate on transparency + yield):**
- **Free** — account, card, P2P, ACH in/out, honest fees.
- **Plus (~$4)** — higher limits, virtual cards, priority.
- **Premium (~$10)** — higher/instant limits, cashback, **yield boost** (if Dakota
  yield is exposed), travel-style perks.
- **Metal (~$17)** — top limits, metal card, best cashback/yield, concierge.

**Publish the fee promise:** no weekend FX surcharge, no hidden exchange spread, no
surprise ATM cliff — every fee on the receipt *before* you confirm. This is the
Revolut-beating story and it's already half-built in our marketing copy.

## 4. Sequencing
**Now — no Dakota credentials needed (front-end + scaffold):**
1. Site: Pricing/Plans page, fee-transparency comparison block, single-idea section
   pass, extend motion.
2. International-transfer flow against our already-modeled SEPA/SWIFT/IBAN destinations
   (dark until creds).
3. Crypto-out and **swap** scaffolds (Dakota API shapes exist; build + unit-test).
4. Continue card-issuing scaffold (`CARD-ISSUING-PLAN.md`).

**On Dakota sandbox credentials:**
5. Wire ramps live (M2 drill), then set `developer_fee_bps` to the chosen schedule.
6. **Confirm with Dakota:** is treasury **yield** exposable to our end users? What's
   the **FX** scope for the infra API? What's the **wholesale pricing** (our cost floor)?

**Later (BACKLOG):** business accounts via sub-clients, full multi-currency, yield/savings product.

## 5. What we can't match — and how to position around it
- **No stocks/investing** — deliberate. "Money that moves, not a casino." Sharper focus.
- **Yield & broad FX** — pending Dakota confirmation; don't promise until confirmed.
- **No metrics/partners yet** — earn them; never fake them. Transparency is the brand.

## Sources
- Revolut breakdown: `RESEARCH-REVOLUT.md`
- Dakota capability map: `DAKOTA-PLAN.md`, `DAKOTA-AUDIT.md`
- Card issuing: `CARD-ISSUING-PLAN.md`
- Dakota (yield / FX / public pricing): https://dakota.xyz/ · https://docs.dakota.xyz/

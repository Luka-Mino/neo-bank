# Moneta — Institutional Treasury Strategy Brief

> Research 2026-08-18, for the pivot Lucas is exploring: from a retail
> stablecoin neobank toward an **institutional, multi-jurisdictional, fiat +
> stablecoin treasury / payments one-stop shop**. Prepared for a founder
> touch-base + fundraising context (Swiss angle). Sources at bottom. Figures
> from 2026 secondary sources/press — directional, confirm before quoting.

## 1. The thesis (restated)
Build **payment infrastructure** as the base, then a **lean 4–5 product** fiat +
stablecoin lineup that lets an institutional client run global money from **one
relationship instead of many accounts across jurisdictions**. The pain is real:
multinationals keep a bank account in every currency/jurisdiction and route
cross-border through correspondent-bank chains (opaque fees, 5–10 day exotic
corridors). A stablecoin+fiat one-stop shop collapses that into one account
structure with 24/7 settlement. Revolut proves the breadth appetite — but retail;
the institutional lane is wide open and being funded hard right now.

## 2. The most important finding — read this first
**Someone is already building almost exactly this, and just raised for it.**

- **Velocity (velocity.xyz)** — London, founded 2025. "Built for CFOs," one API+GUI
  to "move money (fiat or stablecoins) anywhere, anytime," 24/7, no pre-funding,
  yield on idle stablecoins, ERP/TMS integration, ~8 stablecoins / 6 chains / 8
  fiat currencies via regulated custody. CEO (ex-Worldpay) literally frames it as
  the **"JP Morgan of stablecoin treasury."** **Raised a $38M Series A (14 Jul
  2026)** — Dragonfly, FirstMark, Coinbase Ventures, Capital One Ventures, QED,
  Ripple, Wintermute.
- **Stable Sea (stablesea.com)** — US, ex-Block team, ~$3.5M. An **orchestration/
  data layer**: dashboard+API to settle globally and manage cash on- and off-chain
  from one place; stablecoin→local-fiat off-ramps in 40+ markets, sweeps idle cash
  into tokenized MMFs. Targets Fortune-500 treasurers, >$500K–$50M transactions.

**And the category is consolidating at eye-watering prices:** Stripe bought
**Bridge (~$1.1B)** and got conditional OCC national-trust-bank approval; Mastercard
bought **BVNK (up to $1.8B, closed Aug 2026)**; Circle, Zero Hash ($50B+ settled,
200+ countries), Fireblocks (~15% of global stablecoin volume), Conduit, Brale all
active.

**What this means for us — the honest read:** the thesis is *validated*, not
*empty*. That's good (investors are paying up) and dangerous (it's crowded and
some are well ahead). Walking into a raise, the killer question isn't "is this a
real market" — it's **"why Moneta, and what's the wedge Velocity/BVNK/Bridge don't
own?"** We need a crisp answer. Candidates in §4.

## 3. What the playbooks teach us (copy this)

### Business-treasury platforms (Mercury / Brex / Ramp)
Every one converges on the same stack:
1. **Near-free operating account** (wires/ACH).
2. **Two-leg treasury:** an FDIC-**sweep** leg (IntraFi) turning one balance into
   **$5–6M+ of coverage** across ~20 partner banks, **plus** a government
   **money-market-fund** leg (Apex/Dreyfus/Invesco) paying ~4–4.5%.
3. **Corporate cards.**
4. **Bill pay / AP automation.**
5. **Deep accounting + payroll sync.**

- **Accounting integrations are table-stakes:** QuickBooks Online, NetSuite, Xero,
  Sage Intacct — daily sync, AI auto-categorization (Ramp auto-codes ~90%), receipt
  + 3-way PO matching.
- **Payroll integrations** (Gusto, Rippling, ADP, Deel) mostly do **HRIS sync +
  card provisioning + settlement funding**, not payroll processing itself.
- **Monetization = 3 pillars:** interchange (1.5–2%) + float/net interest on
  deposits + **SaaS subscriptions**. The account is "free"; the software and float
  pay. All three are shifting toward recurring software revenue for margin.
- **Differentiation is NOT the plumbing** (everyone rents IntraFi + Apex). It's the
  **automation/AI layer** (Ramp), **enterprise/global reach** (Brex, cards in 50+
  countries, VAT recovery in 120+), or **owning the charter** (Mercury → national
  bank, ~2027).

### Stablecoin infra layer
Velocity/Stable Sea sit at the **thin, CFO-facing treasury/orchestration** top of a
stack whose lower layers (issuance: Circle/Brale; custody/settlement: Fireblocks/
Zero Hash) are commoditizing. The durable enterprise wedge is **treasury UX +
consolidation + yield**, not issuance.

## 4. Where Moneta could actually win (the wedge options)
Pick one or two — this is the fundraise narrative:

1. **Regulatory-anchored multi-jurisdiction as the product.** Most comps are
   US- or crypto-first. If Moneta's *product* is "one licensed relationship that
   spans jurisdictions" — Swiss anchor + EU + UK + US coverage sold as a feature —
   that's a differentiator Velocity/Bridge don't lead with. The **Swiss payment-
   institution license** (§5) is the spine of this story.
2. **A specific corridor / segment, not "global everyone."** The winners in cross-
   border (Conduit) went deep on regions. Own a segment (e.g. EU↔MENA, or crypto-
   native companies needing fiat treasury, or a vertical) rather than competing
   head-on with a $38M-funded horizontal.
3. **Head start from the existing Dakota build.** We already have working custody,
   fiat on/off-ramp, multi-rail (ACH/Fedwire/SWIFT/SEPA), and a signing/webhook
   stack (see DAKOTA-PLAN.md). That's months of the "lower stack" already built —
   we can move to the treasury/orchestration layer faster than a cold start.
4. **The Swiss relationship + brand.** A keen Swiss partner + a credible EU-neutral
   base is a real go-to-market and fundraising asset, not just a license.

## 5. Proposed lean product lineup (4–5, no more)
Mapped to the playbooks, tuned for institutional multi-jurisdiction:
1. **Multi-currency account** — fiat + stablecoin balances, named account details /
   IBANs across jurisdictions. The "one account" core.
2. **Cross-border settlement** — 24/7 stablecoin rails + fiat on/off-ramp, no
   pre-funding, transparent FX. The movement layer (this is Dakota-adjacent, partly
   built).
3. **Treasury & yield** — idle balances → tokenized MMF / T-bill yield, policy-based
   sweeps. The Mercury/Brex leg, stablecoin-native.
4. **Integrations layer** — ERP/accounting (NetSuite, QuickBooks, Xero) + payroll
   (Gusto/Rippling/Deel) sync. The "platform" glue; table-stakes for treasurers.
5. **(Optional) Corporate cards / spend** — interchange revenue; add later, not v1.

Monetization mirrors the comps: **FX/settlement spread + treasury yield spread +
SaaS subscription (+ interchange later).**

## 6. Regulatory strategy — the Swiss anchor
The revised **Swiss Financial Institutions Act (FinIA)** introduces a new
**"payment instrument institution" (Zahlungsmittelinstitut)** license (alongside a
"crypto-institution"). One FINMA-supervised license authorizes: **accepting client
funds** (non-interest-bearing, not re-lent), **payment services**, **issuing
fiat-pegged stablecoins**, and **stablecoin custody** — with bankruptcy-remote
client-fund segregation. Crucially for us, it **removes the old fintech license's
CHF 100M group-consolidated deposit cap** that penalized foreign-controlled
neobanks, and has an explicit **foreign-control path (art. 51c)** (reciprocity +
non-Swiss-implying name + home-regulator supervision).

**Why Switzerland:** one license spanning **fiat + stablecoin** (vs. EU's split
EMI + MiCA, vs. the US 50-state MTL patchwork), FINMA credibility, DLT Act +
Crypto Valley Zug ecosystem, neutral hub for a multi-jurisdiction build.

**Honest caveats (say these to investors, don't hide them):**
- **Not yet law.** Consultation closed 6 Feb 2026; realistic entry into force
  **2027 at the earliest.** So it's a "building toward" story, not "available now."
- **Capital floor unpublished** (ordinance pending; old fintech license was
  CHF 300k / 3% of deposits — treat new figure as unknown).
- **No EU passport.** Switzerland is outside the EU, so serving the single market
  likely still needs an **EU EMI subsidiary** (MiCA, €350k). Multi-entity from day
  one.
- Comparators: **EU** = EMI + MiCA (passports 27 states); **UK** = FCA API/EMI +
  new crypto regime (auth window Sep 2026–Feb 2027, mandatory Oct 2027); **US** =
  GENIUS Act (2027) but sub-$10bn issuers still need state MTLs.

## 7. Open questions to resolve at the touch-base
- **The wedge (§4):** which one do we plant the flag on? Investors will ask.
- **Segment & first corridor:** who is the design-partner customer, and where?
- **Velocity delta:** what do we do that a $38M-funded, ex-Worldpay CFO-first team
  doesn't? (Regulatory-anchored multi-jurisdiction? Segment focus? Swiss/EU base?)
- **Regulatory sequencing:** Swiss anchor (2027) vs. start under partner/existing
  licenses now (Dakota, an EU EMI-as-a-service) to get to market before the license
  lands.
- **How much of the retail Moneta build carries over** vs. needs rebuilding for
  institutional (the rails carry; the UI/UX largely doesn't).
- **The Swiss partner:** what exactly are they bringing — capital, license, GTM,
  local presence for art. 51c?

## Sources
- Treasury platforms: mercury.com/accounting-automations · brex.com/legal/bba-treasury-terms · ramp.com/blog/introducing-ramp-treasury · sacra.com/c/mercury · sacra.com/c/ramp · fourweekmba.com/how-does-brex-make-money
- Stablecoin infra: velocity.xyz · fortune.com (Velocity $38M, 2026-07-14) · stablesea.com · pymnts.com (Stable Sea) · defiprime.com/stablecoin-issuance-infrastructure-2026 · zerohash.com
- Swiss/reg: caplaw.ch (payment-instrument-institution license) · deloitte.com/ch (payment tokens) · loyensloeff.com (FinIA amendments) · buckinghamcapitalconsulting.com (MiCA EMT/ART) · skadden.com (UK crypto regime) · eco.com (GENIUS Act)

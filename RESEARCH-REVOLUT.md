# Competitor breakdown — Revolut (for future use)

> Research: 2026-07-17. Sources at bottom. Revolut is the reference "financial
> super-app" — the closest thing to what Moneta could grow into, minus the
> stablecoin rails. Read this for what to copy, what to avoid, and where a
> stablecoin neobank can differentiate.

## What Revolut is, in one line
A mobile-first "financial super-app" that started as a cheap travel/FX card and
became a near-full bank: **70M customers, ~$6.0B revenue in 2025 (+46% YoY),
$2.3B pre-tax profit (5th straight profitable year), targeting $9B revenue /
$3.5B profit in 2026.** Freemium consumer + business. This is the playbook a
neobank scales into.

## What they offer (the product surface)
- **Free multi-currency account** — hold/spend 25+ currencies in one app.
- **Cards** — virtual (instant) + physical debit; metal/custom cards on paid
  tiers; Apple/Google Pay; disposable virtual cards.
- **Currency exchange** — interbank rates *within limits* (the catch — see fees).
- **International transfers** — cross-border, some free allowance by tier.
- **Crypto** — buy/sell in-app (1.5–2.5% spread).
- **Stocks & commodities** — fractional investing, some commission-free allowance.
- **Savings / "Vaults"** — interest-bearing pots, round-ups.
- **Business** — Revolut Business (accounts, expense cards, payroll, API).
- **Insurance** — travel/purchase/medical bundled into higher tiers.
- **Tools** — budgeting, spending analytics, subscription tracking, bill splitting.
- **Direction of travel** — lending, mortgages, "becoming a real global bank."

## Plans & fees (US, 2026)
| Plan | Monthly | Who it's for |
|---|---|---|
| **Standard** | Free | Everyone — free core account + card |
| **Plus** | $3.99 | Light users wanting bigger limits/perks |
| **Premium** | $9.99 | Frequent travelers — insurance, higher limits |
| **Metal** | $16.99 | Heavy users — cashback, metal card, unlimited FX |

*(A top "Ultra" tier exists at ~€55/£45 but is EU/UK-only, not US.)* Each step up
raises the free-FX limit, raises ATM free limits, adds cashback, better rates,
insurance, and card perks.

## The fee "catches" (where users grumble — Moneta's opening)
Revolut markets "fee-free" but monetizes through friction most users don't see:
- **Weekend FX markup** — ~1% (2% on exotic currencies) when markets are closed.
- **Monthly free-FX limit, then 1% "fair usage" fee** — ~£1k Standard, £3k Plus,
  £10k Premium, unlimited Metal.
- **ATM free limit, then 2%** — ~€200/mo Standard, scaling up by tier.
- **Crypto spread** — 1.5–2.5%.
- **Subscriptions** — the tier fees themselves.
Common complaints: **AI-heavy support** frustrating on complex issues,
**account freezes** on large/unusual transactions, and **opaque weekend rates**.

## Why people actually use it
- **Cheap core banking** — free account + card, avoids legacy bank fees.
- **Best-in-class for travel** — multi-currency, good FX (within limits), works
  everywhere.
- **All-in-one** — bank + invest + crypto + budgeting in one slick app; instant
  virtual cards; fast branchless signup.
- **Segments:** frequent travelers, budget-conscious consumers, retail
  investors, tech-savvy millennials/Gen-Z.

## How they make money (the model to learn from)
Freemium: convert free → paid subscribers, and monetize *everyone* via
transactions. 11 product lines each >$135M/yr. 2025 mix:
- **Card interchange** — ~$1.3B (~22%), 0.2–1.5% per purchase.
- **Subscriptions** — ~$936M (~16%, +67% YoY — the fastest grower).
- **FX markups** — ~$800M (~13%).
- **Trading commissions** (crypto/stocks), **interest income** on deposits/
  lending, **business banking** fees.

## What this means for Moneta
- **The monetization menu is proven and directly portable:** interchange (our
  Stripe Issuing card), premium tiers, FX/stablecoin-conversion spread, and
  yield on balances. We don't need to invent a revenue model — this is it.
- **Subscriptions are the fastest-growing, highest-margin line.** Our tier
  structure (see [[reference_neobank_guide]]) should mirror the Standard→Metal
  ladder: free core, paid tiers that raise limits + add perks.
- **Differentiate on the two things Revolut is weak at:**
  1. **Fee transparency** — their weekend markup / FX-limit / ATM catches are
     the top grievance. Moneta's landing already promises "every fee on the
     receipt"; this is a real wedge, not just copy.
  2. **Settlement speed & rails** — stablecoin (Dakota) settles on-chain in
     seconds; a genuine story vs. Revolut's card+FX plumbing, especially for
     cross-border.
- **Support quality** is Revolut's soft underbelly (AI-only frustration + freeze
  complaints) — a trust angle for a "regulated, human when it matters" position.
- **Watch:** Revolut is itself moving toward crypto/stablecoins and global
  banking — the moat isn't the feature list, it's trust + transparency + the
  stablecoin-native settlement advantage while it lasts.

## Sources
- Revolut US plans: https://www.revolut.com/en-US/our-pricing-plans/
- Fees & criticisms: https://financer.com/review/revolut/ · https://sendmoneycompare.com/guides/revolut-foreign-transaction-fees-2026
- Business model / revenue: https://www.businessofapps.com/data/revolut-statistics/ · https://insights4vc.substack.com/p/revolut-6b-revenue-70m-customers · https://sacra.com/research/revolut-at-6b-year-growing-50-percent-yoy/

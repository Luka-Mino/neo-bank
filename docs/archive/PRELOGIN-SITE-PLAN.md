# Pre-Login Site Plan — what to add before the login

> 2026-08-25. From a 4-site research sweep (Revolut, CIBC, RBC, + Wise/Mercury/
> Monzo). Goal: decide which public pages Moneta needs beyond the single landing
> page. Tuned to Moneta's reality: basic banking only, no pricing, stablecoin-
> backed, personal-vs-business undecided, email not wired yet.

## The pages every money site has (and why)

A money brand has to answer, in order: *what is this → can I trust it → what does
it cost → how do I start.* So the same pages recur everywhere:

- **Home** — one value prop, one repeated CTA, trust signals, routes to the rest.
- **Security / trust** — the #1 pre-signup blocker. Concrete protections + a named
  safety net (FDIC/CDIC, or "who actually holds your money").
- **How it works / product** — removes uncertainty before signup.
- **Pricing / fee transparency** — incumbents publish fees; fintechs turn "no
  hidden fees" into a differentiator (the *statement* is universal even without a
  tier table).
- **About / company** — legitimacy for an unfamiliar brand.
- **Help / FAQ** — reachability is itself a trust signal.
- **Legal cluster** — Privacy, Terms, Cookies, Complaints, Accessibility.
- **Deep footer** — grouped Products/Company/Help/Legal; doubles as the sitemap.
- **Personal vs Business split** — but that's a *product commitment*, not a layout
  choice (Revolut runs two entire site trees).

Shared conversion mechanics: one dominant CTA repeated top/mid/bottom; hard-number
social proof; a headline insurance/custody figure; trust badges in the hero.

## Recommended Moneta sitemap

| Page | Priority | What goes on it | Notes |
|---|---|---|---|
| **Home** (exists) | P0 | Tighten: one repeated CTA, a headline "built on Dakota's regulated rails" trust line, a "no hidden fees" strip | Don't rebuild — we just redid it. |
| **Security & trust** | **P0** | How we protect you (MFA, freeze card, encryption, monitoring) + **how funds are held** (Dakota custody, stablecoin backing/redemption) + how to report a problem | Highest-leverage new page for a stablecoin brand. Only claim what's true. |
| **How it works** | **P0/P1** | Plain-language: deposit → held as stablecoin → send/spend/receive; cross-border speed; "money, just faster" (not crypto-trading) | Can start as a Home section, graduate to its own page. |
| **About** | P1 | Mission, who's building it, "built on regulated infrastructure", contact | Keep honest — no invented team/press logos. |
| **Help / FAQ** | P1 | FAQ by topic (accounts, sending, security, stablecoin basics) | **FAQ-only** until email is wired — no dead "email us". |
| **Legal cluster** | P1 | Privacy, Terms, Cookies, Complaints, Accessibility | Terms + Privacy already exist; add the rest, wire into footer. |
| **Fee transparency** (not pricing) | P1 | "See the cost before you send / no hidden FX markup" statement | Explicitly NOT a pricing page. |
| **Business teaser** | P2 ⚠️ | At most a single "/business — interested?" teaser | Product decision: a real Business page commits us to business banking + a 2nd site tree. Defer. |
| **Learn / Blog** | P2 | Stablecoin explainers, guides | Backlog it. |
| **App download** | Skip ⚠️ | — | No app yet — don't fake store badges. |
| **Pricing / plans** | Don't build | — | Violates "no pricing yet". |
| **Investments / loans / rewards** | Don't build | — | Outside "basic banking"; stablecoin is *money*, not a trading product. |

## Recommended nav + footer

**Top nav (need-based, personal-neutral — no Personal/Business split yet):**
`How it works` · `Security` · `About` · `Help` · `Log in` · **`Get started`** (dominant, repeated down the page).

**Footer groups** (only fill columns with true content):
- **Product** — How it works, Security
- **Company** — About, Contact
- **Help** — FAQ, Report a problem
- **Legal** — Privacy, Terms, Cookies, Complaints, Accessibility
- **Trust line** — a visible "built on Dakota's regulated infrastructure" statement near the footer + every CTA

## Build order

1. **Tighten Home** — repeated CTA, Dakota trust line, "no hidden fees" strip.
2. **Security & trust page** — the highest-leverage build.
3. **How it works page** — the stablecoin-as-money explainer (our wedge).
4. **Footer legal cluster + minimal About** — the cheap "looks like a real bank" layer.

**Do NOT build yet:** pricing, a full Business tree (teaser at most — needs the
personal/business decision), app-download badges, a blog (backlog), or any
investments/loans/rewards surfaces.

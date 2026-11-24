# Moneta — Institutional Build Plan

> Written 2026-08-18 from implementation research (accounting/payroll aggregators,
> Dakota business/multi-currency/yield capabilities, institutional yield mechanics).
> Companion to `INSTITUTIONAL-STRATEGY.md` (the why) — this is the **how + in what
> order**, with a hard focus on **what we can build right now** vs. what's gated.
> Same discipline as the retail build: write to real API shapes, prove behind a
> flag, dark until credentials.

## The good news up front
A surprising amount is buildable **now, for free**:
- **Dakota fully documents business/KYB** — we can build institutional onboarding
  against real shapes today (dark until creds), exactly like we did retail KYC.
- **Accounting + payroll sync is testable in free sandboxes today** — Codat (accounting)
  and Finch (payroll) both have free sandboxes; we can build and validate the whole
  integration layer with zero contract and zero live customers.
- **Dakota supports sub-clients, multiple wallets, multiple accounts** — the
  multi-entity / multi-account structure institutions need is already in the API.

The **gating unknowns** are narrow and mostly commercial/legal, not technical:
yield pass-through, EUR/SEPA/GBP breadth, and the securities-law shape of yield.

---

## Phase 0 — Foundation refactor (buildable NOW, pure app work, no external deps)
The retail app is **single-user, one person per account**. Everything institutional
needs an org model first. This is the biggest lift and the prerequisite for the rest.

1. **Organizations as first-class.** New `organizations` table (the business/entity).
   Existing `users` become **members** of orgs via an `org_members` join
   (`role`, `status`). A user can belong to multiple orgs; an org has many users.
2. **Roles / RBAC.** Roles: `owner`, `admin`, `member`, `viewer`, plus `approver`.
   Enforce at the API-handler layer (extend `apiHandler` with an org+role guard).
3. **Invitations.** Invite-by-email flow, pending/accepted states (reuses our email
   + token patterns).
4. **Approval workflows (scaffold).** A generic "action needs N approvals over $X"
   model for payments — institutions require maker/checker. Build the data model +
   enforcement points now; wire to real payments in Phase 2.
5. **Multi-currency data model.** Accounts/balances carry `currency` + `asset`
   (they default USD today). Ledger entries become currency-aware. Add a currency/
   asset registry. No FX logic yet — just the model that later products need.
6. **Org-scope everything.** Migrate existing account/transaction/card queries from
   `userId` to `orgId` scope (with the current single user auto-owning a personal org
   for backward-compat / demo).

*Deliverable:* a business can be created, multiple users invited with roles, and all
existing money screens work org-scoped. **No external dependency — this is the first
thing to build.**

## Phase 1 — Buildable NOW behind flags / against free sandboxes
No Dakota credentials, no company, no paid contracts required.

### 1A. Business onboarding (KYB) — against Dakota's documented shapes
Dakota's business application API is fully documented: `customer_type: "business"`,
entity fields (legal name, structure, registration, addresses, industry, revenue/
volume expectations, source of funds), **beneficial owners / control persons** as
associated individuals (roles: `ubo`/`control_person`/`applicant`, ownership %,
IDs), document upload, and the E-Sign-first attestation set. Two paths: hosted
`application_url` (recommended) or full API. Build the onboarding flow + entity/UBO
data model + hosted-URL handoff now; dark until creds. (Supports Sumsub/Persona
import later.)

### 1B. Accounting sync — **Codat free sandbox** (primary), Rutter as A/B
Build now and test end-to-end for free:
- Connect (OAuth) flow for **QuickBooks Online + Xero** (both have free dev sandboxes).
- **Push** bank/card transactions in for reconciliation (Codat **Bank Feeds**), and
  **write bills/suppliers** (Codat writes to all four target ledgers).
- The canonical mapping layer (our txns → accounting objects) behind an
  `accounting_sync` flag + an `AccountingProvider` abstraction (same pattern as our
  card-issuer and email providers).
- *Gated later (paid/live):* NetSuite, Sage Intacct, QuickBooks Desktop; production
  linked accounts beyond free tier; Intuit/Xero production platform fees.

### 1C. Payroll sync — **Finch free sandbox**
- Finch Connect (OAuth) + normalized payroll/pay-statement data model behind a
  `payroll_sync` flag + `PayrollProvider` abstraction.
- Finch is the pick: only aggregator covering **ADP Run + QuickBooks Payroll** with
  pay-statement depth, plus Gusto/Rippling/Deel. Build all **reads** in sandbox now.
- *Gated later:* write-back (deductions) needs Finch Pro/Premier; confirm our four
  target providers are automated (not "assisted") before relying on real-time.

### 1D. Treasury / yield — scaffold the safe parts now
The **hard compliance fact:** the GENIUS Act §4 **bans paying yield/interest on
payment stablecoins**, and the CLARITY Act is closing the "rewards" workaround. So
we **cannot** pay yield on Moneta balances directly. Yield must be **access to a
third party's registered/exempt fund, where the customer holds the security and we
are the interface.**
Build now (no license needed): **eligibility gating** — KYB status, QP/accredited
verification, **US-person geofencing** (critical: e.g. USDY is non-US only), a
`YieldProvider` abstraction, allocation/redemption orchestration interface,
ledgering, and statement generation — all dark until a provider is chosen.
*Gated later (partner + counsel):* the actual fund integration (Securitize/Ondo
Nexus/Benji for tokenized MMFs, or an embedded-brokerage BD like Apex/DriveWealth/
Atomic for a Mercury-style government-MMF sweep). **Securities counsel must opine on
whether our role crosses into unregistered broker-dealer territory before launch —
that's the gating decision.**

### 1E. Multi-account / sub-client structure
Model Dakota's **sub-clients** (Client → Sub-Client → Customer) and multiple
wallets/accounts per org (departments, currencies, purposes) in our schema + client
methods now; dark until creds.

### 1F. Corporate cards
Already scaffolded (`CARD-ISSUING-PLAN.md`) — extend to org-scope + spend controls
under the Phase-0 approval model.

## Phase 2 — Gated on external unlocks
Not buildable to completion now; sequence as unlocks arrive.

| Unlock needed | Enables |
|---|---|
| **Dakota sandbox credentials** | Real KYB, real money movement, prove the whole stack (the standing blocker) |
| **Confirm with Dakota** (commercial) | **Yield pass-through** to end-customers; **EURC / EUR-SEPA in+out, GBP** rails; full FX currency breadth |
| **Registered company** | Stripe card issuing live; contracting partners |
| **Yield partner + securities counsel** | Live treasury/yield product (tokenized fund rails or embedded-brokerage sweep) |
| **Paid aggregator tiers** | NetSuite/Sage Intacct/QBD accounting; Finch payroll write-back; production volume |
| **Licensing track** (Swiss/EU/US) | Regulated multi-jurisdiction offering — separate legal/business workstream, not code |

## Recommended build order
1. **Phase 0 org/RBAC/multi-currency foundation** — unblocks everything; start here.
2. **1A business KYB onboarding** — the institutional front door (dark, real shapes).
3. **1B + 1C accounting + payroll sync in sandboxes** — real, demonstrable value with
   zero external cost; great for a demo/raise ("here's live QuickBooks + Gusto sync").
4. **1D + 1E + 1F** — scaffold treasury/yield eligibility, sub-clients, org cards.
5. **Phase 2** as unlocks land.

## Decisions / confirmations needed (not code)
- **Confirm with Dakota:** yield pass-through; EUR-SEPA + GBP rails; FX breadth;
  sandbox access (still the standing blocker).
- **Securities counsel:** the yield product's structure (BD line).
- **Product call:** which customer segment first (drives QP vs. retail-min yield
  choice, US vs. non-US geofencing) — ties to the wedge in `INSTITUTIONAL-STRATEGY.md`.
- **Partner selection:** Codat vs Rutter (accounting); yield via tokenized-fund
  issuer vs embedded-brokerage.

## Sources
See `INSTITUTIONAL-STRATEGY.md` plus: docs.dakota.xyz (business onboarding, sub-clients,
accounts) · codat.io / rutter.com / tryfinch.com (sandboxes, coverage, pricing) ·
GENIUS Act §4 + CLARITY Act (stablecoin yield ban) · Securitize / Ondo Nexus / Franklin
Benji (tokenized MMF rails) · SEC Statement on Tokenized Securities (Jan 2026).

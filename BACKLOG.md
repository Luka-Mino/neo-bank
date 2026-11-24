# Backlog

## Revenue & Monetization
- [ ] Premium subscription tiers (free/plus/premium) — Revolut gets 30%+ from paid plans.
      NOTE: prototyped a /pricing page + tier ladder 2026-07-18, **reverted 2026-07-19** —
      nothing to offer yet, it's just basic banking for now. Don't rebuild until there are
      real paid features. Components recoverable from git history (commit cc4ac47).
- [ ] Fee structure design — transparent "every fee on the receipt" comparison block
      (also prototyped + reverted with the above; revive once real fees are set with Dakota)
- [ ] Business accounts — drive 67% of neobank revenue globally
- [ ] Developer fee (basis points) on Dakota transactions
- [ ] Rewards on balances via Dakota's RD (Treasury-backed stablecoin) — raised by
      our Dakota contact 2026-11-23 as "earning on customer deposits".
      **This is a legal and business decision before it is a feature:**
      - who receives the rewards (Moneta as float revenue, or users)
      - state restrictions (our DAKOTA-PLAN notes RD is state-restricted)
      - how consumer interest-like rewards are treated
      - the site's "no rewards/investments" rule
      Ask Dakota how it works for a consumer app before scoping.

## Growth & Acquisition
- [ ] Referral/invite system — organic growth is 70%+ for top neobanks
- [ ] Early direct deposit (paychecks 2 days early) — #1 acquisition hook
- [ ] Credit-building tools — targets underbanked market

## Features
- [ ] Spending insights — categorized transactions, monthly breakdown
- [ ] Budgeting tools — spending limits, category tracking
- [ ] Savings goals — high-yield savings display with APY
- [ ] AI-powered spending analysis
- [ ] Recurring payments / scheduled transfers
- [ ] Multi-currency support
- [ ] Swap (crypto-to-crypto) flow in the UI
- [ ] Balance history chart (Recharts on dashboard)
- [ ] Physical Moneta card. The clear green "struck coin" designs are on the
      brand-assets board. Dakota Cards docs describe **virtual** cards only;
      ask Dakota about physical/custom printing, then pick a manufacturer and
      order tinted-plastic samples.
- [ ] Apple Pay / Google Pay. Needs Dakota support; digital card art must keep
      the Visa mark top corner and the lower-left clear.

## Trust & Security
- [ ] FDIC insurance badge + fund protection explainer
- [ ] Security indicators throughout UI
- [ ] Biometric auth (WebAuthn/passkeys)
- [ ] Two-factor authentication (TOTP)
- [ ] Session management (active sessions view)

## Real-time & Notifications
- [ ] SSE real-time updates (Redis pub/sub → browser)
- [ ] BullMQ worker for async webhook processing
- [ ] Email notifications via Resend (transaction alerts, KYC updates)
- [ ] Push notifications (web push API)

## Niche / Positioning
- [ ] Define target market: crypto-native? cross-border? gig workers?
- [ ] Tailor onboarding and features to chosen niche
- [ ] Landing page / marketing site

## Infrastructure
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Error monitoring (Sentry)
- [ ] Logging (Axiom)
- [ ] Rate limit handling for Dakota API (60 req/min)
- [ ] Redis caching layer
- [ ] Database connection pooling for production

## Dakota platform (ideas beyond the base integration — see DAKOTA-PLAN.md)
- [ ] Passkey-endorsed transactions — register user passkeys as Dakota WEBAUTHN signers so users cryptographically approve their own sends (mixes with our platform ES256 signer in one signatures array). **Now launch-relevant (2026-11-24):** if the user's passkey is required, we stop having sole control of funds, which bears on whether we're a money transmitter. See `LAUNCH-READINESS-PLAN.md` §1b, D11.
- [ ] Tiered wallet policies — amount_threshold rule requiring 2-of-N approval above e.g. $10k (fraud/ops control)
- [ ] Swap accounts / one-off swaps (USDC↔USDT cross-chain) — Dakota supports both reusable and one-off
- [ ] Custom in-app KYC UI replacing Dakota's hosted form (application endpoints + document upload + attestation sequencing)
- [ ] Sumsub token import — onboard users already KYC'd elsewhere without re-verification (needs tri-party Sumsub agreement)
- [ ] RD stablecoin support on Base (blocked: state-restricted in FL/GA/NY/TX/WA/LA)
- [ ] Fedwire same-day withdrawals as a premium feature (one-off transfers support per-txn rail override)
- [ ] Dakota MCP server in dev tooling (read-only sandbox inspection from Claude Code)
- [ ] Adopt official @dakota-xyz/ts-sdk if our hand-rolled client drifts from their OpenAPI

## Team / RBAC (post-PR-7 — see TEAM-RBAC-PLAN.md)
- [ ] Custom-role builder (define roles + capability sets per org)
- [ ] Per-account / per-department / cost-center access scoping (grant table `org_member_account_access` — keep account visibility composable now)
- [ ] SCIM / HRIS auto-provisioning (Gusto/Deel/Rippling) — sync members + deprovision
- [ ] Multi-entity: entity-scoped admins for orgs with multiple legal entities
- [ ] Sequential named-approver chains + manager-chain routing (we ship flat M-of-N first)
- [ ] Category/merchant-locked card spend policies
- [ ] Advisor / accounting-firm external portal access

## Compliance & Legal
- [ ] Terms of service
- [ ] Privacy policy
- [ ] Clear "not a bank" disclosures (UDAAP compliance)
- [ ] ~~FDIC pass-through insurance documentation~~. Not applicable while balances are USDC, which is not FDIC-insured. Revisit only if we add a bank-deposit product.
- Licensing paths researched 2026-11-24 (`reports/Moneta licensing and permits.md`); decisions D9–D12 are in `LAUNCH-READINESS-PLAN.md` §1b. Deferred options:
  - [ ] Offshore licensed entity for non-US customers (Bermuda / Cayman / Bahamas / Gibraltar / ADGM–VARA digital-asset licence plus a partner bank). Needs a hard block on US persons.
  - [ ] Own US licences: FinCEN MSB plus NMLS multistate MTLs, NY BitLicense, CA DFAL.
  - [ ] Swiss payment-instrument-institution licence (still a draft, likely 2028+), or an EU MiCA CASP plus EMI.
  - [ ] Canada: FINTRAC MSB, Bank of Canada RPAA registration, Quebec MSB licence.
  - [ ] OCC national trust charter (about $10M capital) as the long-term route.

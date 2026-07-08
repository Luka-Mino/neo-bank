# Backlog

## Revenue & Monetization
- [ ] Premium subscription tiers (free/plus/premium) — Revolut gets 30%+ from paid plans
- [ ] Fee structure design — transparent pricing page
- [ ] Business accounts — drive 67% of neobank revenue globally
- [ ] Developer fee (basis points) on Dakota transactions

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
- [ ] Passkey-endorsed transactions — register user passkeys as Dakota WEBAUTHN signers so users cryptographically approve their own sends (mixes with our platform ES256 signer in one signatures array)
- [ ] Tiered wallet policies — amount_threshold rule requiring 2-of-N approval above e.g. $10k (fraud/ops control)
- [ ] Swap accounts / one-off swaps (USDC↔USDT cross-chain) — Dakota supports both reusable and one-off
- [ ] Custom in-app KYC UI replacing Dakota's hosted form (application endpoints + document upload + attestation sequencing)
- [ ] Sumsub token import — onboard users already KYC'd elsewhere without re-verification (needs tri-party Sumsub agreement)
- [ ] RD stablecoin support on Base (blocked: state-restricted in FL/GA/NY/TX/WA/LA)
- [ ] Fedwire same-day withdrawals as a premium feature (one-off transfers support per-txn rail override)
- [ ] Dakota MCP server in dev tooling (read-only sandbox inspection from Claude Code)
- [ ] Adopt official @dakota-xyz/ts-sdk if our hand-rolled client drifts from their OpenAPI

## Compliance & Legal
- [ ] Terms of service
- [ ] Privacy policy
- [ ] Clear "not a bank" disclosures (UDAAP compliance)
- [ ] FDIC pass-through insurance documentation

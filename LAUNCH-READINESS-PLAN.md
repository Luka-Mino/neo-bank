# Launch Readiness Plan

> Written 2026-11-23. This is the execution plan for getting from "everything
> built on mocks" to "ready for the first external users". `ROADMAP.md` stays
> the milestone view (M1–M5); this file is the detailed, tick-as-you-go work
> list. Unused ideas still go to `BACKLOG.md`.
>
> **Until Dakota answers, work from `PRE-DAKOTA-PLAN.md`:** it lists
> everything doable now, in order, with exact steps.
>
> How to use: work top-down within a phase. Every item has a **Done when**.
> Items marked 🟥 are security-relevant; ⛔ means blocked on something outside
> the codebase.

---

## 0. Where we are (snapshot, 2026-11-23)

| Area | State | Risk |
|---|---|---|
| **Uncommitted work** | Today's work is not committed or deployed: public site redesign, `/app`, Dakota cards groundwork, docs. Staging (neo-bank-rho.vercel.app) is months out of date. | High: work can be lost, and nobody can review it |
| **Dependencies** 🟥 | `npm audit --omit=dev`: **31 vulns, 5 critical, 14 high**, all fixable. Criticals: `next` (RSC DoS), `next-auth`/`@auth/core` (auth checks can fail open on config errors; email homoglyph bypass), `@sentry/nextjs` (middleware bypass via tunnel route; **we don't use the tunnel route**), `proxy-addr` (transitive) | High |
| **Route protection** 🟥 | `/accounts`, `/team`, `/approvals`, `/transfer-internal` are missing from `protectedPaths` in `src/middleware.ts`. Their APIs are protected; the pages render signed-out | Medium |
| **Middleware** | Next 16 deprecated `middleware.ts` → `proxy.ts`. Warns every boot | Low |
| **Org isolation** 🟥 | `withOrg()` exists (`src/lib/db/with-org.ts`) but **0 of 58** API routes use it. 28 routes are `orgScoped` at the app layer only. The RLS "enforce" migration from `ORG-FOUNDATION-SPEC.md` was never shipped; `0018` was used for team capabilities instead | High before real users |
| **Backend / Dakota** ⛔ | Full integration written to Dakota's docs (KYC, wallets, deposits, two-leg withdrawals, webhooks, reconcile, bootstrap, cards provider). **Never run against Dakota.** `DAKOTA_API_KEY` is a placeholder | Blocked on sandbox |
| **Migrations** | `0019_dakota_cards.sql` written, applied nowhere | Low |
| **Public site** | All pages in the new bank style. Open: 3 text placeholders, 2 photos, a custody-wording legal review, and the homepage still the old dark design at `/` | Medium |
| **Logged-in app** | New `/app` shell done for home, account detail, and the Move / Card / More menus (desktop + mobile). **13 working screens are still the old dashboard style.** Sign-in still lands on `/dashboard` | Main remaining build |
| **Brand assets** | Approved picks (icons A, buttons C) and card finalists live on the design board, not in code | Waiting on go-ahead |

---

## 1. Decisions (all answered 2026-11-23)

> **Decided:**
> - **D1:** `/personal` becomes the homepage.
> - **D2:** Apply icons A and buttons C everywhere.
> - **D3:** Sign-in lands on `/app`.
> - **D4:** Personal **and business with Teams** are both first-class, so 2.11 moves up to P1.
> - **D5:** Email support first.
> - **D6:** Counsel reviews the legal copy.
> - **D7:** Delete Loans.
> - **D8:** Later, with physical cards.
>
> The table below is kept for the reasoning.

| # | Decision | Blocks | Recommendation |
|---|---|---|---|
| D1 | Make `/personal` the homepage? (old landing → removed, or kept at `/classic` for reference) | 3.1 | Yes; delete the old landing after one review |
| D2 | Apply icon style **A** (contour disc) and button style **C** (rounded rectangle) everywhere? | 2.0, 3.2 | Yes |
| D3 | After sign-in, land on the new `/app` instead of `/dashboard`? | 1.5 | Yes, once Phase 2 reaches send/deposit parity |
| D4 | Personal only, or personal + business (Teams/Approvals)? | 2.11 scope, 4.1 effort | Keep Teams, lower priority than personal flows |
| D5 | Support channel to publish (email address, phone, hours, fraud line) | 3.3 | Email first (Resend is already wired); phone later |
| D6 | Who reviews legal copy (disclosures, custody wording)? | 3.4, launch | Counsel before first external user |
| D7 | Loans page: delete? (product decision: no loans) | 2.x cleanup | Delete |
| D8 | Card tint / layout for the physical card | Backlog (physical is sidetabled) | Decide when physical cards are back on the table |

---

## 1b. Licensing and permits (researched 2026-11-24) ⛔

> Full report: `reports/Moneta licensing and permits.md`. Source notes:
> `research_notes/Moneta licensing and permits/` (8 files). This is research,
> not legal advice; counsel decides.

**Open decisions (not yet answered):**

| # | Decision | Why it matters |
|---|---|---|
| D9 | Who are the customers: US residents, non-US retail (which region), or businesses? | Drives every licence. An offshore licence does **not** permit serving US residents |
| D10 | Offshore entity or not (user leaning "probably offshore, not sure"), and where | Offshore deposit bank needs about US$10M+ capital; digital-asset licence about US$100k–2M plus a partner bank |
| D11 | Custody design: keep the platform-only signer, or require the user's passkey? | Today the server holds the only signing key, so we are very likely a money transmitter ourselves, not covered by Dakota's licences |
| D12 | Where the company and team are based (US / Canada / elsewhere) | Canadian staff or incorporation likely triggers FINTRAC MSB registration even with US-only users |

**Findings that apply whichever path we pick:**
- Running "under Dakota's licences" only holds if we neither control funds nor run our own ledger. Fix candidates: route user-to-user transfers through Dakota; register users' passkeys as required WebAuthn signers (BACKLOG item, now launch-relevant).
- Dakota's public Terms (updated 2026-11-20) are commercial-only, and the Lead Bank agreement excludes consumer payments. Get written confirmation of a consumer programme.
- New York cannot be served under a partner with app-held keys. California's crypto licence went live 2026-07-01 and we missed the window. Geo-block both until resolved.
- Launching unlicensed first can disqualify us from NMLS multistate licensing later.
- GENIUS Act takes effect 2027-01-18. Rewards on RD balances are a counsel question.
- Copy: never call Moneta a bank (state laws, FDIC Part 328, Canada Bank Act s.983).

> **Correction to the report (checked against the code 2026-11-24).** The
> research brief assumed user-to-user transfers are book entries. They aren't:
> internal, recurring and approval-executed transfers all go through
> `performInternalTransfer`, which moves money only between accounts of the
> **same** org. That is sub-account bookkeeping, not paying another person.
> The live problem is the signing key. Keep it that way: Moneta-to-Moneta
> payments (the 2.x "how to pay people" decision) go on-chain through Dakota,
> never as book entries.

## Phase 1c: Build changes from the licensing research

> Before any real customer money moves. The sandbox drill (5.2) can still run
> on the current design, since sandbox funds aren't real.

### What Dakota already does (checked against docs.dakota.xyz on 2026-11-24): don't build

- **KYC/KYB, ID documents, sanctions screening, transaction monitoring, wallet-address screening.** Dakota runs these on every customer and payment. A blocked send comes back as `compliance-blocked` (422); we only show it.
- **The six consent attestations** (E-Sign first, then Dakota Terms, Privacy, Funds Transfer Agreement, Lead Bank privacy, accuracy). The hosted form at `application_url` collects them. If we ever build a custom KYC UI, we'd have to collect them ourselves, which is one more reason to stay on the hosted form.
- **Proof of address.** Dakota freezes anyone over $3,000 in a rolling 7 days without approved proof of address, and the hosted link lets them upload it later. We only show the status (`poa_status`, the `pending_proof_of_address` webhook).
- **RD geofencing.** Dakota blocks RD by state itself (`state-restricted-rd`; the docs now list GA, NY, TX, WA and LA, without FL). We aren't offering RD anyway.
- **Prohibited countries.** Covered by Dakota's screening and terms.
- **Cards terms.** Only the customer can accept, on Dakota's hosted page. There's no API for it.
- **Card dispute filing.** The cardholder tells us, we report it with `POST /card_dispute_reports`, and Dakota files it with Visa.
- Note: Dakota Cards is still **sandbox-only** per their docs.

### Can start now (needed whatever Dakota answers)

> **1c.1–1c.3 done 2026-11-24.** Unit tests (209) and integration tests
> (`src/lib/legal-support.integration.test.ts`, run against a local DB
> migrated through 0020) pass. Migration `0020_legal_acceptance_and_support`
> is applied **only to the local dev DB**: apply it to staging/prod with
> 0019. Set `SUPPORT_EMAIL` in Vercel, or requests are saved without an inbox
> copy.

- [x] **1c.1 Drop "banking" as a self-description.** Titles, hero, eyebrows, footer, auth layout, breadcrumb, aria-labels and the social image are now "Everyday money" / "Money that keeps up with you"; the social image (`src/app/opengraph-image.png`, `twitter-image.png`) was re-rendered from `/design/og`. Also fixed: the old dashboard menu said **"Funds protected up to $250K"** (reads as FDIC insurance, which USDC doesn't have). It now says "Balances are USDC, not FDIC-insured". "Bank-grade security" is now "Two-step sign-in".
  - [ ] **Follow-up for counsel: "Checking" and "Savings".** They are bank deposit-account names, used in the hero copy, the footer, the meta description, the social image and the account types. Ask counsel whether non-bank use is OK in our target states. If not, rename them (e.g., "Everyday" / "Set-aside"), which touches the account types in the data model.
- [x] **1c.2 Accept Moneta's own Terms and Privacy at sign-up.** A required checkbox on `/register`. The server stores `terms_version`, `privacy_version` and `legal_accepted_at` from `src/lib/legal.ts` (also the source of each page's "Last updated"), plus a `legal.accepted` audit entry. Users created before 0020 have NULLs.
  - [ ] Later: a re-acceptance prompt when `LEGAL_DOCS` versions change. Needs counsel's view on which changes require it.
- [x] **1c.3 Support and complaints intake.** `/app/more/help` (More → Help & support), plus "Report a problem with this payment" on each transaction. The `support_requests` table holds a `SUP-XXXXXX` reference, a category (question, complaint, card dispute, fraud) and a status. `GET`/`POST /api/support` check that a linked payment is in the caller's org. Each request triggers an in-app notification, an escaped copy to `SUPPORT_EMAIL`, and an audit entry.
  - [ ] No staff view yet: work requests from the inbox and update `status` in the DB. Build an ops screen when volume needs it.
  - [ ] Card disputes are forwarded to Dakota by hand until Cards leaves Dakota's sandbox; then wire `POST /card_dispute_reports` (see 5.3).
- [ ] **1c.4 Hold the line.** No rewards, no RD, no Moneta-to-Moneta book transfers, no new server-initiated on-chain sends.

### Wait for Dakota's answers before building (§5.1 Q6, Q7, Q8, Q12)

- [ ] **1c.5 Residence gate (Q8).** Dakota's docs show no state geofence for USDC; their examples even onboard CA and NY addresses. Its licences page lists 20 states but says "licensed **or otherwise authorized**". Ask whether Dakota enforces state eligibility at KYC. If it does, build nothing; if not, gate sign-up to the states Dakota names.
- [ ] **1c.6 Custody redesign (Q7, Q12).** Dakota's public docs offer only non-custodial wallets, so "(a) Dakota is the custodian" exists only if Dakota offers it privately.
  - **(a) Dakota hosts the wallet** (e.g., the three-shard "Dakota-Supported Wallet" in their Terms). Least code: change wallet creation.
  - **(b) Users hold the key.** Dakota verifies passkey signatures but doesn't host the passkey ceremony. We build browser registration and signing (`navigator.credentials`, with `@simplewebauthn/server` for the COSE key, per Dakota's WebAuthn guide). We use Dakota's TypeScript SDK for signer-group governance. Per-wallet policy needs the user's signature. The same passkey can also be the login factor. Recovery is a second passkey, never platform-only. Dakota's card enablement already assumes the customer holds the key, so (b) fits cards too.
  - **Touches:** `src/lib/dakota/{signing,wallets,wallet-transactions,provisioning}.ts`, `scripts/dakota-bootstrap.ts`, the send and withdraw routes, and `review-sheet.tsx`.
- [ ] **1c.7 Team approvals enforced by Dakota (only under b).** Each approver's passkey joins the org's signer group with threshold M, so Dakota's policy engine enforces M-of-N for on-chain sends.
- [ ] **1c.8 Onboarding for the chosen segment (D9, Q6).** Business-first uses Dakota's hosted KYB (`customerType: "business"` already exists in `src/lib/dakota/customers.ts`). Consumer-first waits until Dakota confirms a consumer programme in writing.

---

## Phase 1 — Secure the base ✅ done 2026-11-23 (two follow-ups open)

> **Result:**
> - **Committed and pushed:** today's work, in four logical commits.
> - **Vulnerabilities:** 31 → 5 moderate (0 critical, 0 high). Residual: Sentry's build-time bundler plugins (`glob`/`minimatch`), fixable only by `@sentry/nextjs` 11 (major); it doesn't ship in the app.
> - **nodemailer:** went to 10.6.1. A major, but a clean fit for our two-call SMTP usage.
> - **Routing:** protected-by-default via `src/lib/route-access.ts` + `src/proxy.ts`, verified with demo mode off.
> - **Sign-in:** lands on `/app`.
> - **Auth smoke test:** 15/15 pass (it found and fixed a shared rate-limit bucket).
> - **Still open:** read the Next 16.3–16.4 release notes.

### 1.1 Commit and push today's work
- [x] Review the diff by area (site, `/app`, cards backend, docs, migration).
- [x] Commit in logical chunks:
  - site redesign
  - `/app` shell
  - Dakota cards groundwork (provider, webhooks, reveal route, CSP, client, tests)
  - docs
- [x] Push to `main` (staging auto-deploys). Confirm the Vercel build is green and these load: `/personal`, `/security`, `/login`, `/app`.
- [x] Do **not** run migration `0019` on staging/prod yet; it waits for 5.2.

**Done when:** staging shows the new site and `/app`, and the build is green.

### 1.2 Upgrade vulnerable dependencies 🟥
Targets are the newest versions **within the current major**, so no breaking-change migration is needed.

| Package | Now | Target | Why |
|---|---|---|---|
| `next` | 16.2.1 | **16.4.6** | Critical RSC denial-of-service |
| `next-auth` | 5.0.0-beta.30 | **5.0.0-beta.32** | Critical: auth checks failing open on config errors; email normalizer bypass (pulls a fixed `@auth/core`). *Not* v4.24 ("latest" on npm is the old major) |
| `@sentry/nextjs` | 10.65.0 | **10.78.0** | Critical middleware bypass (tunnel route; we don't use it, upgrade anyway) |
| `nodemailer` | 9.0.3 | **9.1.1** | High: file/URL access bypass |
| `zod` | 4.3.6 | **4.6.7** | High: memory exhaustion on oversized collections |
| `react`, `react-dom` | 19.2.4 | 19.3.1 | Keep in step with Next |
| `drizzle-orm` | 0.45.2 | 0.45.4 | Patch |
| `shadcn` | 4.1.2 | 4.23.0, **and move to `devDependencies`** | It's a CLI. Moving it removes its MCP SDK / body-parser chain from production |

Steps:
- [x] `npm install next@16.4.6 next-auth@5.0.0-beta.32 @sentry/nextjs@10.78.0 nodemailer@9.1.1 zod@4.6.7 react@19.3.1 react-dom@19.3.1 drizzle-orm@0.45.4`
- [x] `npm install -D shadcn@4.23.0`, then remove `shadcn` from `dependencies`.
- [x] `npm audit --omit=dev`. Fix the remaining transitive issues with `npm audit fix` (never `--force`). Write any leftovers into this file with a reason.
- [x] `npm run typecheck && npm run lint && npm test && npm run build`
- [x] Manual smoke test on the dev server (2026-11-23: scripted, demo mode off, local DB — 15/15 pass: register, password, wrong password, 2FA setup/verify + backup codes, 2FA required/invalid/valid, magic link incl. 2FA enforcement + single-use + no replay, password reset, sign-out). It surfaced a rate-limit bug, now fixed (see 4.3):
  - password login
  - magic link
  - 2FA challenge
  - logout
  - a password-reset email renders
  - `/app` and `/dashboard` load
  - an API 401 when signed out
- [ ] Next.js advisory: read `node_modules/next/dist/docs/` release notes for 16.3–16.4 for anything that changes our code (per `AGENTS.md`).

**Done when:** `npm audit --omit=dev` shows 0 critical and 0 high (or each residual is documented), and all checks pass.

### 1.3 Protect every logged-in page 🟥
Today's list is an allowlist of *protected* paths, so every new page is public until someone remembers to add it. Flip it to protected-by-default.
- [x] In `src/middleware.ts` (→ `proxy.ts` after 1.4), define `PUBLIC_PATHS`:
  - `/`, `/personal`, `/security`, `/how-it-works`, `/privacy`, `/terms`
  - `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/magic`
  - Next.js and static asset paths, `/api/*` (API auth is enforced per route)

  Everything else requires a session.
- [x] Decide `/design/*` (dev-only hero page): gate behind `NODE_ENV !== "production"` or delete.
- [x] Unit-test the path matcher: public ones pass; `/accounts`, `/team`, `/approvals`, `/transfer-internal`, `/app/*` and an unknown `/foo` all redirect when signed out.

**Done when:** signed out, every non-public page redirects to `/login`, proven by tests.

### 1.4 Rename middleware → proxy
- [x] `npx @next/codemod@canary middleware-to-proxy .` (per `node_modules/next/dist/docs/.../proxy.md`).
- [x] Re-check CSP headers (nonce, the conditional `frame-src`) and auth redirects in the browser.

**Done when:** no deprecation warning on boot, and CSP plus redirects behave as before.

### 1.5 Sign-in destination → `/app` (after D3)
- [x] Change the redirects in `src/middleware.ts` (logged-in user hitting `/login`), `src/app/(auth)/login/page.tsx:113` and `src/app/(auth)/magic/page.tsx:43`.
- [x] Keep `/dashboard` reachable until Phase 2 cut-over.

---

## Phase 2 — Finish the logged-in app (main build, ~1–2 weeks)

**Principle.** Rebuild each screen inside the `/app` shell, phone (390px) and desktop (1440px), on the **same APIs**: no backend changes, demo mode keeps working. The old `/dashboard` screens stay live until each new one reaches parity, then cut over (2.14).

### 2.0 Shared building blocks (do first)
- [x] `src/components/ui/icon.tsx`: the approved icon set (style A contour disc + bare glyphs), ported from the design board's 16 glyphs, using the 24px grid and signal-dot spec.
- [x] `Button` variants per style C (rounded-rect 12px radius): primary forest, secondary outline, text-link with arrow, icon button, destructive. Sizes 40/48/56; focus ring; loading state.
- [x] App patterns:
  - amount input (tabular figures, currency, max button)
  - account/recipient picker sheet
  - review-and-confirm sheet showing the **exact fee before confirming**
  - success state
  - empty / loading / error states
  - toast usage
- [x] Notification bell → real dropdown (the `/app` bell is currently decorative).

**Done when:** a sample screen built only from these components passes visual review on phone and desktop.

> **2.0 done 2026-11-23.** Built as `src/components/brand/{icon,button}.tsx` (not inside `ui/`, so the old dashboard's shadcn `Button` keeps working until 2.14) plus `src/components/app/{sheet,picker,account-picker,amount-input,review-sheet,flow-screen,states,fields,api,notification-bell}.tsx`. Send money is the sample screen: verified at 390px and 1440px.
>
> **Screens done 2026-11-23:** 2.1 Send, 2.2 Deposit, 2.3 Transfer, 2.4 Withdraw, 2.5 Activity + detail, 2.12 Onboarding. All P0 screens are done. Demo mode was checked at both widths. Real-API mode was checked against the local DB with a scripted user: the 2FA refusal showed the server's reason with a fix-it link, and a real internal transfer moved balances correctly. Old-screen bugs fixed while porting:
> - Transfers held for approval were reported as "Transfer complete".
> - If the repeat failed after the transfer itself succeeded, the transfer was reported as failed.
> - The Deposit account picker had no effect: deposits always credit the primary account.
> - The Deposit page and the old dashboard made FDIC claims.
> - Transaction detail had no demo mode.
> - A 202 "confirmation pending" response was shown as done.

> **P1 screens done 2026-11-23:**
> - 2.6 Card (`/app/card`)
> - 2.7 Account management, on the account page plus "Open an account" on home
> - 2.8 Recipients (`/app/move/recipients`)
> - 2.10 Settings (`/app/more/settings`)
> - 2.11 Team and Approvals (`/app/more/team`, `/app/more/approvals`)
>
> All P0 and P1 screens now exist in `/app`, each checked in demo mode at phone and desktop width. **The real-mode browser check of these five is still pending:** the local Postgres stopped at 13:14 while an `ssh` tunnel holds port 54321. Bugs found and fixed while porting:
> - **Send was broken in real mode.** It passed the recipient id as `destinationId`, and nothing ever created a destination. Send now pays saved USDC wallet destinations, and Recipients → Add creates one.
> - **Team and Approvals were broken in real mode.** They treated `fetchApi`'s whole body as the list.
> - **Email-code 2FA could be turned off with just a session.** That now needs the password.

### 2.x Follow-ups found during the port
- [ ] **Exact fee before confirm (quote step).** Today the server learns `send_amount` (fees included) only by creating the Dakota one-off inside `POST /api/transactions`. So the Send and Withdraw review sheets say the fee is "set when the transfer is created", and the receipt shows the exact fee. To show the fee before confirm:
  - split the endpoint into `POST /api/transactions/quote`, which creates the one-off (no money moves) and stores it against the org with an expiry;
  - then `POST /api/transactions/{quoteId}/confirm`, which places the hold and does the wallet-send;
  - cancel quotes that expire.
  Needs the Dakota sandbox to verify (Phase 5).
- [ ] Restyle `LinkBankDialog` (still shadcn) into an `AppSheet` with 2.8 Recipients.
- [x] New screens no longer link to old routes. Exceptions: Insights (2.9, P2, not ported) and the "Classic dashboard" comparison link, which stays until cut-over.
- [ ] **Product decision: how to pay people.** Send pays a recipient's **USDC wallet on Base**, the only payee type the current API supports. To pay someone's *bank account* (third-party ACH/wire), or to make instant Moneta-to-Moneta transfers between users, we need a decision, plus a compliance check on third-party payouts.
- [ ] Recipients: the API has no delete or edit, so people can't be removed yet. Add `DELETE /api/recipients/[id]`, which also removes the Dakota recipient.
- [x] 2.9 Insights moved to `/app/insights` (2026-11-24, `PRE-DAKOTA-PLAN.md` D2).
- [ ] **2.14 Cut-over is ready to decide.** All P0 and P1 screens exist. Doing it removes the old dashboard, and with it the side-by-side comparison. It needs your go-ahead.

### 2.1–2.13 Screen inventory (old → new)

| # | Screen | Old file (lines) | New route | Priority | Notes |
|---|---|---|---|---|---|
| 2.1 | Send money | `send` (455) | `/app/move/send` | P0 | Recipient picker, amount, review sheet with fee, 2FA step-up, success |
| 2.2 | Deposit | `deposit` (302) | `/app/move/deposit` | P0 | Account details card (copy buttons), ACH vs wire timing copy |
| 2.3 | Transfer between accounts | `transfer-internal` (513) | `/app/move/transfer` | P0 | From/to pickers, instant |
| 2.4 | Withdraw to bank | `transfer-out` (558) | `/app/move/withdraw` | P0 | Linked banks, fee shown, two-leg status |
| 2.5 | Activity list + detail | `transactions` (386) + `[id]` | `/app/activity`, `/app/activity/[id]` | P0 | Date grouping, pending first, filters, export |
| 2.6 | Card | `card` (688) | `/app/card` | P1 | Dakota-ready: `pending` state, freeze via API, reveal via Cards.js (5.2). Remove PIN/contactless UI (Dakota is virtual-only) |
| 2.7 | Accounts management | `accounts` (414) | `/app/accounts` | P1 | Open account, savings goals, rename, close |
| 2.8 | Recipients | `recipients` (154) | `/app/move/recipients` | P1 | Add/edit/remove |
| 2.9 | Insights | `insights` (407) | `/app/insights` | P2 | Categories, budgets |
| 2.10 | Settings | `settings` (759) | `/app/more/settings` | P1 | Profile, password, 2FA + backup codes, sessions/devices, notification prefs |
| 2.11 | Team + Approvals | `team` (276), `approvals` (152) | `/app/more/team`, `/app/more/approvals` | P2 (D4) | Keep Stage-0 security behaviour exactly |
| 2.12 | Onboarding (KYC) | `onboarding` (195) | `/app/onboarding` | P0 | Hosted Dakota KYC link + status polling |
| 2.13 | Loans | `loans` (181) | — | — | Delete (D7) |

Per-screen checklist (copy into each PR):
- [ ] Feature parity with the old screen (same API calls, validation, error handling)
- [ ] Works at 390px and 1440px; no horizontal scroll; keyboard reachable; labels on inputs
- [ ] Demo mode and real-API mode both work
- [ ] Loading, empty and error states
- [ ] Money screens: fee shown before confirm; 2FA step-up preserved; idempotent submit (no double-send on double-click)
- [ ] Unit tests for any new logic; screenshot check at both widths

### 2.14 Cut-over
- [ ] All P0/P1 screens done → redirect `/dashboard*` and each old route to its `/app` equivalent.
- [ ] Delete `src/app/(dashboard)` and the old sidebar/header components, then update route protection.
- [ ] Rename `/app` → keep, or move to `/` for signed-in users. Decide at cut-over.

**Done when:** no user path reaches an old-style screen.

---

## Phase 3 — Finish the public site (~2–3 days, parallel with Phase 2)

### 3.1 Homepage (D1)
- [x] Serve the `/personal` page at `/`. Keep `/personal` as an alias or redirect it.
- [x] Remove the old landing components in `src/components/marketing/*` that nothing uses any more.
- [x] Update every internal link that points to `/personal`.

> **3.1 done 2026-11-23.** `/` serves the retail-bank page, and `/personal` 308-redirects to `/`. `src/components/marketing/*` and `shared/trust-badge.tsx` are deleted. The old landing page claimed "FDIC pass-through insurance up to $250,000", so the homepage swap also removed that claim from the most visible page.
>
> **For counsel (D6):** Terms §5 said balances "may be eligible for FDIC pass-through insurance". It now carries the site-wide USDC disclosure, marked `COUNSEL REVIEW` in `src/app/(public)/terms/page.tsx`. Please confirm the wording.

### 3.2 Apply brand assets (D2)
- [x] Icons style A on: Why Moneta, the security tiles, the help tiles, the product tiles.
- [x] Buttons style C site-wide: header Sign in, every CTA, the closing CTA band.
- [x] Use the shared components from 2.0 so site and app match.

> **3.2 done 2026-11-23.** `IconCard`, the homepage, `/security` and `/how-it-works` use the style A disc and brand glyphs. The header, hero, quick links, security band, closing CTA and report panel use the style C `Button`/`ButtonLink`.
>
> **Card on the site (2026-11-23):** the approved **Smoked forest** card (the middle of the team showcase) is now a component, `src/components/brand/moneta-card-art.tsx`. It renders front, back and the showcase pair from the board's own CSS and coin art, so it stays sharp at any size. It appears in three places on the homepage:
> - the hero, as the front-over-back pair;
> - the card-controls tile;
> - a new "The Moneta card" band (`#card-design`) showing front and back.
> It's labelled as a design preview, with a note that the card is virtual at launch.
> - [ ] Replace the "VISA" text stand-in with Visa's official artwork from the card program before launch.

### 3.3 Fill placeholders (D5)

| Where | Needs |
|---|---|
| `src/app/personal/page.tsx` (Help → Contact us) | Support email/phone + hours |
| `src/app/(marketing)/security/page.tsx` (Think you've been targeted? step 3) | Fraud contact |
| `src/components/bank-site/site-footer.tsx` (card issuer line) | Dakota's required card wording, when cards go live |
| `src/app/personal/page.tsx`, 2 `<PhotoPlaceholder>`s | Licensed photos: card-in-hand online shopping; person at home on phone |

- [ ] Find any stragglers with `grep -rn "<Ph\b\|PhotoPlaceholder" src/`.

### 3.4 Copy and legal review 🟥 (D6)
- [ ] Custody wording on `/security` and `/personal`:
  - "Not with us — with regulated partner banks"
  - "funds are held at established partner banks, not by us"
  - "backed by a real one at partner banks"
  - "redeemable 1:1"

  Today's build holds **USDC in Dakota wallets**. Rewrite accurately, e.g. "fully reserved by its issuer", and have counsel approve.
- [x] Confirm the FDIC correction (balances are **not** FDIC-insured) is consistent everywhere.
- [x] Remove "from the app" phrasing: there is no native app.
- [x] Verify every claim on `/security` is true in code, or remove it:
  - two-factor "required again before any money moves"
  - "new sign-in alerts"
  - "brute-force protection"
  - "256-bit encryption at rest"
  - "verified email before you can transact"

> **3.4 progress 2026-11-23.** I checked the claims against the code and rewrote the copy. The old custody wording is gone from the code: "with regulated partner banks", "held at established partner banks, not by us", "backed by a real one at partner banks", "redeemable 1:1" and "redeemable any time". It now says USDC is fully reserved by its issuer, held in a wallet for the account on Dakota's regulated infrastructure. This is marked `COUNSEL REVIEW` in `security/page.tsx` and **still needs counsel to approve it**.
>
> Other claims fixed:
> - **2FA:** "required again before any money moves" is now "no money can move until two-step sign-in is on" (the code only requires 2FA to be enabled).
> - **Card:** "set spending limits" and "report it lost or stolen" are removed. Neither exists yet.
> - **Fees:** "exact fee before you confirm" now says fees are itemised on the receipt. Restore the original promise once the 2.x quote step ships.
> - **Accounts:** "Account details in your name" is now "Your own deposit details". The account holder name comes from Dakota and may be Moneta's.
> - **Cross-border:** "money across the world" is removed. We don't offer international transfers.
> - **"From the app":** removed.
>
> **Verified email:** enforcement only looked at `RESEND_API_KEY`, so an SMTP-only setup skipped it. It now follows `isEmailDeliverable()` (Resend or SMTP), with tests.

### 3.5 Quality pass
- [x] Metadata and Open Graph images per page; favicon set; `sitemap.xml`, `robots.txt`.
  Done 2026-11-23:
  - **Social image:** `src/app/opengraph-image.png` and `twitter-image.png` (1200×630, with the card), rendered from `/design/og`.
  - **Icons:** Moneta `favicon.ico`, `icon.png` and `apple-icon.png`, rendered from `/design/app-icon`. They replace the stock Next.js favicon.
  - **Metadata:** `metadataBase` plus canonicals.
  - **Crawlers:** `robots.ts` keeps signed-in areas and the API out of search, and `/app` is `noindex`. `sitemap.ts` lists the public pages.
- [x] Lighthouse on `/`, `/security`, `/login`, `/register`, `/app` (2026-11-24): accessibility 100 everywhere, SEO 100 on public pages, best practices 96. Performance 83–88: follow-up on unused JS (see `PRE-DAKOTA-PLAN.md` E2). Fixed: static auth pages had every script blocked by the CSP.
- [ ] Real-phone check (iOS Safari, Android Chrome).

---

### Deploys (found 2026-11-23)
- [x] Vercel deploys had failed on every push since 2026-07-14 (8f46534). That commit added `vercel.json` crons running every 10 minutes (reconcile) and hourly (recurring transfers), and the Hobby plan only allows daily crons, so it rejects the whole deployment. All three crons are now daily.
- [ ] Before real users: move to Vercel Pro and restore `*/10 * * * *` for `/api/dakota/reconcile` and `0 * * * *` for `/api/transfers/recurring/run`. Alternatively, call them from an external scheduler with `CRON_SECRET`.

---

## Phase 4 — Security hardening (parallel; all before real users) 🟥

### 4.1 Org isolation: finish the RLS enforce step (`ORG-FOUNDATION-SPEC.md`)
> **Code done 2026-11-24** (`PRE-DAKOTA-PLAN.md` C1): migration 0021, `withOrg` everywhere, `systemDb` allowlist, CI guard (`scripts/check-db-access.mjs`) and RLS integration tests run as `moneta_app`. Remaining: the deploy steps.
- [x] Route every org-scoped query through `withOrg(orgId, fn)` (sets `app.current_org_id` in a transaction). **Status 2026-11-24:** `apiHandler` runs `orgScoped` routes inside `withOrg`, and 27 of the 28 use `ctx.db`. But the database has **no RLS policies yet**, so the GUC isn't enforced and a missed `org_id` filter would still leak. Remaining: the one org-scoped route on the global `db`, plus the 31 non-scoped routes that touch class-A tables.
- [x] Add a CI check that fails on raw `db.select/insert/update/delete` against class-A tables outside `withOrg`.
- [x] Migration `0021_org_enforce` (0020 is taken by legal acceptance and support):
  - `NOT NULL org_id`
  - composite FKs (`UNIQUE(org_id,id)`)
  - `ENABLE` + `FORCE ROW LEVEL SECURITY`, with policies on the 11 class-A tables
- [ ] Connect the app as a **non-owner, non-BYPASSRLS** database role. Code and `scripts/sql/db-roles.sql` are ready; the deploy steps are in `PRE-DAKOTA-PLAN.md` C1.
- [x] Tests: cross-org read and write attempts return nothing or fail. Run the spec's invariants.

### 4.2 Secrets and keys
- [ ] Move `DAKOTA_SIGNER_PRIVATE_KEY` (authorizes wallet sends) from env into a secrets manager / KMS. The `SecretsProvider` pattern already exists.
- [ ] Rotation calendar (90 days) for API keys and the webhook key; document it in `DR-RUNBOOK.md`.
- [ ] Confirm `.env*` is gitignored and never committed (`git log --all -- .env.local`).

### 4.3 Authentication review
> **Reviewed 2026-11-24** (`PRE-DAKOTA-PLAN.md` C3): rate limits on every auth endpoint plus a new per-IP login tier; shared limits via Upstash (C2); 2FA turn-off now revokes all sessions. Open: session length (your decision) and separating keys from `AUTH_SECRET`.
- [ ] After the 1.2 upgrade, review `src/lib/auth/config.ts` against the next-auth advisory: protected checks must **fail closed** on auth errors, never only test "session object exists".
- [ ] Session lifetime and idle timeout appropriate for banking; logout everywhere on password change.
- [ ] Rate limits on every auth endpoint; lockout/backoff on repeated failures.
- [x] **Fixed 2026-11-23:** API rate limits were keyed on IP alone, so every limited endpoint
      shared one counter and a few normal requests exhausted forgot-password's 5/15m budget.
      Now keyed per IP + route via `rateLimitKey()` (ids collapse to `:id`).
- [ ] **Rate-limit store is in-memory per server instance** (`src/lib/rate-limit.ts`). On Vercel,
      the login brute-force guard and API limits reset per instance, so they are much weaker
      than they look. Add a shared store (Upstash Redis via `REDIS_URL`) before real users.
- [ ] Decide on passkeys (WebAuthn) as the phishing-resistant option (BACKLOG).

### 4.4 Deep security research (the request paused earlier)
- [ ] Run the multi-track research:
  - bank-grade controls
  - infra/secrets
  - compliance frameworks
  - AI-generated-code pitfalls
  - Next.js/React CVEs
  - a code audit of this repo

  Fold its findings into this phase as new items.

### 4.5 Monitoring and incident response
> **2026-11-24** (`PRE-DAKOTA-PLAN.md` C4): Sentry scrubbing on server and browser, including the Cards.js `session` param, and a daily stuck-transaction alert. Live once the Sentry DSNs are set. Incident response plan drafted in `compliance/F7-incident-response-plan.md`.
- [ ] Sentry: DSN per environment, PII scrubbing, and **redact the Cards.js `session` query parameter**.
- [ ] Alerts: webhook processing failures, stuck non-terminal transactions, reconcile drift.
- [ ] Walk through `DR-RUNBOOK.md` once end to end.

### 4.6 Ongoing hygiene
- [x] Dependabot or Renovate; `npm audit --omit=dev` in CI (fail on high/critical). Already in place: `.github/dependabot.yml`; `ci.yml` runs gitleaks and `npm audit --omit=dev --audit-level=high` (checked 2026-11-24).
- [ ] Review every new dependency: no unknown or very new packages, guarding against AI-suggested "slopsquatting" names.
- [ ] External pentest before public launch; bug bounty after.

---

## Phase 5 — Dakota go-live path ⛔ (starts when the sandbox key arrives)

### 5.1 Get access (via our Dakota contact on Telegram)
Ask for:
1. Sandbox dashboard and API key.
2. Cards activation.
3. Can cards spend **USDC on Base** (default is RD)?
4. May our **platform signer** sign wallet card-enablement, and how should per-wallet policies be set up?
5. Physical card timeline (sidetabled, but ask).

Licensing questions (from §1b; the full list of 12 is at the end of `reports/Moneta licensing and permits.md`):

6. Do you run a **consumer** programme? Your public Terms and the Lead Bank Funds Transfer Agreement say no personal or household use. What are the consumer terms?
7. Can we be your **agent or authorised delegate**, and what contract covers it? With our server holding the only signing key, the research says we'd likely be a money transmitter ourselves.
8. Your **licence footprint**: which states can our users live in for USDC (your licences page lists 20, "or otherwise authorized")? Do you enforce that at KYC, or must we? Do you hold a NY BitLicense, a California DFAL licence, or a Louisiana crypto licence?
9. Who is the **1099-DA broker** for USDC redemptions: you or us?
10. Who issues **RD**? Will it be a permitted issuer by 2027-01-18, and how are rewards funded?
11. Would you onboard an **offshore** licensed entity as a platform, and from which countries?
12. **Wallet model:** do platform end users get pure self-custody wallets or your three-shard Dakota-Supported Wallet? Can a wallet be hosted by you, so you are the custodian, and may a platform be the only signer?

- [ ] The key goes into `.env.local` by you, never in chat.

### 5.2 Sandbox proof (ROADMAP M2)
- [ ] Apply migrations through `0019`.
- [ ] Bootstrap: `npm run dakota:bootstrap` (twice, per ROADMAP).
- [ ] Restore the real webhook key; turn demo mode and the KYC bypass off.
- [ ] Set up a webhook tunnel (or reconcile).
- [ ] Run the money drill:
  - sign up
  - KYC
  - provisioning
  - simulated ACH deposit, credited once
  - link a bank
  - withdraw
  - return, with the clawback applied once
- [ ] Cards:
  - fix `.npmrc` (map `@dakota-xyz` to registry.npmjs.org, or remove the scope line)
  - install `@dakota-xyz/cards-js` pinned
  - local HTTPS (`next dev --experimental-https`)
  - `ISSUING_PROVIDER=dakota`
  - run the cards drill in `ROADMAP.md`
- [ ] Fix whatever the real API disagrees with. Expect a handful of issues, as the docs audit already found 6.

### 5.3 Card follow-ups (after the Dakota answers)
- [ ] Per-wallet policy and wallet card-enablement signing flow (`DAKOTA-CARDS-SPEC.md` §2.3).
- [ ] Cards terms-acceptance UI (fresh hosted link at render).
- [ ] `card_transaction.*` ledger posting (holds, clears, refunds) per spec §4, with drill invariants.
- [ ] Card disputes: when a Help & support request is a `card_dispute`, report it with `POST /card_dispute_reports` (card id, card transaction id, our `SUP-` reference as `client_reference`), then set `forwarded_to = 'dakota'`, `forwarded_at` and `external_reference`.

### 5.4 Production readiness (ROADMAP M3)
- [ ] Production keys and network, hosted Postgres decision, domain, monitoring, and a low-value real-money test.

---

## Suggested sequencing

| When | Work |
|---|---|
| **Day 1** | 1.1 commit/push → 1.2 dependency upgrades → 1.3 route protection → 1.4 proxy rename. Send the Dakota ask list (5.1) |
| **Days 2–3** | Decisions D1–D7. 2.0 shared components. 3.1 homepage. 3.2 brand assets |
| **Week 2** | P0 screens 2.1–2.5, 2.12 → then 1.5 (sign-in to `/app`). 3.3/3.4 as answers arrive |
| **Week 3** | P1 screens 2.6–2.8, 2.10 → 2.14 cut-over. 4.1 RLS enforce starts. 4.4 research runs in the background |
| **When the Dakota key lands** | Phase 5.2 immediately; it takes priority over UI work |
| **Before first external user** | 3.4 legal review done, 4.1–4.3 done, 5.2 drill passed, pentest booked |

## Definition of done: "ready for the first external user"
- [ ] 0 critical/high production vulnerabilities; protected-by-default routing; RLS enforced; signer key in a secrets manager
- [ ] Every user path in the new app; no old screens; works on phone and desktop
- [ ] Public site has no placeholders, and counsel has approved the disclosures and custody wording
- [ ] Counsel's written view on our regulatory status (MSB or not, state licences, NY/CA) and Dakota's written confirmation of a consumer programme (§1b)
- [ ] Sandbox drill (money + cards) passed; production readiness checklist (M3) complete
- [ ] Monitoring and alerts live; runbook walked through once

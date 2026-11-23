# Launch Readiness Plan

> Written 2026-11-23. This is the execution plan for getting from "everything
> built on mocks" to "ready for the first external users". `ROADMAP.md` stays
> the milestone view (M1–M5); this file is the detailed, tick-as-you-go work
> list. Unused ideas still go to `BACKLOG.md`.
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
- [ ] `src/components/ui/icon.tsx`: the approved icon set (style A contour disc + bare glyphs), ported from the design board's 16 glyphs, using the 24px grid and signal-dot spec.
- [ ] `Button` variants per style C (rounded-rect 12px radius): primary forest, secondary outline, text-link with arrow, icon button, destructive. Sizes 40/48/56; focus ring; loading state.
- [ ] App patterns:
  - amount input (tabular figures, currency, max button)
  - account/recipient picker sheet
  - review-and-confirm sheet showing the **exact fee before confirming**
  - success state
  - empty / loading / error states
  - toast usage
- [ ] Notification bell → real dropdown (the `/app` bell is currently decorative).

**Done when:** a sample screen built only from these components passes visual review on phone and desktop.

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
- [ ] Serve the `/personal` page at `/`. Keep `/personal` as an alias or redirect it.
- [ ] Remove the old landing components in `src/components/marketing/*` that nothing uses any more.
- [ ] Update every internal link that points to `/personal`.

### 3.2 Apply brand assets (D2)
- [ ] Icons style A on: Why Moneta, the security tiles, the help tiles, the product tiles.
- [ ] Buttons style C site-wide: header Sign in, every CTA, the closing CTA band.
- [ ] Use the shared components from 2.0 so site and app match.

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
- [ ] Confirm the FDIC correction (balances are **not** FDIC-insured) is consistent everywhere.
- [ ] Remove "from the app" phrasing: there is no native app.
- [ ] Verify every claim on `/security` is true in code, or remove it:
  - two-factor "required again before any money moves"
  - "new sign-in alerts"
  - "brute-force protection"
  - "256-bit encryption at rest"
  - "verified email before you can transact"

### 3.5 Quality pass
- [ ] Metadata and Open Graph images per page; favicon set; `sitemap.xml`, `robots.txt`.
- [ ] Lighthouse (performance / accessibility / SEO ≥ 90) on `/`, `/security`, `/login`.
- [ ] Real-phone check (iOS Safari, Android Chrome).

---

## Phase 4 — Security hardening (parallel; all before real users) 🟥

### 4.1 Org isolation: finish the RLS enforce step (`ORG-FOUNDATION-SPEC.md`)
- [ ] Route every org-scoped query through `withOrg(orgId, fn)` (sets `app.current_org_id` in a transaction). 0 of 58 routes use it today. Start with the money routes.
- [ ] Add a CI check that fails on raw `db.select/insert/update/delete` against class-A tables outside `withOrg`.
- [ ] Migration `0020_org_enforce`:
  - `NOT NULL org_id`
  - composite FKs (`UNIQUE(org_id,id)`)
  - `ENABLE` + `FORCE ROW LEVEL SECURITY`, with policies on the 11 class-A tables
- [ ] Connect the app as a **non-owner, non-BYPASSRLS** database role.
- [ ] Tests: cross-org read and write attempts return nothing or fail. Run the spec's invariants.

### 4.2 Secrets and keys
- [ ] Move `DAKOTA_SIGNER_PRIVATE_KEY` (authorizes wallet sends) from env into a secrets manager / KMS. The `SecretsProvider` pattern already exists.
- [ ] Rotation calendar (90 days) for API keys and the webhook key; document it in `DR-RUNBOOK.md`.
- [ ] Confirm `.env*` is gitignored and never committed (`git log --all -- .env.local`).

### 4.3 Authentication review
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
- [ ] Sentry: DSN per environment, PII scrubbing, and **redact the Cards.js `session` query parameter**.
- [ ] Alerts: webhook processing failures, stuck non-terminal transactions, reconcile drift.
- [ ] Walk through `DR-RUNBOOK.md` once end to end.

### 4.6 Ongoing hygiene
- [ ] Dependabot or Renovate; `npm audit --omit=dev` in CI (fail on high/critical).
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
- [ ] Sandbox drill (money + cards) passed; production readiness checklist (M3) complete
- [ ] Monitoring and alerts live; runbook walked through once

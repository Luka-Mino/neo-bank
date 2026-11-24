# Pre-Dakota Plan: everything we can do before Dakota answers

> Written 2026-11-24. This plan covers the work that does **not** depend on
> Dakota's answers. `LAUNCH-READINESS-PLAN.md` stays the master list; this
> file pulls out what we can do now, in order, with exact steps.
>
> Background: `reports/Moneta licensing and permits.md` (licensing research)
> and `LAUNCH-READINESS-PLAN.md` §1b and Phase 1c.

## How to use this

- Work top to bottom. Section 1 is the order of work. Sections 2–7 hold the steps.
- **Who does it:** 👤 you · 🤖 Claude · ⚖️ a lawyer.
- Every item has a **Done when**. Tick it here and in `LAUNCH-READINESS-PLAN.md`.
- Section 8 lists what we **don't** build yet, and which Dakota answer unblocks each.

---

## 1. Order of work

| When | 👤 You | 🤖 Claude |
|---|---|---|
| **Today** | A1 send the Dakota message · A3 make the quick decisions · B6 open the tool accounts | F1 draft the Dakota application text · C5 secrets check |
| **This week** | A2 find a lawyer · B1–B3 form the company, EIN, bank account · B5 gather KYB documents | C1 keep customers' data apart in the database · C2 shared rate limits · C3 sign-in review · C4 error tracking and alerts |
| **Next week** | E1 supply the placeholder facts · E3 test on your phone · C6 run the restore drill with Claude | D1 old-dashboard switch-over (if you say yes) · D2 Insights · F2–F9 policy drafts · E2 quality pass · D4 staging migrations |
| **When Dakota answers** | Forward the answers | Section 8, starting with the custody redesign |

Nothing here waits on Dakota. If Dakota answers early, Section 8 jumps the queue.

---

## 2. Get the answers moving (👤 you)

### A1 Send the Dakota message (today, 10 minutes)

Send this to your Dakota contact on Telegram. Edit freely. Questions 1–3 decide the biggest build item.

> Hi Chris, thanks again for the platform overview. We're building Moneta on
> Dakota (USDC on Base, ACH in and out, cards) and want the structure right
> before we apply. A few questions:
>
> 1. **Consumer use.** Your Terms and the Lead Bank Funds Transfer Agreement
>    say commercial use only. Do you run a consumer programme, with consumer
>    terms and Reg E handling? Which bank sponsors it?
> 2. **Wallet custody.** For a platform's end users, can Dakota host the wallet
>    (e.g. the Dakota-Supported Wallet in your Terms) so Dakota is the
>    custodian? Or must the key sit with the platform or the end user? Can a
>    platform be the only signer?
> 3. **Our role.** Do you appoint platforms as agents or authorised delegates?
>    What does the platform agreement say about the platform's regulatory
>    status?
> 4. **States.** Which US states can end users live in for USDC? Do you enforce
>    that at KYC, or should we? Any New York or California coverage?
> 5. **Sandbox.** Can you switch on sandbox access and Cards for us?
> 6. **Cards.** Debit or prepaid? Which issuing bank? Can cards spend USDC on
>    Base?
> 7. **RD.** Which entity issues it, will it be a permitted issuer by
>    18 Jan 2027, and how are rewards funded?
> 8. **Tax.** Who files 1099-DA for USDC redemptions: you or the platform?
> 9. **Diligence.** What do you need from us beyond the KYB form? Can we see the
>    platform agreement and your SOC 2 report under NDA?
>
> Happy to do a call if that's easier.

**Done when:** sent. Write the date here: `____`. When answers arrive, paste them into `LAUNCH-READINESS-PLAN.md` §5.1.

### A2 Find a fintech lawyer (this week)

- **Look for** US money-transmission and stablecoin experience. Good signs: they've done state licensing (NMLS) or written regulatory-status memos for fintechs built on a licensed partner.
- **Ask for** a fixed-fee written memo on Moneta's regulatory status.
- **Send them:**
  - `reports/Moneta licensing and permits.md`;
  - its "Questions for counsel" list (10 questions at the end);
  - the correction note at the top: there are no user-to-user book transfers, and the open issue is the signing key.
- **Also ask them to review:** the custody wording on `/security`, "Checking"/"Savings" naming, the Terms and Privacy drafts, and the "unregulated justification" Dakota's form asks for (F1).

**Done when:** a lawyer is engaged and the memo is scoped, with a date.

### A3 Quick decisions (today)

| # | Decision | Options | Unblocks |
|---|---|---|---|
| D9 | First customers | US consumers · US businesses · non-US (which region) | Onboarding (Section 8), Dakota form answers |
| D10 | Offshore entity? | Not now · later for non-US customers | Company structure (B1) |
| D12 | Where are you and the team based? | US · Canada · elsewhere | Canada registrations; company structure |
| D13 | Switch over to the new app and delete the old dashboard? | Yes now · after one more side-by-side look | D1 |
| D14 | Support inbox address | e.g. support@ your domain | `SUPPORT_EMAIL` in Vercel |
| D15 | Vercel Pro (about $20/month per member)? | Yes before launch · later | Frequent crons for reconcile and recurring transfers |

**Done when:** each row has an answer, copied into `LAUNCH-READINESS-PLAN.md` §1b.

---

## 3. Company setup (👤 you, ⚖️ with the lawyer)

### B1 Form the company
- A Delaware C-corp is the usual choice. The lawyer should confirm it against D10 and D12, since a Canadian team or an offshore parent changes the structure.
- **Output:** certificate of incorporation, bylaws, board consent, cap table, and stock purchase agreements for founders.
- **Done when:** you hold the stamped certificate.

### B2 EIN
- Apply on irs.gov (free, same day online for a US responsible party).
- **Done when:** you have the EIN confirmation letter (CP 575). Dakota asks for it.

### B3 Business bank account
- Opened in the company's name. Dakota asks for source-of-funds proof, and a bank statement works.
- **Done when:** the account is open and funded.

### B4 Trademark check for "Moneta"
- Search USPTO classes 36 (financial services) and 9 (software).
- Known conflict risk: other financial brands already use the name, e.g. MONETA Money Bank in the Czech Republic.
- **Done when:** the lawyer or a search firm gives a clearance opinion, or you pick a fallback name.

### B5 Gather the Dakota KYB pack
This is Dakota's published list for a platform's own onboarding.

**Company details**
- [ ] Legal name, country and date of incorporation, legal structure, registration number, EIN
- [ ] Registered address and operating address (no PO boxes)
- [ ] Industry (NAICS code) and website
- [ ] Average monthly revenue, expected monthly deposits and volume
- [ ] Source(s) of funds

**People**
For the applicant, a control person (a senior officer who signs the attestations) and every 25%+ owner:
- [ ] Full name, date of birth, nationality, home address, SSN, job title, ownership %
- [ ] Government ID
- [ ] Proof of address dated within the last 90 days

**Documents**
- [ ] Formation document (certificate of incorporation)
- [ ] Governance document (bylaws or operating agreement)
- [ ] Business proof of address
- [ ] Source-of-funds proof: bank statement, or SAFE, subscription agreement, convertible note or loan agreement

**Written answers (Claude drafts these in F1)**
- [ ] Business description (200–1,024 characters)
- [ ] Account-usage description (400–1,024 characters)
- [ ] Top 5 customer countries
- [ ] "Regulated?" yes/no. If no, an "unregulated justification" (200–1,024 characters), **written with the lawyer**
- [ ] Whether we verify identity, monitor transactions and monitor on-chain activity (Dakota does all three; say how we rely on it)

**Done when:** every box is ticked and the files sit in one private folder, not in this repo.

### B6 Open the tool accounts (today, 20 minutes)
- [ ] **Support inbox** (D14). Then add `SUPPORT_EMAIL` in Vercel (Production and Preview).
- [ ] **Upstash Redis** (free tier). Create a database, then add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel. Needed for C2.
- [ ] **Sentry** project. Add `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in Vercel. Needed for C4.
- Put keys into Vercel or `.env.local` yourself. Never paste them in chat.

---

## 4. Security build (🤖 Claude): must be done before real users

### C1 Keep each customer's data apart in the database (2–3 days) ✅ code done 2026-11-24

> **Done:** migration `0021_org_enforce` adds row-level security on the 11
> tables, `org_id NOT NULL`, the missing FKs to `organizations`, composite FKs
> (a child must be in its parent's org) and per-org uniqueness. Two connections:
> `db` (restricted `moneta_app`, used inside `withOrg`) and `systemDb` (bypass
> role, only for the files allowlisted in `scripts/check-db-access.mjs`).
> Request paths that queried without an org (send/withdraw, wallet balances,
> the session KYC lookup, support, status history, the recurring cron) now run
> inside `withOrg`. Bugs found on the way: the wallet-balance cache never set
> `org_id`, and the ledger-drift check would have reported "clean" under RLS.
> Tests: 7 new RLS integration tests, all integration tests run as `moneta_app`
> in CI, and a unit-tested CI guard. `/api/health` reports `databaseRoles`.
>
> **👤 Deploy steps (staging, then production), in this order:**
> 1. In Supabase's SQL editor, run `scripts/sql/db-roles.sql` once, after
>    replacing both passwords with long random values from a password manager.
>    The last query should show `moneta_app f f` and `moneta_system f t`. If
>    creating the BYPASSRLS role is refused, see the note at the top of the file.
> 2. In Vercel (Production and Preview), set `DATABASE_URL` to the
>    `moneta_app` pooler URL (user `moneta_app.<project-ref>`) and add
>    `SYSTEM_DATABASE_URL` with the `moneta_system` URL. Keep the owner URL in
>    the password manager for migrations only. Redeploy.
> 3. Apply migrations through 0021 with the **owner** URL:
>    `DATABASE_URL=<owner url> npx drizzle-kit migrate`. 0021 stops with a clear
>    message if any data breaks the new rules.
> 4. Open `/api/health`. Production should show `"databaseRoles": "ok"`.
> 5. Sign in, open accounts and activity, and send a small internal transfer to
>    confirm normal use still works.
>
> Follow-ups: card lookups (`src/lib/card-issuer.ts`) still use `systemDb`
> per user until plan 5.3. `dakota_customers.user_id` stays unique until
> business onboarding (1c.8).

**Why:** the app already passes the right customer (org) context, but the database doesn't enforce it. One missed filter would show one customer's data to another. Row-level security makes the database return nothing unless the request belongs to that customer. Spec: `ORG-FOUNDATION-SPEC.md`.

Steps:
1. **Inventory.** List every query on the 11 protected tables that doesn't go through `withOrg`:
   - the protected tables: `dakota_customers, wallets, dakota_rails, accounts, cards, transactions, recipients, recurring_transfers, destinations, wallet_balances, transaction_status_history`;
   - the one org-scoped route that uses the global `db`;
   - the webhook handlers, the reconcile job and the recurring-transfer cron, which must look up the org for each row and then run inside `withOrg`.
2. **Move each one** onto `withOrg` or `ctx.db`.
3. **Migration `0021_org_enforce`:**
   - a pre-flight check that fails if any `org_id` is NULL;
   - `org_id NOT NULL` on all 11 tables;
   - `UNIQUE(org_id, id)` on parents and composite foreign keys on children, so no row can point at another org's row;
   - the constraint swaps in the spec;
   - `ENABLE` and `FORCE ROW LEVEL SECURITY`, with the policy `org_id = current_setting('app.current_org_id', true)::uuid`.
4. **A restricted database user.** Create `moneta_app`, with no ownership and no bypass. The app connects as it. Migrations keep the owner user through a separate `MIGRATION_DATABASE_URL`. I'll write the exact SQL for you to run in Supabase.
5. **Tests**, added to the CI integration job:
   - a query with no org set returns zero rows;
   - reading or writing another org's rows fails;
   - the spec's checklist items 1–15.
6. **CI guard:** a script that fails the build on raw `db.select/insert/update/delete` against those 11 tables outside the allowed helpers.

**Done when:** integration tests, run as `moneta_app`, prove cross-customer reads return nothing and cross-customer writes fail. The guard runs in CI.

### C2 Rate limits shared across servers (half a day, needs B6 Upstash) ✅ code done 2026-11-24

> **Done:** `src/lib/rate-limit.ts` counts in Upstash over its REST API (`/pipeline`, `INCR` + `PEXPIRE`, no new package). Without Upstash, or if it errors or takes over 1.5 s, it falls back to memory and raises a `rate_limit_degraded` ops alert (at most every 5 minutes; in production also when the keys are missing). 4 tests in `src/lib/rate-limit.test.ts`. **👤 To switch on:** add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel (B6) and redeploy.

**Why:** limits live in each server's memory (`src/lib/rate-limit.ts`). Vercel runs many servers, so limits on login, 2FA and password reset are weak.

Steps:
1. Implement the Upstash path that is marked `TODO` in `rateLimit()`. Use a fixed window via Upstash REST (`INCR` + `EXPIRE`). Check any package before adding it.
2. In production with Upstash missing or down: allow the request and raise an ops alert, so an outage doesn't lock everyone out.
3. Keep the in-memory version for local dev only.
4. Unit tests with a mocked REST client: two "instances" share one count, and the window resets.

**Done when:** tests pass, and staging shows counts in Upstash after a few logins.

### C3 Sign-in review (half a day to 1 day) ✅ reviewed 2026-11-24 (one decision left for you)

> **Findings and fixes:**
> - **Rate limits:** every auth endpoint has one (register 5/15m, forgot and reset password 5/15m, magic link 5/15m, verify email 10/15m, 2FA setup 5/15m, verify 10/15m, disable 10/15m, backup codes 5/15m, email codes 5/1h, invitations 10/15m, password change 5/1h). Login has per-email tiers (15/15m and 40/6h); **added** a per-IP tier (100/15m) against password spraying across accounts. All of these are shared across servers once C2's Upstash keys are set.
> - **2FA guessing:** login 2FA codes fall under the login tiers; email codes are single-use, expire, and are capped per code (`src/lib/auth/email-otp.ts`).
> - **Fail closed:** a failed user lookup denies sign-in; the org/permission claim is dropped on any error (`src/lib/auth/config.ts` jwt callback). The session-revocation check keeps an existing token only while the database is unreachable, and then every org-scoped route denies anyway. Acceptable; noted.
> - **Sign out everywhere:** password change and reset already revoked all sessions. **Gap fixed:** turning off the authenticator app or email codes didn't, though `src/lib/auth/sessions.ts` said it should. Now both revoke, and the settings screen signs out with a message in all three cases instead of leaving a dead session.
> - **Found by the compliance review, fixed:** (1) magic-link sign-in skipped the email-code second factor, so for those accounts the inbox alone gave a session that could move money, and it skipped the deleted-account check. Email-code accounts must now sign in with password + code, and deleted accounts are refused. (2) Executing an approved payment and creating a recurring transfer didn't require verified email + 2FA like other money moves; now they do.
> - **Still open:** separate keys from `AUTH_SECRET` (below), and your session-length decision.

Each item gets evidence (code reference or test) written into `LAUNCH-READINESS-PLAN.md` §4.3.
- [ ] **Session length (👤 your decision).** Today it's 7 days. Proposal: 12 hours maximum plus 30 minutes idle for money screens. Finance apps usually go short.
- [x] **Password change** signs out every session (`revokeSessions`); so do 2FA turn-off (fixed) and password reset.
- [x] **Fail closed.** See findings above.
- [x] **Every auth endpoint is rate-limited.** Listed above; per-IP login tier added.
- [x] **Lockout and backoff** on repeated failures. Per-email (two tiers) and per-IP at login; email codes capped per code.
- [ ] **Separate keys from `AUTH_SECRET`.** Today it also roots the 2FA and phone-number encryption, the backup-code pepper, invite and approval HMACs and device fingerprints (found in C5 and the compliance review). Add dedicated, versioned keys (e.g. `FIELD_ENCRYPTION_KEYS` with key IDs) so each can rotate without locking users out.

**Done when:** every box is ticked with evidence.

### C4 Error tracking and alerts (half a day; live once B6 Sentry exists) ✅ code done 2026-11-24

> **Done:** `src/lib/sentry-scrub.ts` runs in `beforeSend`, `beforeSendTransaction` and `beforeBreadcrumb` on server and browser. It redacts secret query values (magic-link, reset, verify and invite tokens, the Cards.js `session`, codes, keys) in URLs and inside messages; secret headers; cookies and request bodies; emails; bearer tokens; long digit runs; and user details except the id. 8 tests. **New alert:** a daily stuck-transaction sweep (`findStuckTransactions` in `src/lib/dakota/reconcile.ts`, run by the maintenance cron) raises `transaction_stuck` for anything non-final for over 24 h; ACH return windows are excluded. Integration-tested. Already in place: `webhook_dead_letter`, `reconcile_failed`, `ledger_drift`. **👤 To switch on:** add `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in Vercel (B6). Alerts go to the logs and Sentry; a Slack/email channel can plug into `src/lib/alerts.ts` later.

Sentry is installed (`src/instrumentation*.ts`) with `sendDefaultPii: false`, but there's no scrubbing.
1. Add `beforeSend` and `beforeBreadcrumb` scrubbing for:
   - the Cards.js `session` URL parameter;
   - tokens in URLs (magic link, reset, verify, invitation);
   - email addresses;
   - Authorization headers.
2. Add alerts through `alertOps`:
   - a Dakota webhook fails processing;
   - a transaction is stuck in a non-final state for more than 24 hours;
   - the reconcile job finds a mismatch.
3. Test that a fake error containing a token arrives scrubbed.

**Done when:** tests pass, and on staging a test error appears in Sentry with no token or email in it.

### C5 Secrets check (1 hour) ✅ done 2026-11-24

> No `.env*` file was ever committed. The 90-day rotation table is in `DR-RUNBOOK.md` → "Secret rotation". It found that `AUTH_SECRET` also encrypts 2FA secrets and signs invites and approvals, so it must never be rotated blindly; the runbook has the safe procedure. Follow-up: separate, versioned keys for 2FA encryption and HMACs (added to C3).

- [ ] Confirm `.env.local` has never been committed: `git log --all -- .env.local` must be empty.
- [ ] Add a 90-day key-rotation calendar to `DR-RUNBOOK.md`: Dakota API key, webhook key, `AUTH_SECRET`, Resend, Upstash.
- Skip for now: moving the signer key into a key vault. The custody answer may remove the key (Section 8).

**Done when:** both boxes are ticked.

### C6 Restore drill (1–2 hours, 👤 you with 🤖 Claude)
Walk `DR-RUNBOOK.md` once:
1. Take a `pg_dump` of staging.
2. Restore it into a scratch database.
3. Point a local app at it.
4. Run the health and reconcile checks.
5. Write down anything in the runbook that was wrong.

**Done when:** the restore works and the runbook is corrected.

---

## 5. Finish the app (🤖 Claude)

### D1 Switch over to the new app (1 day, needs D13 = yes)
1. Redirect `/dashboard` and each old route to its `/app` page.
2. Delete `src/app/(dashboard)` and the old sidebar and header components.
3. Update route protection in `src/proxy.ts`.
4. Grep for stale claims afterwards. The old dashboard hid the "$250K protected" line.

**Done when:** no old screen is reachable, every old URL lands on its new page, and tests and build pass.

### D2 Move Insights to the new design (1 day)
Move it to `/app/insights` with the same API and categories, and link it from More.
**Done when:** it works at 390px and 1440px, in demo and real mode.

### D3 Restyle the link-bank dialog (2 hours)
Change `LinkBankDialog` (still shadcn) to an `AppSheet`.
**Done when:** it matches the other `/app` sheets.

### D4 Bring the staging database up to date (15 minutes)
Apply migrations `0019` and `0020` to the staging/production database with `drizzle-kit migrate`. You'll need to provide the URL, or run it yourself.
**Done when:** `drizzle.__drizzle_migrations` shows 21 rows.

Not now (they need Dakota's sandbox): deleting recipients (it calls Dakota) and the exact-fee quote step.

---

## 6. Public site

### E1 Fill the placeholders (👤 you supply facts, 🤖 Claude puts them in)
There are about 15 amber `<Ph>` placeholders: Terms 9, Privacy 2, homepage 2, Security 1, footer 1. You need to supply:
- [ ] Legal entity name and registered address (after B1)
- [ ] Governing law and venue for the Terms (the lawyer picks)
- [ ] Support email (D14), hours, and a fraud contact
- [ ] Licensed photos for the 2 homepage photo slots
- Waits for Dakota: the card issuer disclosure and the cardholder agreement link.

**Done when:** `grep -rn "<Ph\b\|PhotoPlaceholder" src/` finds only the Dakota-dependent ones.

### E2 Quality pass (🤖, 1 day)
Run Lighthouse on `/`, `/security`, `/login`, `/register` and `/app` (performance, accessibility and SEO ≥ 90). Fix contrast, labels, focus order and image sizes.
**Done when:** every score is ≥ 90, recorded in `LAUNCH-READINESS-PLAN.md` §3.5.

### E3 Real-phone check (👤, 30 minutes)
Use iOS Safari and Android Chrome on staging. Try sign-up, the More menu, Help & support and a transaction page. Note anything odd.

### E4 Lawyer review of copy (⚖️)
Custody wording (`COUNSEL REVIEW` markers), "Checking"/"Savings", Terms, Privacy, and the not-FDIC-insured disclosures.

---

## 7. Compliance pack (🤖 drafts, ⚖️ reviews)

These go in a new `compliance/` folder. They are **drafts for the lawyer**, written for a platform that relies on Dakota's compliance programme, not for a licensed money transmitter. They are needed either way: Dakota's enhanced due diligence and partner banks ask for them, and the GLBA Safeguards Rule requires the security programme. Each draft states which parts Dakota covers and which are ours.

| # | Document | What it covers | Effort |
|---|---|---|---|
| F1 ✅ | **Dakota application text** (`compliance/F1-dakota-application-text.md`, drafted 2026-11-24) | Business description, account-usage description, account purposes, source-of-funds wording; a placeholder for the lawyer's "unregulated justification" | 1 hour |
| F2 ✅ | **Written information security programme** (GLBA Safeguards Rule, 16 CFR 314) | Qualified Individual, risk assessment, access control, encryption, MFA, secure development, logging and monitoring, yearly pen test and twice-yearly scans, training, vendor oversight, incident response, yearly report to the board. Mapped to what the code already does | 1 day |
| F3 ✅ | **Complaints policy** | Intake (the Help & support form), categories, response times, escalation, forwarding card disputes to Dakota, record-keeping, monthly review. Flags the Reg E dispute timelines for the lawyer | half a day |
| F4 ✅ | **Anti-money-laundering and sanctions policy** | Platform-level controls beside Dakota's programme: a named compliance contact, red flags staff report to Dakota, sanctioned-country blocking, training, record retention. Built with the AML skill | 1 day |
| F5 ✅ | **Key-management policy** | Signer key life cycle: creation, storage, access, rotation, loss. Revised after the custody answer | 2 hours |
| F6 ✅ | **Wind-down plan** | If Moneta stops: customer notice, how people withdraw (USDC sits in wallets at Dakota), data export, timeline | half a day |
| F7 ✅ | **Incident response plan** | Built from `DR-RUNBOOK.md`, plus breach notices: FTC within 30 days for 500+ people, and state laws (California and New York 30 days) | half a day |
| F8 ✅ | **Vendor list and checks** | Dakota, Vercel, Supabase, Resend, Sentry, Upstash: what data each holds, SOC 2 status, contract owner | 2 hours |
| F9 ✅ | **Marketing review checklist** | Banned claims ("bank", "banking", "FDIC-insured", "backed 1:1", "guaranteed", "legal tender", "payment stablecoin"), required disclosures, and who signs off | 1 hour |

**Done when:** each draft is in `compliance/`, marked `DRAFT – for counsel`, and listed in a `compliance/README.md` with its review status. ✅ Drafted 2026-11-24; `compliance/README.md` has 22 questions for counsel. Next: the lawyer's review (A2).

---

## 8. Don't build yet: waiting on Dakota

Q numbers refer to the message in A1.

| Item | Waits for | Why not now |
|---|---|---|
| Custody redesign: Dakota-hosted wallet, or user passkeys that must sign | Dakota Q2, Q3 | If Dakota hosts the wallet, passkey signing isn't needed at all |
| Team approvals enforced by Dakota | Dakota Q2 | Only applies if users hold the keys |
| Blocking states at sign-up | Dakota Q4 | Dakota may already enforce it at KYC |
| Consumer vs business onboarding | Dakota Q1 + D9 | Dakota's public terms are business-only |
| Signer key into a key vault | Dakota Q2 | The key may go away |
| Card dispute reporting to Dakota | Cards leaving Dakota's sandbox | API may change; card disputes are forwarded by hand until then |
| Deleting recipients, exact fee before confirming, the sandbox money drill | Sandbox access (Q5) | Can't test against the real API |
| RD and any rewards | Dakota Q7 + the lawyer | GENIUS Act rules from 18 Jan 2027 |

---

## Progress log

| Date | Done |
|---|---|
| 2026-11-24 | Plan written. Phase 1c items 1–3 shipped (no "banking" copy, terms acceptance, Help & support). |
| 2026-11-24 | C5 secrets check + rotation table. F1 Dakota application text. C1 row-level security in code (deploy steps pending, see C1). |
| 2026-11-24 | C2 shared rate limits (needs Upstash keys). C3 sign-in review: per-IP login limit; 2FA turn-off now signs out everywhere. |
| 2026-11-24 | Compliance drafts F2–F9 (`compliance/`). Fixed from their review: magic-link 2FA gap, 2FA on approvals and schedules, AUTH_SECRET runbook. C4 Sentry scrubbing + stuck-transaction alert. CI fixed (stale lock file had blocked every run since 2026-11-23). |

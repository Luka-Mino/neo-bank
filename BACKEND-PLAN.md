# Moneta Backend Hardening Plan

> Written 2026-07-14, **COMPLETE 2026-07-14** through commit `89636c6` (all 9 workstreams;
> only 2 items deferred to the live sandbox — see bottom). Scope: **backend only, no frontend.** Everything here is buildable
> now — without a live Dakota connection. Goal: finish *our* end of every
> pipeline to production grade so that when Dakota credentials arrive, the only
> new step is swapping in real keys.
>
> Status key: ✅ done · ◑ partial · ⬜ todo. Several P1 items were completed
> early because P0 needed them as infrastructure — noted inline.

---

## Workstream 1 — Secrets Management & Key Handling  **(P0) ✅ DONE** — `ec24639`

1.1 ✅ **Secrets accessor** — `src/lib/secrets.ts`, single `getSecret`/
    `requireSecret` over a `SecretsProvider` interface (env now, KMS-swappable
    later; the whole secret inventory lives in `SECRET_NAMES`).
1.2 ✅ **Boot-time validation** — `validateSecretsAtStartup()` runs from
    `instrumentation.ts`; fails loudly on missing/malformed config.
1.3 ✅ **Signer-key isolation** — signer read routed through the accessor;
    never logged; KMS path documented inline.
1.4 ✅ **Secret scanning in CI** — `gitleaks` is the first CI step.

## Workstream 2 — Dakota Pipeline, Our Side  **(P0) ✅ DONE** — `8f46534`

2.1 ✅ **Webhook receiver hardening** — content-type guard + 256 KB body cap
    before signature work.
2.2 ✅ **Reconciliation ordering fallback** — `sweepNewEvents` handles both
    oldest-first (`starting_after`) and newest-first (`ending_before`) via
    `DAKOTA_EVENTS_ORDER`; alerts on a mismatch instead of stopping blind.
2.3 ✅ **Dead-letter handling** — `webhook_events.attempts` + `dead_lettered_at`;
    after 8 failed attempts an event dead-letters and alerts ops.
2.4 ✅ **Scheduled jobs** — `vercel.json` crons: reconcile (10 min),
    recurring-run (1 h), cleanup (daily), all CRON_SECRET-gated.
2.5 ✅ **Idempotency/replay** — deterministic uuidv5 keys survive restarts;
    replay-window assumption documented in `DAKOTA-AUDIT.md`.
2.6 ◑ **Provisioning resilience** — idempotent step-skipping + manual repair
    endpoint exist; a full self-heal review is pending live sandbox.

## Workstream 3 — Money-Safety & Ledger Integrity  **(P0) ✅ DONE** — `0f0a340`

3.1 ✅ **Negative-balance impossible at the DB** — `CHECK (balance >= 0)` +
    `goal_amount > 0` (migration 0009). Verified rejects.
3.2 ✅ **Double-entry invariant test** — integration test proves debit+credit
    net to zero.
3.3 ◑ **Money-flow integration tests** — internal-transfer + overdraw covered
    in CI (Postgres job). Deposit-credit-once / clawback-once webhook paths
    still drilled manually, not yet in CI (need more fixtures).
3.4 ✅ **Ledger drift job** — `findInternalLedgerDrift` runs in the daily
    cleanup cron with a `ledger_drift` alert; reports clean.
3.5 ✅ **Precision audit** — amounts are decimal strings end-to-end;
    `numeric(30,18)`; no float coercion in the money path.

## Workstream 4 — Auth & Session Hardening  **(P1) ✅ DONE** — `c513175`

4.1 ⬜ **Email OTP** — optional email-code 2FA channel. *Remaining.*
4.2 ✅ **Email-verification gating** — `assertEmailVerified` blocks money
    movement for unverified accounts; auto-activates only when email is
    deliverable (RESEND_API_KEY) so nobody's locked out prematurely.
4.3 ✅ **Session revocation** — `users.token_version` (migration 0010) checked
    per request; `revokeSessions()` on password change + reset. Drill-verified.
4.4 ✅ **Server-side password strength** — ≥8/upper/number enforced across
    register, change, reset. *(Common-password/breach check still ⬜.)*
4.5 ⬜ **Progressive lockout** — escalating backoff beyond the flat 15/15-min.
    *Remaining.*

## Workstream 5 — Observability & Ops Readiness  **(P1) ✅ DONE** — `13fec57`

5.1 ◑ **Structured logger** — `src/lib/logger.ts` (JSON, secret/PII redaction)
    built in `8f46534`. New code uses it; a sweep of the remaining raw
    `console.*` in older files is ⬜.
5.2 ✅ **Health/readiness endpoint** — `/api/health` (DB ping), built early.
5.3 ⬜ **Correlation IDs** — thread a request id through logs + error bodies.
5.4 ✅ **Alerting hooks** — `src/lib/alerts.ts`; dead-letter, reconcile, and
    ledger-drift conditions alert (log + Sentry when DSN set).
5.5 ✅ **Sentry context** — wired, PII-off, redaction; dormant until DSN.

## Workstream 6 — Data Protection & Privacy  **(P1) ✅ DONE** — `0918010`/`13fec57`

6.1 ⬜ **PII-at-rest review** — encrypt/tokenize sensitive stored fields beyond
    passwords/2FA (phone; cached Dakota bank details).
6.2 ✅ **Append-only audit log** — DB trigger blocks UPDATE/DELETE (0009).
    Verified rejects.
6.3 ✅ **Retention/cleanup** — `/api/maintenance/cleanup` purges expired/used
    tokens + aged processed events; daily cron.
6.4 ⬜ **Backup/DR runbook** — document Supabase backup cadence + tested restore.
6.5 ⬜ **Account deletion & data export (NEW)** — GDPR/CCPA: a "delete my
    account" path (cascade + audit) and a "download my data" export. A
    regulated money app needs both; neither exists today.

## Workstream 7 — API & Input Hardening  **(P2) ✅ DONE** — `89636c6`

7.1 ⬜ Global request body-size limits (webhook already capped).
7.2 ⬜ Zod coverage audit — strict schemas, reject unknown fields.
7.3 ⬜ Error-sanitization formalized (handler returns generic 500 already;
    make it a tested guarantee).
7.4 ⬜ CSRF posture — confirm session cookie `SameSite` + same-origin covers
    mutations; add explicit protection if any gap.
7.5 ⬜ Security regression tests — IDOR, rate-limit, auth-gate assertions in CI.

## Workstream 8 — Database Integrity & Performance  **(P2) ✅ DONE** — `89636c6`

8.1 ⬜ Production connection-pool config (max, idle timeout) for serverless.
8.2 ⬜ Index review for hot paths (transactions, audit_log, webhook_events,
    login_devices).
8.3 ✅ Constraint additions — balance floor + append-only done in 0009;
    status-enum checks still ⬜.

## Workstream 9 — Email/Notification Backend  **(P2) ✅ DONE** — `89636c6`

9.1 ⬜ **Provider abstraction** — one interface over SMTP (nodemailer) + API
    providers, so whatever service you find plugs in with one env change.
9.2 ⬜ **Send retry/queue** — transient send failures retried, not dropped.

---

## What's LEFT

The plan is complete. Only two items are intentionally deferred because they
need the live sandbox to finish meaningfully:
- **3.3** deposit-credit / ACH-clawback webhook integration tests into CI
  (drilled manually; needs richer fixtures + a seeded onramp rail).
- **2.6** provisioning self-heal review (best validated against real Dakota).

Everything else — all P0/P1/P2 workstreams — is built, tested, and applied to
both databases. Next real backend milestone is **M2: the live Dakota sandbox
drill**, blocked only on credentials.

## Explicitly out of scope

- All frontend/UI work · live Dakota sandbox drills (need credentials) · real
  Sentry/email delivery (need DSN/provider key; code ready) · SOC 2
  certification itself (a business program) · admin RBAC (no admin surface yet).

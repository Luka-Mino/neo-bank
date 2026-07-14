# Moneta Backend Hardening Plan

> Written 2026-07-14. Scope: **backend only, no frontend.** Everything here is
> buildable now — without a live Dakota connection. The goal is to finish
> *our* end of every pipeline to production grade so that when Dakota
> credentials arrive, the only new step is swapping in real keys. Grounded in
> a current-state audit (facts noted per item). Review this; approved items
> get built in the P0→P2 order below.

---

## Workstream 1 — Secrets Management & Key Handling  **(P0)**

*Current: no secrets abstraction; the P-256 signer key + API keys are read
straight from `process.env`; env validation exists but is partial.*

1.1 **Secrets accessor** — `src/lib/secrets.ts` with one `getSecret(name)`
    entry point. Env-backed today, KMS-swappable later (a documented
    `SecretsProvider` interface). Every secret read routed through it.
1.2 **Boot-time validation** — fail fast, loudly, at startup if a required
    secret is missing or malformed (extend `src/env.ts` + a startup check).
1.3 **Signer-key isolation** — the signing key load lives behind the secrets
    module; never logged; buffers cleared after use where possible; the KMS
    migration path documented inline.
1.4 **Secret scanning in CI** — add `gitleaks` to the GitHub Actions workflow
    so a committed key fails the build.
**Done when:** all secrets flow through one module; CI blocks a planted test
secret; startup errors clearly on missing/bad config; no secret ever logged.

## Workstream 2 — Dakota Pipeline, Our Side  **(P0)**

*Current: webhook verified (Ed25519) but no body-size cap; reconcile assumes
oldest-first `/events` with an `orderingSuspect` guard but no fallback; failed
webhook rows retry forever with no dead-letter; reconcile + recurring-run
routes exist but nothing schedules them.*

2.1 **Webhook receiver hardening** — cap body size, enforce content-type,
    reject early before signature work on obviously bad requests.
2.2 **Reconciliation ordering fallback** — implement the `ending_before`
    pagination path so the sweep works whether `/events` is oldest- or
    newest-first; removes the standing `orderingSuspect` risk.
2.3 **Dead-letter handling** — after N failed processing attempts, move a
    webhook_events row to a `dead_letter` state + emit an alert, so a poison
    event stops silently retrying and surfaces for a human.
2.4 **Scheduled jobs** — `vercel.json` crons: `/api/dakota/reconcile` (~10
    min) and `/api/transfers/recurring/run` (hourly), both CRON_SECRET-gated.
2.5 **Idempotency/replay documentation** — confirm deterministic keys survive
    restarts (they do — uuidv5) and document the undocumented replay window
    assumption + the retry-safety matrix.
2.6 **Provisioning resilience** — review the retry/repair path so a
    partially-failed post-KYC provision self-heals on the next webhook/cron.
**Done when:** webhook rejects oversized/malformed bodies; reconcile handles
both orderings; poison events dead-letter + alert; crons scheduled; local
drills pass for each.

## Workstream 3 — Money-Safety & Ledger Integrity  **(P0)**

*Current: exactly-once credit/refund/clawback enforced in app code + row
locks, but no DB-level balance floor and no integration tests for the money
paths (unit tests only).*

3.1 **Negative-balance impossible at the DB** — `CHECK (balance >= 0)`
    constraint as defense-in-depth beneath the optimistic lock.
3.2 **Double-entry invariant test** — integration test proving every internal
    transfer's debit + credit net to zero.
3.3 **Money-flow integration tests** — end-to-end against a real test DB:
    deposit credits once, duplicate webhook doesn't double-credit, withdrawal
    hold refunds once, ACH clawback debits once. (Formalizes the manual drills
    already passing into CI.)
3.4 **Ledger drift job** — periodic check that balances reconcile to their
    transaction history; flag any drift.
3.5 **Precision audit** — confirm `numeric(30,18)` is handled as strings
    end-to-end with zero float coercion anywhere in the money path.
**Done when:** negative balances are DB-impossible; the once-only invariants
are covered by CI integration tests; drift job runs and reports clean.

## Workstream 4 — Auth & Session Hardening  **(P1)**

*Current: password + TOTP + magic-link + new-device alerts + brute-force
limit. Gaps: unverified emails can log in; JWT sessions can't be revoked;
password strength enforced only client-side.*

4.1 **Email OTP** — optional email-code 2FA channel (generate/verify),
    backend + the auth provider plumbing.
4.2 **Email-verification gating** — unverified accounts blocked from
    money-movement operations until verified (decision + enforcement).
4.3 **Session revocation** — a token-version/denylist so "sign out everywhere"
    and new-device revocation actually invalidate existing JWTs.
4.4 **Server-side password strength** — enforce the same rule the UI promises
    (≥8, upper, number) plus a common-password check, at the API.
4.5 **Progressive lockout** — escalating backoff beyond the flat 15/15-min.
**Done when:** email OTP passes a drill; unverified users can't move money;
a revoked session is rejected; weak/breached passwords refused server-side.

## Workstream 5 — Observability & Ops Readiness  **(P1)**

*Current: 16 files on raw `console.*`; Sentry wired but dormant; no health
endpoint; no correlation IDs.*

5.1 **Structured logger** — one JSON logger (level, request id, context) with
    secret/PII redaction; replace the raw console calls in server code.
5.2 **Health/readiness endpoint** — `/api/health`: DB ping, migration state,
    (Dakota reachability once live).
5.3 **Correlation IDs** — thread a request id through logs and error bodies.
5.4 **Alerting hooks** — webhook-processing failures, stuck non-terminal
    transactions, and reconcile errors emit alerts (log now; wire to
    Sentry/email when keys exist).
5.5 **Sentry context** — release + user-scope tagging ready (goes live on DSN).
**Done when:** logs are structured + redacted; `/api/health` returns real
status; the failure conditions emit alerts.

## Workstream 6 — Data Protection & Privacy  **(P1)**

*Current: passwords bcrypt, 2FA secrets AES-GCM; other stored data plain;
audit log is a normal (mutable) table; tokens never purged.*

6.1 **PII-at-rest review** — encrypt/tokenize sensitive stored fields beyond
    passwords/2FA (phone; any cached bank details from Dakota).
6.2 **Append-only audit log** — DB trigger/permissions blocking UPDATE/DELETE
    so the trail is tamper-evident.
6.3 **Retention/cleanup** — scheduled purge of expired magic-link / reset /
    verification tokens and aged `webhook_events`.
6.4 **Backup/DR runbook** — document Supabase backup cadence + a tested
    restore procedure.
**Done when:** sensitive fields encrypted; audit log immutable; expired tokens
purged on a schedule; a DR runbook exists in the repo.

## Workstream 7 — API & Input Hardening  **(P2)**

7.1 Global request body-size limits.
7.2 Zod coverage audit — every mutation strictly schema-validated, unknown
    fields rejected.
7.3 Error-sanitization formalized — assert no stack/internal leakage (handler
    already returns generic 500; make it a tested guarantee).
7.4 Explicit, restrictive CORS policy.
7.5 Security regression tests — IDOR, rate-limit, and auth-gate assertions in CI.
**Done when:** malformed/oversized requests rejected; strict schemas
everywhere; security invariants tested in CI.

## Workstream 8 — Database Integrity & Performance  **(P2)**

8.1 Production connection-pool config (max, idle timeout) tuned for serverless.
8.2 Index review for hot paths (transactions, audit_log, webhook_events).
8.3 Constraint additions (status enums, balance floor from 3.1).
**Done when:** pool tuned; hot queries indexed; invariants at the DB layer.

## Workstream 9 — Email/Notification Backend  **(P2)**

9.1 **Provider abstraction** — one interface over SMTP (nodemailer) + API
    providers, so whichever service you locate plugs in with one env change.
9.2 **Send retry/queue** — transient send failures retried, not dropped.
**Done when:** swapping email providers is a config change; failed sends retry.

---

## Sequencing

- **P0 (first):** Secrets (1), Dakota-our-side (2), Ledger integrity (3).
- **P1:** Auth hardening (4), Observability (5), Data protection (6).
- **P2:** API hardening (7), Database (8), Email backend (9).

## Explicitly out of scope

- **All frontend/UI work** (per direction).
- **Live Dakota sandbox drills** — need credentials (code is ready).
- **Real Sentry / email delivery** — need a DSN / provider key; code ready.
- **SOC 2 certification itself** — a business program, not code (technical
  controls above make us audit-ready).

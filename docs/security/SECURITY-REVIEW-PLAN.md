# Security & Correctness Review Plan

> Written 2026-08-24. Defines the reviews required to validate the multi-tenant
> org/team refactor (PRs 1–7 + approval engine + team UI — ~15 commits touching
> every money path, the auth/session layer, RBAC, and approvals) before we (a)
> enable RLS / PR-6 and (b) ever touch real money (Dakota live). This is the
> largest change in the codebase and the one where a single bug = a cross-tenant
> money leak. Grounded in `ORG-FOUNDATION-SPEC.md` §6 (the 17-point checklist),
> `SECURITY.md`, and the drills already run this session.

## 0. Principles
- **Adversarial, not confirmatory.** Reviewers try to BREAK isolation/RBAC/
  approvals, defaulting to "vulnerable" until they can't. A finding survives only
  if independent skeptics fail to refute it.
- **Confirmed by repro.** Every HIGH/CRITICAL finding is reproduced against the
  real local Postgres (as with the isolation, approval, and member drills), not
  asserted from reading.
- **Fail-closed bias.** Where behavior is ambiguous, the secure reading is the
  bug to fix.
- **Defense-in-depth is verified in layers.** App-layer org predicates AND the
  RLS backstop AND composite FKs are each tested independently — one holding
  doesn't excuse another failing.

## 1. Review dimensions
Each dimension: **threats → method → acceptance**. Severity uses HIGH (cross-tenant
access / money loss / auth bypass), MEDIUM (privilege escalation within tenant /
integrity), LOW (defense-in-depth).

### A. Tenant isolation — HEADLINE
- **Threats:** cross-org IDOR (read/write/act on another org's row by id); a query
  missing its `org_id` filter; `org_id` taken from client input; composite-FK
  stitching (a card/tx pointing at another org's account); listing endpoints
  leaking counts/ids; the ~40 inline predicates + `users/data` (bypasses
  apiHandler) + the not-orgScoped money routes (`transactions` POST, provisioning,
  crons) that rely on explicit predicates.
- **Method:** the isolation test matrix (§3) run per resource × verb, as an
  adversarial workflow + a two-org drill that asserts 404 on every cross-org
  attempt; grep audit for every `.from(<classA>)` and confirm an org predicate or
  ownership helper on each; verify composite FKs reject cross-org inserts.
- **Acceptance:** org B cannot read/modify/act on ANY class-A row of org A; all
  cross-org access returns 404 (no enumeration oracle); zero class-A query lacks an
  org scope.

### B. RBAC & capabilities
- **Threats:** grant/hold a role ≥ your own; self-elevation; act on a member at/
  above your rank; demote/remove the last owner; money routes gated on rank not
  `can_move_money`; export not gated; a stale role/flag surviving a demotion until
  token refresh.
- **Method:** RBAC matrix (§4); confirm the jwt callback re-derives role + all
  three flags LIVE each request (drill: change a flag, next request reflects it);
  confirm every money route requires `can_move_money`, export requires `can_export`.
- **Acceptance:** all four invariants hold in-route; capability changes are
  effective on the next request; Accountant (money=false) is blocked from every
  money route.

### C. Approval engine
- **Threats:** maker approves own request; padding the count (double vote); over-
  threshold money executing without a valid approved request; `payload_hash`
  tamper between request and execute (TOCTOU); replayed/double execute; band
  resolver picking the wrong (weaker) band; executing an expired/cancelled/rejected
  request; execute skipping re-authorization of the legs; policy edited by a
  non-owner; threshold evaded by denominating in another asset.
- **Method:** approval matrix (§4) + extend the approvals drill with: tampered
  payload, replayed execute, expired request, cross-asset threshold, non-owner
  policy edit, and a 3-band resolver test.
- **Acceptance:** maker≠checker enforced (code+DB); distinct-approver quorum;
  `executed_tx_id` idempotent; payload re-verified at execute; both legs
  re-authorized; policies owner-only + audited; asset-normalized thresholds.

### D. Invitations & member lifecycle
- **Threats:** guessable/forgeable token; token stored plaintext; reuse after
  accept; accept by a different email than invited; expired accept; invited role >
  inviter; self-invite to another org at elevated role; offboarding that leaves a
  live session or a wedged pending approval.
- **Method:** invite matrix (§4) + drill: wrong-email accept, double accept,
  expired accept, role-escalation invite; confirm offboarding bumps
  `token_version`, nulls `active_org_id`, and cancels the removed member's pending
  requests.
- **Acceptance:** token is ≥128-bit, HMAC-stored, single-use, email-bound,
  expiring, role ≤ inviter; removal kills sessions + doesn't wedge the org.

### E. Money-movement correctness (ledger invariants)
- **Threats:** deposit credited twice / not at all; clawback twice; withdrawal hold
  refunded twice or not on definitive failure; internal double-entry not netting
  zero; webhook out-of-order or replayed corrupting state; a deposit credited to
  the wrong org; insufficient-funds race double-spending; the two-leg withdrawal
  refunding on a 5xx (money may have moved).
- **Method:** the money-path drills (some exist) re-run with: duplicate webhook,
  out-of-order status, org-mismatch dead-letter, concurrent debit race; assert the
  double-entry nets zero and `moneta_credited`/`moneta_debited` flags gate
  exactly-once.
- **Acceptance:** credit/clawback/refund each happen exactly once; deposits credit
  the correct org's primary account; org mismatch dead-letters; internal transfers
  are balanced.

### F. Auth & session
- **Threats:** stale JWT keeps access after password change / 2FA disable / removal;
  fail-open on authorization (not just availability); org claim trusted from client;
  2FA bypass via the magic-link path; backup-code or magic-link reuse; session
  fixation.
- **Method:** confirm `tokenVersion` revocation on all channels; confirm the
  fail-OPEN is availability-only and org authorization fails CLOSED; confirm 2FA is
  enforced on BOTH password and magic-link authorize; drill backup-code +
  magic-link single-use (already green — re-confirm).
- **Acceptance:** revocation works on every channel; authz fails closed; 2FA can't
  be sidestepped; single-use tokens are single-use.

### G. Secrets & crypto
- **Threats:** an AUTH_SECRET-derived key reused across domains (TOTP secret enc,
  backup-code HMAC, invite-token HMAC, approval payload HMAC, RLS none); weak hash
  for a low-entropy secret; a secret logged; field-encryption misuse.
- **Method:** confirm each HMAC/derivation is domain-separated (distinct suffix);
  confirm low-entropy secrets (OTP) use bcrypt while high-entropy (backup/invite)
  use keyed HMAC; grep logs/redaction for secret leakage.
- **Acceptance:** every derived key is domain-separated; no secret is logged; hash
  choice matches entropy.

### H. Input validation & injection
- **Threats:** SQL injection (drizzle parameterizes — verify no raw string interp in
  `sql`` templates carrying user input); mass-assignment via PATCH bodies; unbounded
  bodies; zod gaps on money/role/threshold fields.
- **Method:** audit every `sql`` template for interpolated user input; confirm PATCH
  handlers whitelist fields (no spread of the body); confirm body-size guards.
- **Acceptance:** no user input reaches a raw SQL fragment; PATCH whitelists;
  size-guarded.

### I. Migration & backfill correctness (pre-RLS)
- **Threats:** a class-A row with `org_id IS NULL` (would escape the NOT NULL + any
  `IS NULL` RLS gap); the personal-org backfill mis-mapping a row; a duplicate
  personal org; the tiered-threshold unique letting duplicate NULL-band policies.
- **Method:** re-run the zero-null pre-flight assertions across all 11 class-A
  tables; confirm one personal org per user; confirm `NULLS NOT DISTINCT` holds.
- **Acceptance:** zero nulls; deterministic 1:1 backfill; no duplicate bands.

### J. Webhook security
- **Threats:** forged Dakota webhook (Ed25519 bypass / replay); forged Stripe
  issuing auth (HMAC bypass); oversized body; replayed event double-processing.
- **Method:** confirm signature verify + replay window on both; confirm
  `dakota_event_id` idempotency + dead-letter; confirm the issuing route stays 501
  until configured.
- **Acceptance:** unsigned/forged/stale rejected; replays deduped; oversized 413.

### K. RLS enablement review (PR-6 — gates production)
- **Threats:** RLS enabled while the not-orgScoped routes (transactions POST,
  provisioning, crons) run on a connection with no GUC → zero rows → money movement
  silently breaks; app still connecting as table owner (RLS bypassed); a policy
  using `IS NULL` escape; composite FKs / NOT NULL not applied.
- **Method:** review the 0019 enforce migration; prove `SELECT * FROM accounts`
  with a foreign/absent GUC returns ZERO rows; confirm the app role is non-owner
  non-BYPASSRLS; confirm every not-orgScoped class-A query gets a per-operation GUC
  (or a scoped maintenance role); the CI grep for raw class-A `db.select` outside
  helpers.
- **Acceptance:** RLS ENABLE+FORCE on all 11 class-A tables; zero-rows-on-no-GUC
  proven; app is non-owner; no route broken by the switch.

### L. Dependency / supply chain
- **Method:** CI already runs `gitleaks` (secrets) + `npm audit --omit=dev`. Confirm
  green; review any new deps added this session (none of note); pin/lockfile check.
- **Acceptance:** no leaked secrets; no HIGH/CRITICAL advisories in prod deps.

### M. Abuse / rate limiting
- **Method:** confirm sensitive routes (invite, accept, decisions, transfers,
  register, 2FA) carry sane rate limits; confirm the approval decision + execute
  are idempotent under retry.
- **Acceptance:** brute-force-sensitive routes are limited; retries are safe.

## 2. Adversarial methodology (how we run it)
1. **Per dimension, a workflow:** a finder agent enumerates candidate findings from
   the diff/code; each candidate is fanned out to **N=3 independent skeptic
   verifiers with distinct lenses** (correctness / does-it-reproduce / can-I-refute)
   prompted to REFUTE; a finding survives only on a ≥2/3 "real" vote. **Loop-until-
   dry:** repeat rounds until K=2 consecutive rounds surface nothing new (the tail
   is where the subtle bugs hide).
2. **Reproduce:** every surviving HIGH/CRITICAL gets a throwaway drill against the
   real local DB (two-org setup) that demonstrates the exploit, then the fix, then
   re-demonstrates it's closed.
3. **Complementary automated passes:**
   - the built-in **security-review** skill on the branch diff,
   - **/code-review ultra** (cloud, multi-agent — user-triggered, billed),
   - **CI**: gitleaks, npm audit, tsc, unit + integration tests,
   - a **completeness critic** agent: "what dimension didn't we run, what claim is
     unverified, what file is unread?" → next round of work.
4. **Manual senior pass** on the highest-risk seams (§ below).

**Highest-risk seams to review first** (from the spec + this build): the ~40 inline
`org_id` predicates + `users/data` (bypasses apiHandler); the not-orgScoped money
routes' explicit-predicate isolation (`transactions` POST, provisioning, crons —
these have NO RLS backstop until PR-6 and rely entirely on the predicates); the
destination/recipient transitive check feeding withdrawals; the approval
execute path (payload re-verify + leg re-authorization + idempotency); the jwt
live re-derivation of role+flags; the org backfill mapping.

## 3. Tenant-isolation test matrix (concrete)
For each **resource** × each **verb**, assert org B → org A row = **404**:

| Resource | GET one | list | PATCH/PUT | DELETE | POST referencing |
|---|---|---|---|---|---|
| accounts | ✓ | scope | ✓ | ✓ | — |
| cards | ✓ | scope | ✓ | — | issue-on(accountId) |
| transactions | ✓ | scope | recategorize | — | withdraw(accountId, destinationId) |
| recipients | — | scope | — | — | — |
| destinations | — | scope | — | — | create-on(recipientId) |
| wallets / rails | — | scope | — | — | — |
| dakota_customers | one | — | — | — | — |
| recurring | — | scope | — | cancel | create(from/to accountId) |
| approval_requests | one | scope | — | — | decide / execute |
| org_members | — | scope | change-role | remove | — |
| org_invitations | — | scope | — | revoke | accept(token) |

Plus cross-cutting: org_id-from-client rejected; composite-FK stitching rejected;
RLS-off (now) vs RLS-on (post-PR-6) both correct.

## 4. RBAC / approval / invite matrices
- **RBAC:** admin→owner grant (deny); self role-edit (deny); admin acting on
  admin/owner (deny); demote last owner (deny); member hitting a money route
  without `can_move_money` (deny); export without `can_export` (deny); flag change
  effective next request (assert).
- **Approval:** self-approve (deny); 2nd vote by same approver (no-op); execute
  below quorum (deny); tampered payload execute (deny); replay execute (idempotent);
  3-band resolver picks max; expired request decide/execute (deny); non-owner policy
  edit (deny); cross-asset threshold (require).
- **Invite:** wrong-email accept (deny); double accept (deny); expired accept
  (deny); role>inviter (deny); already-member (deny); forged token (deny).

## 5. Sequencing & gates
- **Gate 1 — before PR-6/RLS:** dimensions A–J + L–M pass; all HIGH/CRITICAL fixed
  and re-verified. (RLS is off, so isolation rests entirely on the app layer — this
  gate is where app-layer isolation must be proven airtight.)
- **Gate 2 — PR-6 review:** dimension K; the 0019 enforce migration + RLS proven
  (zero-rows-on-no-GUC), non-owner DB role, no route broken.
- **Gate 3 — before real money (Dakota live):** full re-run + a recommended
  **third-party penetration test** + SOC 2 evidence collection (see `ROADMAP.md`
  M3). External review is required before production money movement.

## 6. Deliverables & sign-off
- A **findings report**: severity-ranked, each finding with repro steps, the fix,
  and the re-verification (empty if clean).
- A **sign-off checklist** mapping every item in §1–§4 and the spec's 17 points to
  PASS/FAIL with the drill that proves it.
- **Remediation loop:** fix → re-verify → re-run the affected dimension until zero
  HIGH/CRITICAL remain.

## 7. Out of scope / escalate
- **Third-party pen test** before production (we can't self-certify a bank).
- **Formal SOC 2 Type 2** audit (org/process, ~60–70% non-code — see `ROADMAP.md`).
- **Platform-signer key management** (the ES256 signer we hold): review moving it to
  a secrets manager / HSM at M3 — not in this app-layer review.
- On-chain / Dakota custody correctness is Dakota's remit; our surface is the
  signing intent construction (already audited) + webhook verification.

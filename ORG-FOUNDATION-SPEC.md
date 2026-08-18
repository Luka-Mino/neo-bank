# Org-Tenancy Foundation Spec (Phase 0) — implementation blueprint

> Produced 2026-08-18 by a design+threat-model workflow (8 agents, verified against
> the real code). This is the authoritative build guide for the multi-tenant
> refactor. Paramount requirement: **tenant isolation**. Principle: **additive
> migration, fail-closed, one choke point, defense-in-depth** — isolation must NOT
> depend on remembering a `WHERE` clause.

## Security architecture (the three pillars)
1. **RLS fail-closed backstop.** Postgres Row-Level Security on all 11 class-A tables,
   `ENABLE` + `FORCE`. Policy: `org_id = current_setting('app.current_org_id', true)::uuid`.
   Unset GUC → `org_id = NULL` → **zero rows**. A forgotten app-layer filter leaks nothing.
   GUC set per-request via `set_config(..., is_local=true)` inside a transaction
   (`withOrg`) — required because the DB runs in Supabase transaction-pooler mode.
   App must connect as a **non-owner, non-BYPASSRLS role**.
2. **Composite FKs = structural anti-stitching.** Parents carry `UNIQUE(org_id, id)`;
   children FK on `(org_id, child_fk) → parent(org_id, id)`. Makes it *impossible* for a
   card/transaction/destination/etc. to reference another org's row.
3. **Server-derived org, one choke point.** `org_id` NEVER comes from request
   body/header/query. The jwt callback resolves it from `users.active_org_id` via a
   live `org_members` membership check (rides the existing tokenVersion query);
   `apiHandler` injects `{orgId, role, canApprove}` + a GUC-scoped `ctx.db`, default-deny.

## Tables (7 new)
- **organizations** — tenant. `type` personal|business, `status`, `created_by`,
  `personal_for_user_id UNIQUE` (idempotent backfill link + 1 personal org/user), `settings`. Never hard-deleted.
- **org_members** — `role` (owner|admin|member|viewer, ranked 3/2/1/0) + `can_approve`
  (orthogonal capability) + `status`. `UNIQUE(org_id,user_id)`. Invariant: ≥1 active owner.
- **org_invitations** — invite-by-email; `token_hash` (HMAC, single-use, expiring),
  partial `UNIQUE(org_id, lower(email)) WHERE pending`. Atomic accept, email-bound, role ≤ inviter.
- **approval_policies** — "action over $X needs N approvals"; `enabled=false` by default
  (inert scaffold); threshold asset-normalized (anti-structuring). Owner-editable, audited.
- **approval_requests** — pending maker/checker action; `payload_hash` (TOCTOU guard,
  re-verified at execute), `requested_by` (maker), `executed_tx_id` (idempotent execute).
- **approval_decisions** — one row/approver; `UNIQUE(request_id, approver_id)`;
  `approver_id != requested_by`; approver must be live `can_approve` member.
- **assets** — currency registry (USD, EUR, GBP, USDC, EURC); model only, no FX. `accounts.asset` FKs it.

## Existing table changes
- **Class A (8 direct)** gain `org_id` — `dakota_customers, wallets, dakota_rails,
  accounts, cards, transactions, recipients, recurring_transfers`. `user_id` KEPT but
  repurposed to "actor/created_by" — no rename in Phase 0. `accounts` gains `asset`.
- **Class A (3 indirect)** gain denormalized `org_id` + composite FK to parent —
  `destinations, wallet_balances, transaction_status_history`.
- **users** gains `active_org_id` (server-side current-org pointer, set only by org-switch).
- **audit_log** gains nullable `org_id` (system actors have none; not RLS-enforced).
- **Class B (8 tables) stay user-level, NO org_id, NO RLS**: login_devices,
  user_preferences, password_reset_tokens, email_verification_tokens, email_otp_codes,
  two_factor_backup_codes, magic_link_tokens, notifications.
- **Class G stay global**: webhook_events, dakota_sync_state.
- Constraint swaps: `dakota_customers` unique becomes `(org_id)`; accounts primary
  partial-unique becomes per-org.

## Migrations (expand → backfill → enforce; app works between each)
- **0016_org_expand** — additive: create 7 tables + seed assets; add nullable `org_id`
  (+`accounts.asset`, `users.active_org_id`, `audit_log.org_id`). Ship alone safely.
- **0017_org_backfill** — idempotent (`IS NULL`/`NOT EXISTS` guards): 1 personal org per
  user (incl. soft-deleted), owner membership, point `active_org_id`, stamp `org_id` on
  every class-A row via the unique personal org, seed default (OFF) approval policies.
  Pre-flight assert zero `org_id IS NULL` before 0018.
- **0018_org_enforce** — after PR-2/4/5 land (every query sets the GUC): `NOT NULL` +
  FKs + `UNIQUE(org_id,id)` + composite FKs + constraint swaps + **RLS ENABLE/FORCE +
  policies**. Switch app DB role to non-owner.

## Enforcement seam
- `src/lib/db/with-org.ts` — `withOrg(orgId, fn)`: `db.transaction` + `set_config('app.current_org_id', orgId, true)`.
- `src/lib/auth/config.ts` jwt/session — mint `{orgId, role, canApprove, kycStatus(org-level)}`
  from live membership check; **fail-CLOSED for org authz** (drop claim on error) even
  though auth fails-open. Revocation via `tokenVersion` bump.
- `src/lib/api-handler.ts` — `AuthUser` gains `{orgId, role, canApprove}`; context gains
  GUC-scoped `db`; options gain `orgScoped`(default true, 403 when no org),
  `requiredRole`, `requireApprover`. Routes use `ctx.db`.
- `src/lib/auth/ownership.ts` — checks flip to `row.orgId === ctx.orgId`, **404 (not 403)
  for cross-org** (no enumeration oracle); add `assertRecipientOwnership` + `assertDestinationOwnership`.
- `src/types/next-auth.d.ts` — augment Session/JWT so a missing org claim is a compile error.

## PR sequence
- **PR-1** schema + `0016_org_expand`. ← *this commit*
- **PR-2** identity plumbing + `ctx.db` seam (jwt/session, apiHandler, withOrg, types,
  `src/lib/orgs.ts`, register creates personal org). Swap `db`→`ctx.db` in class-A routes.
- **PR-3** `0017_org_backfill`.
- **PR-4** flip ownership helpers + ~40 inline `eq(table.userId,…)` predicates → org, per resource; stamp `orgId` on inserts.
- **PR-5** libraries — provisioning (per-org, single-flighted), transfers (both legs same org+asset), webhook-handlers (per-org resolution, dead-letter on mismatch), audit, notifications, issuing; cron re-verifies org per row + `CRON_SECRET` required non-local.
- **PR-6** `0018_org_enforce` + RLS + non-owner DB role.
- **PR-7** feature routes: `orgs` (list/create/switch), members (role-lattice, ≥1 owner),
  invitations + accept, approval-policies, approvals + decisions + execute.
- **Then**: adversarial security review (workflow) against the 17-point checklist below.

## Security checklist (verify against)
1. Server-derived org only (never from client input). 2. One choke point, default-deny,
403 fail-closed. 3. RLS backstop + FORCE + non-owner role; CI greps raw `db.select` on
class-A outside helpers. 4. `org_id NOT NULL`, no `IS NULL` escape. 5. Ownership → 404
cross-org, 403 in-org. 6. Every linked child id re-validated to `ctx.orgId`; both transfer
legs same org+asset. 7. Composite FKs enforce no cross-org stitching. 8. Dakota
customer/wallet/rails pivot per-org; provisioning idempotent+single-flighted. 9. Live
membership/role re-check each request; fail-closed; revoke via tokenVersion. 10. RBAC
lattice: can't grant ≥ own role; ≥1 owner; can't self-edit role. 11. Invitations: HMAC
token, single-use, email-bound, role ≤ inviter, expiry, CSRF. 12. Approvals: maker≠checker,
distinct-count, payload_hash re-verify, idempotent execute, asset-normalized threshold.
13. Backfill: 1 personal org/user, deterministic 1:1, idempotent, invariants asserted.
14. Cron carries+re-verifies org per row; `CRON_SECRET` non-local. 15. `audit_log.org_id`;
log every denial/role-change/invite/approval. 16. Demo/kyc-bypass never weaken isolation.
17. Multi-currency: reject cross-currency internal transfers until FX; validate against `assets` allow-list.

**Highest-risk seams:** the ~40 inline `userId` predicates + `users/data` (bypasses
apiHandler); the destination/recipient transitive check feeding money movement
(`transactions/route.ts:121-131`); per-user→per-org Dakota pivot + provisioning idempotency;
stale JWT role after removal; the backfill mapping.

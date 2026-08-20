# Team / RBAC / Approvals — PR-7 blueprint

> Written 2026-08-20 from a 6-agent research pass (Mercury, Brex, Ramp, Revolut
> Business + fintech RBAC/SoD best practice) synthesized against what PRs 1–6
> built. Verdict: our data foundation (tenant isolation, RLS, maker/checker
> model, `can_approve` separation, asset-normalized thresholds) is **above what
> most seed-stage neobanks ship**. Two schema shapes will bite, and the whole
> feature layer (PR-7) is unbuilt — including that **the approval engine executes
> nothing yet** (no money route creates/checks an approval_request).

## The one structural insight
A **linear role rank cannot express the most-requested finance persona: the
Accountant/Bookkeeper** (sees everything, exports, reconciles — but *cannot move
money or manage people*). `roleSatisfies` is `rank >= need`, so anything above
`member` inherits payment power. Fix: **keep rank as the management-authority
lattice; gate money + export on explicit capability flags** (the Wise/Brex
"approval/money is its own axis" pattern, which our `can_approve` flag already
follows correctly).

## Role presets (stored as role + flags, shown as named presets)
| Preset | view | move money | manage cards | manage members | approve | export | stored as |
|---|---|---|---|---|---|---|---|
| **Owner** | all | ✓ | ✓ | ✓ (incl owners) | ✓ | ✓ | `owner` |
| **Admin** | all | ✓ | ✓ | ✓ (not owners) | opt | ✓ | `admin` |
| **Accountant** *(new)* | all | ✗ | ✗ | ✗ | ✗ | ✓ | `member` + `can_move_money=false` + `can_export=true` |
| **Initiator** (maker) | scoped | ✓ | own | ✗ | ✗ | ✗ | `member` + `can_move_money=true` |
| **Approver** | scoped | opt | – | ✗ | ✓ | opt | any role + `can_approve=true` |
| **Viewer / Auditor** | read-only | ✗ | ✗ | ✗ | ✗ | ✓ | `viewer` (+`can_export`) |

Do **not** add `accountant` as a rank value — it breaks the total order.

## Capability flags to add
Add exactly **two** (defaulted per role, per-member overridable), on **both**
`org_members` and `org_invitations` (set scope at invite time):
- **`can_move_money`** — gate `transfers/*` + `transactions` POST on this, not `requiredRole: member`.
- **`can_export`** — bookkeeper/auditor bulk export without money authority.
Leave manage_members/cards/recipients implied by rank for now. Keep `can_approve` verbatim.

## Approval engine — gaps vs. what we built
What we have is strong (per-action policies, asset-normalized thresholds =
anti-structuring, N-of-M quorum, `payload_hash` TOCTOU, `executed_tx_id`
idempotent, self-approval blocked in code+DB, inert by default). Gaps:

1. **[P0 BLOCKER] Tiered thresholds are impossible.** `approval_policies` has
   `UNIQUE(org_id, action_type, threshold_asset)` → one policy per action per
   asset. The industry pattern is **bands** (>$5k→1, >$50k→2, >$250k→3). Fix:
   change the unique key to include `threshold_amount`; resolver selects **all
   matching bands and takes the max `required_approvals`** (Brex "strongest match
   wins"). Small migration + resolver — the difference between toy and real.
2. **[P0 WIRING] The scaffold connects to nothing.** Insert the choke point: on
   transfer/payment POST → resolve policy → if triggered, create `pending`
   request + return "pending approval" instead of executing; checker POSTs a
   decision; at `required_approvals`, re-verify `payload_hash` and execute
   atomically, stamping `executed_tx_id`. Enforce maker≠checker + approver is a
   live `can_approve` member at execute time.
3. **[P1 DIFFERENTIATOR — crypto-native moat] Non-amount triggers.** Mandatory
   approval regardless of amount on **new/changed destination address or bank
   details** (`recipient.destination.add` / `.change`, threshold `null`).
   Address-poisoning/substitution is a top stablecoin attack; card-first
   competitors structurally can't offer this. Cheap given the scaffold — market it.
4. **[minor, OK to ship] Flat M-of-N only**, no named/role/manager routing or
   sequential chains. For a small treasury team, flat M-of-N is the right
   primitive (it's how institutional multisig works). Routing → backlog. Do honor
   `expires_at` with a default TTL.

## PR-7 screens (member-management UX)
1. **Team roster** `/settings/team` — role, status badge, can_approve badge,
   last-active; per-row change-role/resend/revoke/remove; pending & deactivated visually distinct.
2. **Invite modal** — email + role dropdown with plain-language descriptions at
   point of assignment ("Accountant — sees everything, exports, can't move money")
   + capability toggles. Enforce role ≤ inviter; HMAC single-use token (built).
3. **Accept-invite landing** — email-bound, single-use, atomic → `org_members` row.
4. **Role/permission edit** — enforce **in-route** (not schema): (a) can't grant
   ≥ your own role, (b) **≥1 active owner** (block demoting/removing last owner),
   (c) can't self-edit your own role.
5. **Offboarding** — `status='removed'` (never hard-delete), **bump
   `users.token_version`** to kill live sessions, **reassign/clear pending
   approver duties** so a removed approver can't wedge a pending request. Suspend (reversible) vs. remove.
6. **Approval-policy settings** — per-action rows with threshold bands +
   `required_approvals` + enable toggle; owner-only, audited.
7. **Approvals inbox** — "Needs approval" tab + dashboard item; approve/reject + comment; notify other approvers.
8. **Audit view** — filterable, **exportable** table over `audit_log`.

## Security must-verify
- The jwt/session callback already re-derives **role + can_approve live each
  request** (PR-2 `resolveActiveMembership`) — GOOD; extend it to the two new
  flags so a demotion/flag change takes effect immediately (not at token refresh).
  This is the spec's "highest-risk seam #9."
- **Per-account scoping:** do NOT build now, but do NOT ship an all-or-nothing
  "view all accounts" flag (Revolut's documented trap). Design so a future
  `org_member_account_access(org_id, member_id, account_id)` grant table slots in
  cleanly — keep account visibility composable from day one.

## What's what for our stage
- **Table-stakes (PR-7):** Accountant persona; invite/accept/role-change/offboard;
  the 3 RBAC invariants; approvals wired to money; self-approval block; exportable audit.
- **Differentiating (cheap — lean in):** crypto-native destination-change approval;
  M-of-N treasury quorum framed as multisig governance; deep exportable audit
  (Mercury's *documented* weakness — low-effort moat).
- **Over-engineering → BACKLOG:** custom-role builder, per-department/cost-center
  scoping, SCIM/HRIS auto-provisioning, multi-entity entity-scoped admins,
  sequential named-approver chains, card spend/merchant policies.

## Prioritized punch list (mapped to schema)
1. **P0** Fix tiered thresholds (relax `approval_policies` unique + max-band resolver).
2. **P0** Wire approvals into `transfers/*` + `transactions` POST (create → decide → execute).
3. **P0** Add `can_move_money` + `can_export` on `org_members` + `org_invitations`; gate money routes on `can_move_money`.
4. **P0** PR-7 member routes + UX with the 3 in-route invariants.
5. **P0 (security)** Extend live re-derivation to the new flags; offboarding bumps token_version + reassigns pending approvals.
6. **P1** Non-amount approval triggers (destination add/change).
7. **P1** Audit every team/role/invite/policy/approval mutation; ship exportable audit view.
8. **P1** Approvals inbox + policy settings screens; honor `expires_at` TTL.
9. **P2+ (backlog)** custom roles, per-account/department scoping, SCIM, multi-entity, sequential chains, card policies.

> Sequencing note: PR-6 (enforce migration + RLS) still lands first. The two P0
> schema fixes (tiered-threshold unique key + the two capability flags) can ride
> in that same migration to avoid an extra one.

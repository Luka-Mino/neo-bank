# Team-Access Security Review — "Is invite-by-email secure?"

> 2026-08-24. Triggered by the founder's concern: *"If you're adding them by
> email and then they just have access to this account, that's not very secure —
> even for a business account, is that the proper way to do it?"*
> Research: 5-angle workflow (business neobanks, institutional custodians,
> email-invite threat model, regulatory/compliance, code assessment). Every
> code-level finding below was independently re-verified by reading the files.

## Verdict

**The email-invite *pattern* is correct and universal** — Mercury, Brex, Ramp,
Revolut Business, Wise, and even Fireblocks/Anchorage/Circle all onboard members
by emailing an invite. The email is never the access; it's a signed, expiring
*claim link* that only starts an enrollment ceremony. **The email should be a
doorbell, not a key.**

**But Moneta's *current* invite flow is not secure enough to grant money access
as-is.** The token mechanics are genuinely good (HMAC-hashed at rest, atomic
single-use consume, 7-day expiry, email-bound, accepter must be a signed-in
account). What's missing are the controls that turn "invited" into "safe to hold
money." The founder's gut was right, and it wasn't vague — it correctly detected
real holes.

## Verified gaps (all confirmed in code)

| # | Gap | Verified at | Risk | Severity |
|---|-----|-------------|------|----------|
| 1 | **Capabilities not clamped to the inviter.** Create route checks role rank only, never that granted `canApprove/canMoveMoney/canExport` ≤ the inviter's own. | `orgs/invitations/route.ts:55` (role-only check); caps copied verbatim at `:96-98` → `accept/route.ts:69-71` | An admin with `canApprove=false` mints a member with `canApprove=true` — **manufacturing an approver to defeat the maker-checker control we built.** | **HIGH** |
| 2 | **`canMoveMoney` / `canExport` default to TRUE.** | `orgs/invitations/route.ts:45-46` (`.default(true)`); schema defaults; UI presets | A bare invite provisions a money-mover unless someone remembers to turn it off. Insecure default for a bank. | **HIGH** |
| 3 | **Email ownership never enforced.** `emailVerifiedAt` is written by verify-email but never checked at login or accept. | `auth/config.ts:36-120` (authorize — no `emailVerifiedAt` gate); `accept/route.ts:34-42` (matches self-asserted email only) | Attacker registers an unclaimed `cfo@victim.com` without verifying it, then accepts an invite meant for it. The "email binding" only ties access to a *self-asserted* address. | **HIGH** |
| 4 | **MFA not enforced.** 2FA is checked only if the account already has it; nothing forces enrollment. | `auth/config.ts:89-113` (conditional 2FA); no middleware gate | A brand-new member with `canMoveMoney` transacts with a **password alone.** | **MED** |
| 5 | **Single-admin money grant, no dual control.** One admin sets `canMoveMoney`/`canApprove`; the approvals engine governs *transfers*, not the *granting of the capability*. | `orgs/invitations/route.ts` POST | A single compromised/rogue admin unilaterally mints a funded money-mover. | **MED** (business-tier) |
| 6 | **Raw token returned in API response; email delivery dark.** | `orgs/invitations/route.ts:116-118` | No audited delivery channel; token is hand-carried. | **MED** |
| 7 | 7-day TTL for money-capable invites; no resend throttle. | `orgs/invitations/route.ts:102` | Wide leaked-link window. | LOW |

**Confirmed-good (don't touch):** hashed/single-use/expiring/email-bound token
(`orgs.ts`, `accept/route.ts:44-84`); live per-request membership resolution +
`tokenVersion` revocation (`auth/config.ts:183-236`); two-tier login rate limit;
magic-link still enforces 2FA (`auth/config.ts:164-171`); accept rate-limited.

## How it's done properly (the target model)

1. Admin issues a signed, short-expiry, single-use, email-bound invite — **no
   standing authority by itself.**
2. Invitee **independently authenticates** — their own per-user credential, never
   a shared login.
3. Invitee **enrolls MFA before any action** (passkey/FIDO2 preferred).
4. **Identity verified to the level the role demands** — email+MFA for low-privilege;
   full per-user KYC for anyone who can move or approve money.
5. **Least-privilege default** — invite grants the minimum, never money power.
6. **(Business) Second gate to grant money authority** — dual-admin approval to add
   or elevate a money-mover.
7. **Money movement decoupled from access** — maker-checker, initiator ≠ approver.
8. Per-user attribution + audit; periodic access review; instant offboarding.

| Tier | Identity gate | Money-authority gate | MFA bar |
|------|---------------|----------------------|---------|
| Personal | Owner is the KYC'd person | N/A (one owner) | MFA enrolled, mostly invisible |
| Business | Entity KYB'd; privileged users individually KYC'd | Maker-checker + dual-admin grant | Mandatory MFA |
| Institutional | Per-user KYC/sanctions | M-of-N quorum; add-user itself approved | Hardware/passkey; SSO/SCIM |

## Recommendation

**Stage 0 — must-fix before any invited user can touch real money (all small):**
1. Enforce `emailVerifiedAt` at login **and** accept.
2. Flip `canMoveMoney`/`canExport` defaults to **FALSE**.
3. **Clamp granted capabilities to the inviter's own** (not just role).
4. Enforce MFA enrollment before any money/privileged action (middleware gate).
5. Stop returning the raw token in the API response; wire audited email delivery.

Ship 1–5 and "invite by email → instant money access" is no longer true.

**Stage 1 — business-tier hardening (before real business customers):**
6. Dual-admin approval to grant/elevate money authority (reuse the approvals engine).
7. Per-user KYC for privileged roles (reuse Dakota individual application).
8. Admin alert on every new grant; fresh session after accept.
9. Shorten money-capable invite TTL to 24–72h; resend throttle.

**Stage 2 — scale (nice-to-have):** access recertification; SSO/SAML + SCIM;
phishing-resistant MFA as the enforced default for money-movers.

**Bottom line:** the fix is not to abandon email invites — it's to make the email
a doorbell, not a key. Stage 0 is five small, well-scoped changes against code that
is already mostly solid.

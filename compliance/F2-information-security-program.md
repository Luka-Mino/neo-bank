> DRAFT – for counsel review. Not legal advice.
> Date: 2026-11-24 · Status: DRAFT – for counsel · Owner: [QUALIFIED INDIVIDUAL] · Version 0.1

# F2: Written information security programme

**Entity:** [ENTITY NAME] ("Moneta"). **Approved by:** [BOARD] on [DATE]. **Next review:** [DATE], then at least yearly.

## 1. Why we have this

The FTC Safeguards Rule (16 CFR Part 314) requires a non-bank "financial institution" to keep a written information security programme with the elements in 16 CFR 314.4 ([FTC guide](https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know)). Moneta collects and holds customers' nonpublic personal information: names, emails, transaction history, linked-bank details and Dakota customer IDs. So it is very likely a financial institution under the Rule in its own right. At the least, Dakota and its banks will require the same controls by contract ([research notes §3](<../research_notes/Moneta licensing and permits/us_consumer_privacy_operational.md>)). Partner due diligence also asks for this document ([notes Q4, item 10](<../research_notes/Moneta licensing and permits/federal_and_dakota_model.md>)).

- `[COUNSEL: confirm Moneta is a "financial institution" under the Rule, not only a service provider to Dakota.]`
- `[COUNSEL: 16 CFR 314.6 exempts institutions holding data on fewer than 5,000 consumers from some provisions. We plan to comply in full anyway. Confirm which provisions it covers.]`

**Scope:** all customer information Moneta holds, or vendors hold for it. That covers the production app, database, backups, logs, email, the support inbox, vendor consoles, staff laptops and the wallet signing key.

## 2. Who does what

| Area | Dakota | Moneta |
|---|---|---|
| Identity documents, SSN, date of birth, proof of address | Collects and stores them through its hosted KYC form | Never receives them. Stores only the Dakota customer ID, KYC status and reason code (`dakota_customers`) |
| Card number, expiry, CVV | Shown in hosted frames (Cards.js); never pass through our server | Mints a single-use, 5-minute reveal session (`src/app/api/cards/[id]/reveal-session/route.ts`) |
| Wallet signing | Verifies signatures and enforces wallet policies | Holds the only signing key today. See [F5](F5-key-management-policy.md) |
| App, database, logs, email, support inbox | — | Moneta, with the vendors in [F8](F8-vendor-register.md) |

## 3. Qualified Individual (314.4(a))

- **[QUALIFIED INDIVIDUAL]** runs this programme. Backup: [BACKUP QI].
- The role may be outsourced, but Moneta stays responsible and must oversee the provider (314.4(a)).
- Duties: keep the risk assessment current (§5), track the to-do column in §6, sign off on exceptions in writing, run incident response with [F7](F7-incident-response-plan.md), and report to the board yearly (§10).

## 4. What data we hold

| Data | Where | Protection today |
|---|---|---|
| Email, full name | Supabase `users` | Database access controls; TLS |
| Phone | `users.phone` | AES-256-GCM field encryption (`src/lib/crypto/field.ts`) |
| Password | `users.password_hash` | bcrypt, cost 12 (`src/app/api/register/route.ts`) |
| TOTP secret | `users.totp_secret` | AES-256-GCM (`src/lib/auth/totp.ts`) |
| 2FA backup codes | `two_factor_backup_codes` | HMAC-SHA256 peppered with `AUTH_SECRET`; single use |
| Email sign-in codes | `email_otp_codes` | bcrypt; 10-minute life |
| Balances and transactions | `accounts`, `transactions`, `transaction_status_history` | Balances cannot go negative (migration 0009) |
| Bank and wallet destinations | `recipients`, `destinations.details` (JSON) | Not field-encrypted. **To check** |
| Sign-in devices | `login_devices` (IP, user agent) | — |
| Audit trail | `audit_log` (actor, action, IP) | Append-only trigger (migration 0009) |
| Support requests and complaints | `support_requests` (free text), plus a copy in the support inbox | Free text may contain personal data |
| Secrets and keys | Vercel environment variables | See [F5](F5-key-management-policy.md) |

## 5. Risk assessment (314.4(b))

**Method.** Rate likelihood and impact from 1 to 3. Reassess yearly, and also before the first real customer money, before the custody redesign, when adding a vendor or product (cards, teams), and after any severity 1 or 2 incident. Keep each version.

| # | Risk | Rating | Main controls today | Gap and action |
|---|---|---|---|---|
| R1 | Theft of the wallet signing key. One key can move every customer's USDC | **Critical** | Kept in env only; never logged (`src/lib/logger.ts` redacts `private`) | Plain Vercel env, no KMS, no dual control → [F5](F5-key-management-policy.md) |
| R2 | Account takeover leads to unauthorised sends | High | bcrypt; 2FA before money moves; new-device alerts; login rate limit; session revocation | Shared rate limits (Upstash) are built but switch on only once the keys are set (plan C2, B6). The magic-link gap is fixed: accounts using email codes must sign in with password + code (C3, 2026-11-24). Sessions last 7 days with no idle timeout (decision pending) |
| R3 | One customer sees another's data | High | Org-scoped routes run inside `withOrg`; ownership checks (`src/lib/auth/ownership.ts`) | Row-level security is built and tested (migration 0021, plan C1); it protects production only once the C1 deploy steps are done. Until then, one missed org filter could leak data |
| R4 | Vendor console compromise (Vercel, Supabase, GitHub, Dakota) | High | gitleaks in CI | MFA and access reviews on consoles not yet written down (§6, access control) |
| R5 | Vulnerable dependency | Medium | `npm audit --omit=dev --audit-level=high` in CI; weekly Dependabot | No penetration test yet (§7) |
| R6 | Data loss | Medium | Supabase daily backups and point-in-time recovery (`DR-RUNBOOK.md`) | Restore never drilled (plan C6) |
| R7 | Personal data in logs or error reports | Medium | Logger redaction; Sentry `sendDefaultPii: false`; browser scrubs long digit runs | Cards.js `session` parameter not yet redacted (plan 4.5); support text is emailed in full |

## 6. Safeguards (314.4(c))

| Element | What the Rule asks | In place today | Still to do | Owner |
|---|---|---|---|---|
| **Access control** (c)(1) | Limit access to authorised users, only what they need | Every data route checks the session (`src/lib/api-handler.ts`). Roles (viewer, member, admin, owner) and capability flags (`can_move_money`, `can_approve`, `can_export`) in `src/lib/orgs.ts`. Org-scoped routes run inside `withOrg` | Deploy row-level security and connect as the restricted `moneta_app` role (C1 deploy steps). Staff: list who can reach each console; MFA on every console; remove access within 1 business day of leaving; review every quarter | [ENGINEERING LEAD] |
| **Data inventory** (c)(2) | Know what data you hold and where | §4 above | Keep §4 current; add vendors' copies from [F8](F8-vendor-register.md) | [QUALIFIED INDIVIDUAL] |
| **Encryption** (c)(3) | Encrypt customer data in transit and at rest | HTTPS on Vercel; nonce-based CSP (`src/proxy.ts`). AES-256-GCM for TOTP secrets and phone. bcrypt passwords | Confirm `DATABASE_URL` requires TLS (`sslmode=require`). Confirm Supabase encrypts storage and backups at rest. Encrypt `destinations.details` or confirm it holds only masked numbers. Give data encryption its own versioned key ([F5](F5-key-management-policy.md)) | [ENGINEERING LEAD] |
| **Secure development** (c)(4) | Secure practices for in-house apps; evaluate outside apps | CI runs gitleaks, `npm audit`, type check, tests and build (`.github/workflows/ci.yml`). Weekly Dependabot (`.github/dependabot.yml`). zod validation and a 64 KB body cap in `apiHandler` | Protect `main` and require one review before merge `[CHECK: GitHub settings]`. Review every new dependency (plan 4.6) | [ENGINEERING LEAD] |
| **MFA** (c)(5) | MFA for anyone accessing an information system, unless the QI approves an equivalent control in writing | TOTP with backup codes, or email codes. `assertMfaEnabled` blocks sends, withdrawals (`POST /api/transactions`) and internal transfers until 2FA is on | Customers can sign in and view data without 2FA. `[COUNSEL: does (c)(5) reach customers viewing their own data? If so, require 2FA at sign-in or have the QI record an equivalent control.]` Magic-link gap closed, and approval execution and recurring-transfer creation now require 2FA too (C3, 2026-11-24). MFA on all staff and console access | [QUALIFIED INDIVIDUAL] |
| **Disposal** (c)(6) | Delete customer data within 2 years of last use, unless needed for business or law | Nightly cron deletes used or expired tokens and webhook events older than 90 days (`src/app/api/maintenance/cleanup/route.ts`). Account deletion removes personal data but keeps financial records (`src/app/api/users/route.ts`) | Write a retention schedule that matches [F4](F4-aml-sanctions-policy.md) §8 and [F3](F3-complaints-policy.md) §9. Review it yearly | [QUALIFIED INDIVIDUAL] |
| **Change management** (c)(7) | Procedures for changes | Git, CI on every push, Drizzle migrations, `pg_dump` before risky migrations (`DR-RUNBOOK.md`) | Apply migrations to staging before production (plan D4); record each production migration | [ENGINEERING LEAD] |
| **Logging and monitoring** (c)(8) | Log and monitor authorised users' activity; detect unauthorised access | Append-only `audit_log` (trigger in migration 0009) covering sign-in failures, 2FA changes, team changes, internal transfers, account deletion and support requests. Redacting logger. Ops alerts for dead-lettered webhooks, stuck transactions, reconcile failures and ledger drift (`src/lib/alerts.ts`) | `logAudit` drops entries silently on error. On-chain sends and withdrawals, recipient and destination changes, and card-detail reveals write no audit entry. Sentry is not live yet (C4). Alerts go to logs and Sentry, not to a person | [ENGINEERING LEAD] |

## 7. Testing (314.4(d))

The Rule asks for continuous monitoring, or else a penetration test every year and vulnerability assessments every six months.

- **Today:** dependency scanning only.
- **Before the first external user:** an external penetration test (plan 4.6).
- **Then:** a vulnerability scan every six months, a penetration test every year, and a fresh test after a material change such as the custody redesign.
- Keep each report and its fixes for the board report (§10).

## 8. Training (314.4(e))

- Everyone with access to customer data or production does security awareness training at hire and every year. Topics: phishing, handling customer data, secrets and the signing key, and reporting incidents.
- Staff who run security get role-specific updates.
- Log name, date and topic. Owner: [QUALIFIED INDIVIDUAL].

## 9. Vendors, keeping current, incidents (314.4(f)–(h), (j))

- **Service providers (f):** [F8](F8-vendor-register.md).
- **Keeping the programme current (g):** update this file after each trigger in §5 and after any Dakota answer that changes custody.
- **Incident response plan (h) and FTC notice (j):** [F7](F7-incident-response-plan.md).

## 10. Yearly report to the board (314.4(i))

[QUALIFIED INDIVIDUAL] reports in writing to [BOARD] at least once a year. If there is no board, the report goes to a senior officer. It covers:

1. the overall state of the programme and of compliance with the Rule;
2. the risk assessment and the decisions taken on each risk;
3. vendor arrangements;
4. test results;
5. security events and how management responded;
6. recommended changes.

First report due: [DATE]. Keep each report.

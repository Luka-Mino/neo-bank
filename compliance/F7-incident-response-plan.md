> DRAFT – for counsel review. Not legal advice.
> Date: 2026-11-24 · Status: DRAFT – for counsel · Owner: [QUALIFIED INDIVIDUAL] · Version 0.1

# F7: Incident response plan

**Entity:** [ENTITY NAME] ("Moneta"). **Approved by:** [BOARD] on [DATE]. **Next review:** [DATE], then yearly and after every severity 1 incident.

## 1. Purpose

The Safeguards Rule requires a written incident response plan (16 CFR 314.4(h)). It also requires notice to the FTC after certain breaches (314.4(j)) ([FTC guide](https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know)). This plan covers security incidents, data breaches, money-movement incidents and outages.

Technical recovery steps stay in `DR-RUNBOOK.md`. This plan links to them rather than copying them.

## 2. Who does what

| Area | Dakota | Moneta |
|---|---|---|
| Wallet freezes, compliance blocks, card incidents | Acts on its side `[DAKOTA: emergency contact and out-of-hours route]` | Asks Dakota to act; contains on our side |
| Breach of Dakota's systems | Investigates and notifies under its own duties | Gets the facts in writing and assesses our own duties (§8) |
| App, database, keys, email, support | — | Moneta runs the response |

## 3. Roles

| Role | Person | Does |
|---|---|---|
| Incident lead | [ENGINEERING LEAD] | Declares the incident, sets severity, runs containment and recovery |
| Qualified Individual | [QUALIFIED INDIVIDUAL] | Owns the record. Decides on notices with counsel |
| Executive | [CEO] | Board, Dakota relationship, press |
| Customer communications | [SUPPORT LEAD] | Scripts, support inbox, in-app notices |
| Counsel | [COUNSEL] | Legal duties and notice wording. Privilege over the investigation |

One person may hold several roles. The Qualified Individual still signs the notification decision.

## 4. Severity

| Level | Examples | Response |
|---|---|---|
| **1** | Customer funds moved without authority, or at risk. Signing key or `AUTH_SECRET` exposed. Confirmed exposure of customer data. One customer able to see another's data. Full outage over 1 hour | Immediately, any hour. Tell Dakota within [24] hours |
| **2** | Suspected data exposure under investigation. One account taken over. Ledger drift. Reconcile failure. Dead-lettered webhooks affecting balances. Partial outage | Within 4 business hours |
| **3** | A security-relevant bug with no data exposed. A blocked attack | Next business day |

## 5. How we find out

- **Ops alerts** (`src/lib/alerts.ts`): `webhook_dead_letter`, `transaction_stuck`, `reconcile_failed`, `ledger_drift`. Today these go to logs, and to Sentry once it is live (plan C4). Route them to a person: [ALERT CHANNEL].
- **Audit log:** spikes in `login_failed` or `login_rate_limited`, unexpected `sessions_revoked` or 2FA changes.
- **Support requests** in the `fraud` category ([F3](F3-complaints-policy.md) §7).
- **Outside sources:** notices from Dakota or other vendors, gitleaks or Dependabot alerts, and security reports. `SECURITY.md` promises acknowledgement within 3 business days, but its address (`security@moneta.example`) is a placeholder. Set a real inbox.

## 6. Response steps

1. **Declare.** Open an incident record with the time of discovery. The 30-day FTC clock runs from discovery (§8). `[COUNSEL: when exactly does "discovery" happen?]`
2. **Contain.** Use the playbook in §7.
3. **Preserve evidence** before changing anything:
   - Take a `pg_dump` (`DR-RUNBOOK.md`).
   - Export Vercel and Sentry logs early, because they are kept only for a limited time `[CHECK: retention on our plan]`.
   - The `audit_log` is append-only, so don't try to "clean" it.
   - Keep a timeline in UTC.
4. **Recover.** Follow the `DR-RUNBOOK.md` restore steps and its post-incident checklist: health green, ledger drift 0, migrations current, reconcile caught up, no audit-log gap, exposed secrets rotated.
5. **Notify.** Use the matrix in §8. Record the decision and the reasons, even when no notice is needed.
6. **Review** within 10 business days. Find the root cause and the fixes, with owners and dates. Update the [F2](F2-information-security-program.md) risk assessment.

## 7. Playbooks

**A. Signing key exposed:** follow [F5](F5-key-management-policy.md) §4 "Compromise". Removing `DAKOTA_SIGNER_PRIVATE_KEY` from Vercel and redeploying stops every on-chain send. Internal transfers keep working.

**B. Unauthorised sends from customer accounts.** Follow the fraud steps in [F3](F3-complaints-policy.md) §7 for each customer. If several accounts are hit, consider stopping all sends with the step in A. Report to Dakota.

**C. Customer data exposed:** a database leak, a leaked `DATABASE_URL`, a Supabase compromise, or one customer seeing another's data.
1. Rotate the database password.
2. Find out which tables and fields were exposed.
3. Note which data was encrypted: 2FA secrets and phone numbers are encrypted; most other data is not.
4. If `AUTH_SECRET` may also be exposed, rotate it following [F5](F5-key-management-policy.md) §7.
5. Go to §8.

**D. Secret leaked** (a gitleaks hit, or pasted somewhere). Rotate it following `DR-RUNBOOK.md` "Secret rotation", then check the provider's logs for use.

**E. Outage or data loss.** Follow the `DR-RUNBOOK.md` restore procedures. Targets: lose at most 24 hours of data, and be back within 1 hour.

**F. Ledger drift or reconcile failure:**
1. Compare Moneta's account balances with the on-chain wallet and Dakota's records.
2. Run `npm run dakota:reconcile`.
3. No manual balance edits without two people and an audit note.

**G. Vendor incident** (Dakota, Vercel, Supabase, Resend, Sentry): get the vendor's facts in writing, and check [F8](F8-vendor-register.md) for what that vendor holds. `[COUNSEL: do our notice duties apply when the breach is at a vendor?]`

**H. Phishing that pretends to be Moneta:** warn customers in-app and by email, and ask the host and registrar to take the site down.

**Gap.** Moneta has no switch that pauses all money movement. Add a `MONEY_MOVEMENT_PAUSED` flag that the send, withdrawal and internal-transfer routes check.

## 8. Who to notify

| Who | When | Trigger | Source |
|---|---|---|---|
| **FTC**, by its online form | As soon as possible, **no later than 30 days after discovery** | Unauthorised acquisition of **unencrypted** customer information about **500 or more** consumers | 16 CFR 314.4(j) ([FTC](https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know)) |
| **Affected people and state authorities** | By each state's law. **California and New York: 30 days.** About 20 states set fixed deadlines | Personal information as each state defines it. Every state has an encryption safe harbour | All 50 states and DC have laws ([Privacy Rights Clearinghouse 2026](https://privacyrights.org/resources-tools/reports/data-breach-notification-laws-50-state-survey-2026-edition); [Perkins Coie](https://perkinscoie.com/insights/update/2025-breach-notification-law-update)) |
| **Dakota**, and its bank as the contract requires | Within [24] hours for severity 1 `[DAKOTA: contract term]` | Anything touching Dakota data, wallets, keys or customer funds | Contract |
| **Law enforcement** | For theft or extortion | Funds stolen, ransom demand | Proposal |
| **Insurers** | As each policy requires | Any likely claim | Policy |
| **Customers whose funds are at risk** | As soon as it is safe, even if no law requires it | Severity 1 involving their money | Proposal |

**FTC notice contents.** `[COUNSEL: confirm the form's fields and the rule on delay at law enforcement's request. Our understanding is that it asks for contact details, the types of information involved, the date or date range, the number of consumers, a description of the event, and whether law enforcement asked for a delay.]`

**State laws.** Counsel keeps a state-by-state notice matrix, keyed to where affected customers live. Some states also require notice to the attorney general above a threshold, and six require free credit monitoring ([Privacy Rights Clearinghouse 2026](https://privacyrights.org/resources-tools/reports/data-breach-notification-laws-50-state-survey-2026-edition)).

**If counsel decides Moneta is an MSB:** a cyber event may also need a SAR ([F4](F4-aml-sanctions-policy.md) §12) `[COUNSEL]`.

## 9. Records

For each incident, keep the record for at least [5] years `[COUNSEL]`:
- the timeline and evidence;
- the decisions and their reasons;
- the notices sent, with dates;
- the review.

Incidents are summarised in the yearly board report ([F2](F2-information-security-program.md) §10).

## 10. Testing

- Run a tabletop exercise twice a year. Rotate the scenario: signing key theft, account takeover wave, database leak, Dakota outage.
- Run the restore drill (plan C6) once a year and after major schema changes.
- Record the findings and fixes.

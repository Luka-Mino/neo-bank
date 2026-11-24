> DRAFT – for counsel review. Not legal advice.
> Date: 2026-11-24 · Status: DRAFT – for counsel · Owner: [SUPPORT LEAD] · Version 0.1

# F3: Complaints policy

**Entity:** [ENTITY NAME] ("Moneta"). **Approved by:** [CEO] on [DATE]. **Next review:** [DATE], then yearly.

## 1. Purpose and definition

This policy covers how Moneta takes in, handles, records and learns from customer complaints.

A **complaint** is any expression of dissatisfaction with Moneta or with a service reached through Moneta, by any channel, whether or not the customer uses the word "complaint". A message filed as a "question" that expresses dissatisfaction is a complaint.

Why it matters: after Synapse, bank regulators named "inadequate complaint administration and error resolution processes" as a key risk in bank-fintech arrangements ([2024 Joint Statement](https://fdic.gov/joint-statement-third-party-deposit-products.pdf)). The Evolve order required fintech partners to have complaint "identification, categorization, investigation, response, root cause and/or trend identification and analyses, remediation tracking, remediation validation, and periodic reporting to the Bank" ([Federal Reserve](https://www.federalreserve.gov/newsevents/pressreleases/files/enf20240614a1.pdf)). Dakota and its bank will expect the same ([research notes Q4, item 7](<../research_notes/Moneta licensing and permits/federal_and_dakota_model.md>)).

## 2. Who does what

| Task | Dakota | Moneta |
|---|---|---|
| Customer support and complaints | Dakota's model puts this with the platform: "Your team owns the customer relationship … Support" ([Dakota Compliance](https://www.dakota.xyz/compliance)) | Intake, acknowledgement, investigation, reply, records, root-cause review |
| Regulated-service complaints (licences) | Named as the complaint contact for each licensed state, with escalation to the state regulator ([Dakota Licenses](https://www.dakota.xyz/licenses)) | Forwards complaints about Dakota's services. Asks Dakota to forward complaints about Moneta `[DAKOTA: confirm both directions in the contract]` |
| KYC decisions, proof-of-address freezes ($3,000 per rolling 7 days), compliance blocks | Decides and reviews | Explains what the customer can do, forwards the complaint |
| Card disputes | Files them with Visa after Moneta reports them | Takes the report and forwards it (§7) |

## 3. Intake

**Main channel: Help & support** (`/app/more/help`; `POST /api/support`). For each request the code:
- saves it in `support_requests` with a `SUP-XXXXXX` reference, a category and status `open`;
- shows the customer an in-app notification with the reference;
- emails a copy to `SUPPORT_EMAIL` (if that variable is not set, the request is saved without an inbox copy);
- writes a `support.request_created` audit entry.

"Report a problem with this payment" on a transaction opens the same form with the payment linked. The server checks the payment belongs to the customer's org.

**Other channels:** email, social media, letters, and referrals from Dakota or a regulator. Staff log each one in `support_requests` with a `SUP-` reference on the day it arrives. There is no staff screen yet, so this is a database insert (plan 1c.3 follow-up).

## 4. Categories

The form sets one of four categories: `question`, `complaint`, `card_dispute`, `fraud`.

During handling, staff also record a **root cause** from this list, in the monthly review log until the table has a field for it:
- deposit not credited;
- withdrawal or send delayed or failed;
- fees;
- sign-in, 2FA or account access;
- identity verification (Dakota);
- card;
- unauthorised activity;
- unclear or misleading information;
- privacy;
- outage;
- staff conduct;
- other.

## 5. Response times

These are proposed targets. Business hours are [SUPPORT HOURS].

| Type | Acknowledge | First reply from a person | Resolve |
|---|---|---|---|
| Question | Immediately (automatic reference) | 2 business days | — |
| Complaint | Immediately | 2 business days | Final written reply within 15 business days. If more time is needed, send a written update with a date. Final reply no later than [35] business days `[COUNSEL]` |
| Fraud or unauthorised activity | Immediately | Same business day | See §7. Regulation E clocks may apply (§11) |
| Card dispute | Immediately | 1 business day; forward to Dakota within 1 business day | Per Dakota, the issuer and §11 |
| From a regulator, attorney general or Dakota | — | Acknowledge within 1 business day | By the sender's deadline |

## 6. How to handle a complaint

1. Check the category. Re-categorise if needed and record why.
2. Set status `in_progress` and name an owner.
3. Investigate. Use the transaction, its status history, the audit log, `login_devices` and Dakota's dashboard.
4. If it involves Dakota's services, forward it. Set status `forwarded`, with `forwarded_to`, `forwarded_at` and Dakota's reference in `external_reference`. Tell the customer, as the Help page promises.
5. **Never mention a suspicious-activity referral or report** to the customer, even indirectly ([F4](F4-aml-sanctions-policy.md) §6). Use the approved wording for compliance holds `[COUNSEL: approve a script]`.
6. Reply in writing with the outcome, the reasons, any remedy, and how to take it further: to Dakota for regulated services and to the state regulator `[COUNSEL: state-specific wording, from Dakota's licences page]`.
7. Set status `resolved` and `resolved_at`, and record the root cause.

**Remedies:** fix the error, refund Moneta fees, or correct records. Goodwill payments over $[X] need [CEO] approval.

## 7. Fraud and card disputes

**Fraud or unauthorised activity**
1. Triage the same business day. Ask the customer to change their password and turn on 2FA. The Help page already says this.
2. Revoke all sessions. `revokeSessions` bumps `tokenVersion`, which signs out every device.
3. Freeze the customer's cards.
4. Check `login_devices`, failed sign-ins and recent sends in the audit log and `transactions`.
5. On-chain sends cannot be reversed. Report to Dakota at once as a red flag ([F4](F4-aml-sanctions-policy.md) §6).
6. If several accounts show the same pattern, or our systems may be at fault, open an incident ([F7](F7-incident-response-plan.md)).
7. Gap: there is no account-level hold on money movement. Add one. `[COUNSEL: when may Moneta hold a customer's funds, and for how long?]`

**Card disputes** (Dakota Cards is sandbox-only today, so none are live yet)
1. Collect the card, the transaction, the amount, the reason, and the date the customer noticed.
2. Forward to Dakota within 1 business day: by hand for now, and later through `POST /card_dispute_reports` with the `SUP-` reference as `client_reference` (plan 5.3).
3. Set status `forwarded` and follow up until Dakota reports the outcome.

## 8. Escalation

| Level | Who | When |
|---|---|---|
| 1 | Support | All requests |
| 2 | [SUPPORT LEAD] | Past the response target, the customer is unhappy with the reply, or the amount is over $[X] |
| 3 | [COMPLIANCE CONTACT] | Threat of legal action, a regulator or the media mentioned, alleged discrimination or misleading conduct, a suspected systemic issue, possible suspicious activity |
| 4 | [CEO] and counsel | Regulator contact, possible data breach ([F7](F7-incident-response-plan.md)), or a pattern across many customers |

## 9. Records

- Keep each complaint with its correspondence, investigation notes and outcome for [5] years `[COUNSEL: period; match Dakota's contract]`.
- The record lives in `support_requests` plus the support inbox thread, linked by the `SUP-` reference. Set the inbox to keep mail, not auto-delete.
- Account deletion keeps support records, because it anonymises the user instead of deleting the row.
- **Code gaps:**
  - `support_requests.user_id` is `ON DELETE CASCADE`, so a hard delete of a user would erase their complaints. Change it to `RESTRICT`.
  - The data export (`/api/users/data`) does not include support requests. Add them.

## 10. Monthly review

[SUPPORT LEAD] and [COMPLIANCE CONTACT] review the past month and write a one-page memo. It covers:
- counts by category and root cause;
- time to first reply and to resolution, and missed targets;
- complaints open for more than 15 business days;
- repeat complainants;
- requests forwarded to Dakota, and their status;
- themes that point to misleading copy (send these to the [F9](F9-marketing-review-checklist.md) reviewer) or to security weaknesses (send these to [F2](F2-information-security-program.md)).

Each theme gets a fix, an owner and a date. The next review checks that the fix worked. Send the memo to Dakota or the bank when the contract requires it `[DAKOTA: frequency and format]`.

## 11. Regulation E: flags for counsel

- **The debit card** is within Regulation E. The issuing bank is the "financial institution", and the bank will require Dakota and Moneta to run its processes ([research notes §2](<../research_notes/Moneta licensing and permits/us_consumer_privacy_operational.md>)).
  - Error resolution (12 CFR 1005.11): investigate within 10 business days, or up to 45 days with provisional credit, and give written results.
  - Consumer liability limits: 12 CFR 1005.6.
  - `[COUNSEL: confirm the consumer's 60-day notice window and the longer periods for new accounts and point-of-sale transfers. These come from general knowledge, not the research notes.]`
  - Whether the card is debit or prepaid decides whether the prepaid disclosures (1005.18) apply `[COUNSEL + DAKOTA]`.
- **USDC balances, ACH and on-chain sends:** whether Regulation E applies is an open question. The CFPB withdrew its stablecoin interpretive rule on 15 May 2025. Lead Bank's Funds Transfer Agreement says transfers through Dakota "are not subject to Regulation E, including the error resolution procedures" ([Lead Bank FTA](https://www.dakota.xyz/funds-transfer)). The research recommends adopting Regulation E-style error resolution voluntarily, which conflicts with that disclaimer.
- **Interim rule until counsel decides:** treat any report of an unauthorised or incorrect transfer as a possible error notice. Record the date received, aim to finish within 10 business days, and give the result in writing.
- `[COUNSEL + DAKOTA: who gives provisional credit, and who bears the loss, for card and non-card errors?]`

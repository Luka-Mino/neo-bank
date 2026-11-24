> DRAFT – for counsel review. Not legal advice.
> Date: 2026-11-24

# Compliance pack

These are drafts for Moneta's lawyer. Moneta runs on Dakota Platform, Inc., a FinCEN-registered, state-licensed money transmitter (NMLS #2727274). The drafts are written for a platform that relies on Dakota's compliance programme, not for a licensed money transmitter. Each one says which parts Dakota covers and which are Moneta's.

Background:
- `PRE-DAKOTA-PLAN.md` §7 (what each document must cover);
- `reports/Moneta licensing and permits.md`;
- `research_notes/Moneta licensing and permits/`.

## Documents

| # | Document | Purpose | Status | Owner |
|---|---|---|---|---|
| F1 | [Dakota application text](F1-dakota-application-text.md) | Text for Dakota's KYB and enhanced due diligence forms, with a slot for counsel's "unregulated justification" | DRAFT – for counsel | [CEO] |
| F2 | [Information security programme](F2-information-security-program.md) | The written programme the GLBA Safeguards Rule (16 CFR 314) requires. Each element is mapped to what the code does today and what is still to do | DRAFT – for counsel | [QUALIFIED INDIVIDUAL] |
| F3 | [Complaints policy](F3-complaints-policy.md) | Intake through the Help & support form, categories, response times, escalation, card disputes to Dakota, records, monthly root-cause review. Flags Regulation E | DRAFT – for counsel | [SUPPORT LEAD] |
| F4 | [AML and sanctions policy](F4-aml-sanctions-policy.md) | Platform controls beside Dakota's BSA/AML programme: compliance contact, red-flag referral, geo-blocking, records, training. Says what changes if Moneta is an MSB or Dakota's agent | DRAFT – for counsel | [COMPLIANCE CONTACT] |
| F5 | [Key-management policy](F5-key-management-policy.md) | Life cycle of the wallet signing key and other secrets: today's platform-only signer, a future required user passkey, or a Dakota-hosted wallet | DRAFT – for counsel | [ENGINEERING LEAD] |
| F6 | [Wind-down plan](F6-wind-down-plan.md) | If Moneta stops: triggers, funding, customer notice, how people withdraw, unclaimed balances, data export, timeline | DRAFT – for counsel | [CEO] |
| F7 | [Incident response plan](F7-incident-response-plan.md) | Roles, severity, playbooks, and breach notices (FTC within 30 days for 500 or more people; state laws) | DRAFT – for counsel | [QUALIFIED INDIVIDUAL] |
| F8 | [Vendor register](F8-vendor-register.md) | Each vendor's role, the data it holds, criticality, assurance, contract owner, and how vendors are checked | DRAFT – for counsel | [QUALIFIED INDIVIDUAL] |
| F9 | [Marketing review checklist](F9-marketing-review-checklist.md) | Banned claims, required disclosures, live copy to fix, sign-off workflow | DRAFT – for counsel | [COMPLIANCE CONTACT] |

## Placeholders and markers

**People and entity.** Not yet decided. One person may hold several roles before launch:
- `[ENTITY NAME]`, `[BOARD]`, `[CEO]`;
- `[QUALIFIED INDIVIDUAL]` (and backup);
- `[COMPLIANCE CONTACT]` (and backup);
- `[ENGINEERING LEAD]`, `[SUPPORT LEAD]`, `[RECORDS CUSTODIAN]`.

**Values.** `[DATE]`, `[N]`, `[X]`, `[TBD]`. Bracketed numbers such as `[5]` years or `[24]` hours are proposals to confirm.

**Markers:**
- `[COUNSEL: …]` is a question for the lawyer.
- `[DAKOTA: …]` is a question for Dakota.
- `[DECIDE: …]` is a business decision.
- `[CHECK: …]` is a fact to verify in a vendor console or setting.

## Open questions for counsel

**Status (drives everything else)**
1. Is Moneta an MSB, Dakota's agent, or neither? How does the answer change with the custody design ([F4](F4-aml-sanctions-policy.md) §1 and §12; [F5](F5-key-management-policy.md))?
2. Is Moneta a "financial institution" under the Safeguards Rule in its own right? Which provisions does the under-5,000-consumer exemption (16 CFR 314.6) remove ([F2](F2-information-security-program.md) §1)?
3. Does the Rule's MFA requirement (314.4(c)(5)) reach customers viewing their own data? Today 2FA is required only before moving money ([F2](F2-information-security-program.md) §6).

**AML and sanctions**

4. Must each business-account team member who can move money pass their own KYC ([F4](F4-aml-sanctions-policy.md) §2)?
5. Does SAR confidentiality (31 U.S.C. 5318(g)(2)) bind Moneta as a non-MSB? Approve a support script for compliance holds ([F4](F4-aml-sanctions-policy.md) §6; [F3](F3-complaints-policy.md) §6).
6. When may Moneta hold a customer's funds on its own, for example to stop fraud, and for how long ([F3](F3-complaints-policy.md) §7; [F4](F4-aml-sanctions-policy.md) §6)?
7. While Moneta holds the only key, who is the "holder" of blocked USDC that reports to OFAC ([F4](F4-aml-sanctions-policy.md) §7)?
8. How should law-enforcement requests be handled, and when is Dakota told ([F4](F4-aml-sanctions-policy.md) §11)?

**Complaints and Regulation E**

9. The deadline for final complaint responses, and the state-specific escalation wording ([F3](F3-complaints-policy.md) §5–6).
10. Regulation E:
    - confirm the card timelines, including the consumer's 60-day notice window;
    - is the card debit or prepaid?
    - do USDC balances, ACH and on-chain sends fall under Regulation E?
    - should Moneta adopt Regulation E-style error resolution despite Lead Bank's disclaimer?
    - who gives provisional credit and who bears losses ([F3](F3-complaints-policy.md) §11)?

**Wind-down**

11. Minimum notice to end the service. The Terms need a clause on discontinuing the service ([F6](F6-wind-down-plan.md) §6).
12. Should the wind-down reserve be ring-fenced ([F6](F6-wind-down-plan.md) §5)?
13. Unclaimed-property rules for USDC, and whether the duty sits with Moneta or Dakota ([F6](F6-wind-down-plan.md) §8).
14. Required notice content, the estate process, the card settlement window, and how long data export stays open after closure ([F6](F6-wind-down-plan.md) §7–9).

**Incidents and vendors**

15. When "discovery" starts the FTC 30-day clock; the FTC form's required content; delay at law enforcement's request ([F7](F7-incident-response-plan.md) §6, §8).
16. Do our notice duties apply when the breach is at a vendor? Who maintains the state-by-state notice matrix ([F7](F7-incident-response-plan.md) §7–8)?
17. If Moneta is an MSB, does a cyber event need a SAR ([F7](F7-incident-response-plan.md) §8)?
18. The breach-notice period to require in vendor contracts; proposed 72 hours ([F8](F8-vendor-register.md) §5).

**Marketing**

19. Can a non-bank use "Checking" and "Savings" in our target states ([F9](F9-marketing-review-checklist.md) §4)?
20. May we repeat Circle's reserve statements with attribution? Is "digital dollar" acceptable ([F9](F9-marketing-review-checklist.md) §4)?
21. Is "may lose value" required next to USDC balances? Approve the final wording naming Dakota as the regulated provider ([F9](F9-marketing-review-checklist.md) §5).

**Records**

22. Retention periods for complaints, incidents and marketing approvals. The drafts propose 5 years. BSA records are 5 years and OFAC records 10 ([F3](F3-complaints-policy.md) §9; [F4](F4-aml-sanctions-policy.md) §8; [F7](F7-incident-response-plan.md) §9; [F9](F9-marketing-review-checklist.md) §9).

## Questions for Dakota these drafts depend on

These add to the list in `PRE-DAKOTA-PLAN.md` A1:
- **Emergency wallet freeze** and an out-of-hours contact ([F5](F5-key-management-policy.md), [F7](F7-incident-response-plan.md)).
- **Recovery path** for a lost governance key ([F5](F5-key-management-policy.md)).
- **What our API key can do** without a wallet signature ([F5](F5-key-management-policy.md)).
- **Whether Dakota files SARs on every flow it performs,** its referral channel, and response times for requests for information ([F4](F4-aml-sanctions-policy.md)).
- **Contract terms:**
  - complaint forwarding in both directions, and reporting frequency ([F3](F3-complaints-policy.md));
  - the scope of marketing pre-approval ([F9](F9-marketing-review-checklist.md));
  - the incident notice deadline ([F7](F7-incident-response-plan.md)).
- **Customer access without Moneta:** can end users reach their wallets, or move to another platform, if Moneta stops ([F6](F6-wind-down-plan.md))?
- **Partners and assurance:** which bank and card processor serve this programme, and the SOC 2 report ([F8](F8-vendor-register.md)).

## Review status

| Date | Event |
|---|---|
| 2026-11-24 | F2–F9 drafted. Not yet reviewed by counsel |

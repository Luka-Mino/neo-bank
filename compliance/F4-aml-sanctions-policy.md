> DRAFT – for counsel review. Not legal advice.
> Date: 2026-11-24 · Status: DRAFT – for counsel · Owner: [COMPLIANCE CONTACT] · Version 0.1

# F4: Anti-money-laundering and sanctions policy (platform controls)

**Entity:** [ENTITY NAME] ("Moneta"). **Approved by:** [BOARD] on [DATE]. **Next review:** [DATE], then yearly.

## 1. What this policy is, and what it is not

These are **platform-level controls that sit beside Dakota's BSA/AML programme.** They are not a full anti-money-laundering programme for a money services business (MSB) under 31 CFR 1022.210.

Dakota says "KYC, KYB, sanctions screening and monitoring run on every customer and every payment, under Dakota's licenses and BSA/AML program" ([Dakota Compliance](https://www.dakota.xyz/compliance)). Counsel has not yet decided Moneta's own status.

The research finds that while Moneta's server holds the only wallet signing key, Moneta is very likely a money transmitter in its own right ([31 CFR 1010.100(ff)(5)](https://www.ecfr.gov/current/title-31/subtitle-B/chapter-X/part-1010/subpart-A/section-1010.100); [FIN-2019-G001 §4.2.1](https://www.fincen.gov/system/files/2019-05/FinCEN%20CVC%20Guidance%20FINAL.pdf); [report](<../reports/Moneta licensing and permits.md>)). Treat this document as the minimum. §12 lists what changes with counsel's answer.

Even if Moneta is not an MSB, Dakota and its banks will require by contract a written compliance programme, a named contact, sanctions controls and suspicious-activity referral ([research notes Q2](<../research_notes/Moneta licensing and permits/federal_and_dakota_model.md>)).

`[COUNSEL: Moneta's MSB or agent status. It depends on the custody design in F5.]`

## 2. Who does what

| Control | Dakota | Moneta |
|---|---|---|
| Identity checks (KYC/KYB): name, date of birth, SSN, address, ID document, source of wealth, purpose | Runs its hosted form and approves or declines | Sends users to the hosted form. Does not build its own KYC screens |
| Proof of address for over $3,000 in a rolling 7 days | Freezes the customer until it is provided | Shows the status (`poa_status`) |
| Sanctions screening of customers and wallet addresses | Screens every customer and payment | Geographic controls (§7). Never works around a block |
| Transaction monitoring and alert review | Runs it; "works every alert, with yours when it needs your customer's context" | Gives context when asked (§11). Reports the red flags it sees (§6) |
| Suspicious activity reports (SARs) | Files them `[DAKOTA: confirm it files for every flow it performs]` | Refers. Does not file today (see §12) |
| 35 prohibited jurisdictions and prohibited uses ([list](https://support-platform.dakota.xyz/articles/7395041356-prohibited-jurisdictions)) | Terms and screening | Geo-blocking (§7); Moneta Terms clauses 3.3 and 9 |
| Blocked sends | Returns `compliance-blocked` (HTTP 422) | Shows the message. Does not retry with changed details |
| Transfers between the same customer's own accounts | Not involved | Moneta's own records (`performInternalTransfer`, same org only) |
| Team members of a business account | Checks the business (KYB) | Members who can move money are not yet identity-checked one by one (Team Access Stage 1). `[COUNSEL + DAKOTA: is per-person KYC required?]` |

## 3. Compliance contact

**[COMPLIANCE CONTACT]** owns this policy. Backup: [BACKUP COMPLIANCE CONTACT]. Duties:
- receive red-flag reports from staff, and refer them to Dakota (§6);
- keep the referral log and answer Dakota's requests (§11);
- run training (§9);
- report each quarter to [CEO] and each year to [BOARD];
- track rule changes. Current items:
  - FinCEN's April 2026 proposed AML programme rule ([FR 2026-07033](https://www.federalregister.gov/documents/2026/04/10/2026-07033/anti-money-laundering-and-countering-the-financing-of-terrorism-programs));
  - the GENIUS Act from 18 January 2027;
  - Illinois digital-asset registration by 1 July 2027.

## 4. Risk assessment (summary)

| Factor | Today |
|---|---|
| Products | USDC wallet on Base. ACH in through per-customer account details, and ACH out. On-chain sends to outside wallets (screened by Dakota). Moves between the same customer's accounts. Virtual card (Dakota sandbox only). Team accounts with approvals |
| Not offered | Cash, rewards, RD, user-to-user book transfers |
| Customers | Undecided: US consumers or US businesses (decision D9) |
| Channel | Fully remote: web and mobile |
| Geography | Dakota's 20 licensed jurisdictions. California and New York excluded until resolved |

Main scenarios, highest first:
1. **Account takeover.** A stolen login sends funds out ([F2](F2-information-security-program.md) R2).
2. **Pass-through or money mule.** ACH in, then an immediate send to an outside wallet.
3. **Scam victims.** Customers send to investment or romance scam wallets.
4. **Third-party use.** Nominee accounts, or withdrawals to bank accounts not in the customer's name. Linked banks are not name-matched today ([F1](F1-dakota-application-text.md)).
5. **Sanctions evasion.** Access through a VPN from a prohibited jurisdiction.
6. **Unchecked team members.** People in business accounts who can move money without their own KYC.
7. **Structuring** to stay under the $3,000 proof-of-address limit.

Keep a fuller, versioned risk assessment before launch. FinCEN's April 2026 proposal would make one mandatory for MSBs ([research notes Q2](<../research_notes/Moneta licensing and permits/federal_and_dakota_model.md>)).

## 5. Product controls ("hold the line")

- **Not built:** no rewards, RD, Moneta-to-Moneta book transfers, or new server-initiated on-chain sends (plan 1c.4).
- **Internal transfers** only move money between accounts of the **same** customer.
- **Payments to other people** go on-chain through Dakota, so Dakota screens each one. Book transfers between customers would make Moneta keep Travel Rule records for each transfer of $3,000 or more ([FIN-2019-G001 §2](https://www.fincen.gov/system/files/2019-05/FinCEN%20CVC%20Guidance%20FINAL.pdf)).
- **No pooled wallet:** each customer has their own wallet.
- **Gates before money moves:** sends require the customer's Dakota KYC status to be `active`, so frozen customers are blocked (`src/app/api/transactions/route.ts`), plus a verified email and 2FA.
- **Decide before launch:** match linked bank accounts to the customer's name.

## 6. Red flags and referral to Dakota

**Report the same day to [COMPLIANCE CONTACT]** if you see:
- a deposit followed within hours by a send of most of it to an outside wallet;
- many small deposits or sends that look designed to stay under a limit;
- many customers sending to the same outside wallet, or one customer to many new wallets;
- sign-ins from a country that doesn't match the address, or from Tor or VPN exits near a prohibited jurisdiction;
- changes to email, phone or 2FA, then a large send soon after;
- a customer who seems coached, mentions an "investment platform", or is sending to someone they met online;
- withdrawals to a bank account in another person's name;
- a customer who refuses information, gives information that conflicts with their profile, or asks how to avoid checks;
- a business account where unknown people join and move money;
- activity that doesn't fit the customer's stated purpose or size;
- a news report or tip linking a customer to crime or sanctions.

**Referral steps**
1. Tell [COMPLIANCE CONTACT] the same day. Don't investigate further and don't confront the customer.
2. [COMPLIANCE CONTACT] reviews within 1 business day and records it in the **referral log**. Only [COMPLIANCE CONTACT] and the backup can see the log. It is not kept in `support_requests`.
3. If in doubt, refer to Dakota within [2] business days of detection through [DAKOTA COMPLIANCE CHANNEL]. Include:
   - Dakota customer ID and our user and org IDs;
   - transaction IDs, amounts, dates and on-chain hashes;
   - what we saw, and why it is unusual.
4. Dakota decides whether to file a SAR. For MSBs the threshold is $2,000 and the deadline is 30 days ([31 CFR 1022.320](https://www.ecfr.gov/current/title-31/subtitle-B/chapter-X/part-1022/subpart-C/section-1022.320)).
5. Tell Dakota about further activity. Don't restrict or close the account only because of a referral, except to stop clear fraud. `[COUNSEL: when may Moneta act alone?]`

**Confidentiality.** Federal law bars disclosing a SAR, or anything that would reveal one, to anyone involved in the transaction (31 U.S.C. 5318(g)(2)). `[COUNSEL: does this bind Moneta as a non-MSB?]` We follow it anyway: never tell the customer, or anyone outside compliance, about a referral. Support uses the approved wording ([F3](F3-complaints-policy.md) §6).

## 7. Sanctions

OFAC liability is strict: a violation counts even without intent. OFAC expects a programme with five parts: management commitment, risk assessment, internal controls, testing, and training ([OFAC Framework, 2019](https://ofac.treasury.gov/media/16331/download?inline)). Its virtual-currency guidance adds IP blocking and wallet screening ([OFAC VC guidance, 2021](https://ofac.treasury.gov/media/913571/download?inline)). Dakota screens customers and wallets. Moneta adds:

1. **Geo-blocking (to build).** Block sign-up and sign-in from IP addresses in comprehensively sanctioned jurisdictions and in Dakota's 35 prohibited jurisdictions. Refresh the list every quarter from Dakota's page. A mismatch between IP country and address is a red flag (§6).
2. **Residence gate.** Serve only states Dakota supports, excluding California and New York. Plan 1c.5 waits on Dakota's answer (A1 Q4): if Dakota enforces this at KYC, we build nothing.
3. **No workarounds.** Don't retry a blocked send with changed details. Don't sign any send for a customer Dakota has frozen.
4. **Possible match.** If staff learn a customer may be sanctioned, stop processing, tell [COMPLIANCE CONTACT], and refer to Dakota the same day.
5. **Blocked funds.** USDC in a blocked customer's wallet stays where it is. Moneta must not sign any transfer from that wallet. Today Moneta holds the only key, so this control is ours. Blocked property must be reported to OFAC within 10 business days ([research notes Q2](<../research_notes/Moneta licensing and permits/federal_and_dakota_model.md>)). `[COUNSEL: while Moneta holds the only key, who is the "holder" that reports: Moneta, Dakota, or both?]`
6. **Records** for 10 years (§8).

## 8. Records and retention

| Record | Where | Keep for |
|---|---|---|
| Transactions and status history | Database | 5 years after the transaction (31 CFR 1010.430); binding if Moneta is an MSB, adopted anyway |
| Identity and KYC data | Dakota | Dakota's programme. Moneta keeps the Dakota ID and status |
| Referral log and evidence | Restricted store [TBD] | 5 years from the referral |
| Sanctions records: blocks, possible matches, geo-block settings and changes | [TBD] | 10 years ([OFAC rule, 21 Mar 2025](https://www.govinfo.gov/content/pkg/FR-2025-03-21/html/2025-04864.htm)) |
| Audit log | Database, append-only | At least 5 years |
| Training records and policy versions | `compliance/` in git, plus the training log | 5 years after replacement |

Account deletion already keeps financial and audit records (`src/app/api/users/route.ts`). The two-year disposal rule in [F2](F2-information-security-program.md) does not override these periods.

## 9. Training

- Everyone in support, operations or compliance is trained before they get access, and again every year.
- Content: this policy, the red flags, how to refer, confidentiality, sanctions basics, and scams aimed at customers.
- [COMPLIANCE CONTACT] completes an external AML course before launch `[proposal]`.
- Log the name, date, topics and trainer.

## 10. Review and testing

- [COMPLIANCE CONTACT] reviews this policy every year and after any change in custody design, products or Dakota's terms.
- Before launch and every year after, someone outside day-to-day operations checks it: outside counsel or a consultant. The check covers:
  - whether geo-blocking works;
  - whether the referral log is complete and timely;
  - whether Dakota's requests were answered on time;
  - training records.

  This check is mandatory under §12A.

## 11. Requests from Dakota and from law enforcement

- **Dakota requests for information:** answer within [2] business days.
- **Subpoenas, court orders and law-enforcement requests:** send them to [COMPLIANCE CONTACT] and counsel the same day. Check they are genuine. Follow any non-disclosure instruction. Tell Dakota if regulated services are involved `[COUNSEL]`.

## 12. If counsel decides Moneta is an MSB, or Dakota's agent

**A. Moneta is an MSB in its own right:**
- **Register with FinCEN.** File Form 107 within 180 days of starting, renew every two years, and re-register after certain ownership changes ([31 CFR 1022.380](https://www.ecfr.gov/current/title-31/subtitle-B/chapter-X/part-1022/subpart-D/section-1022.380)).
- **Written AML programme.** It must have four pillars: policies and internal controls, a BSA officer, training, and independent review (31 CFR 1022.210; [FIN-2016-G001](https://www.fincen.gov/system/files/shared/FIN-2016-G001.pdf)). It is approved by [BOARD] and built on a formal risk assessment.
- **File SARs** ourselves ($2,000; 30 days), keep funds-transfer and Travel Rule records for transmittals of $3,000 or more, and keep BSA records for 5 years.
- **Identity checks.** Relying on Dakota's KYC needs a written agreement. Liability cannot be passed to Dakota by contract ([FIN-2016-G001](https://www.fincen.gov/system/files/shared/FIN-2016-G001.pdf)).
- **State licences.** This is a separate question (report, Path 2). Prior unlicensed activity can bar us from the multistate licensing programme.

**B. Moneta is Dakota's agent:**
- No FinCEN registration if Moneta is an MSB "solely" as Dakota's agent (31 CFR 1022.380(a)(3)).
- Moneta still needs its own written AML programme, and Dakota must monitor it as an agent ([FIN-2016-G001](https://www.fincen.gov/system/files/shared/FIN-2016-G001.pdf)).
- The agency route does not work for crypto activity in New York.

**C. Neither** (likely only after the custody redesign in [F5](F5-key-management-policy.md)): this policy, plus whatever the Dakota contract requires.

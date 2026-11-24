# US consumer-protection, privacy, marketing, card-programme, corporate and tax requirements for a non-bank consumer stablecoin "neobank" app (pre-launch)

Research current as of 2026-11-24. This is research, not legal advice. Items marked **[counsel]** need a decision from a lawyer. Items marked **[not re-fetched]** are well-established rules cited from a stable official URL that I did not open in this session. Verify them before relying on them.

Product assumptions used throughout: a non-bank web app. USDC is held in a wallet on Base and is not FDIC-insured. ACH is used to deposit and to withdraw to the user's bank. User-to-user (P2P) transfers are internal book entries. A debit card is planned through the card programme of Dakota Platform, Inc. (a FinCEN-registered, state-licensed money transmitter that partners with issuing banks such as Lead Bank and BMO). "Rewards" on balances are being considered. The legal entity has not been formed yet. Money-transmitter licensing and the GENIUS Act in depth are covered by other researchers.

---

## 1. FDIC 12 CFR Part 328: reach to non-bank fintechs, current compliance dates, disclosures next to bank-like UI, and the custodial-account recordkeeping proposal

### Takeaway
Part 328 Subpart B (misrepresentation of insured status, 12 CFR 328.101–108) implements FDI Act §18(a)(4), which applies to **any person**, so it reaches non-bank fintechs directly. It is already in force, and the FDIC has used it against crypto firms and neobanks. Subpart A's signage rules (328.4 digital, 328.5 ATM) bind only insured banks. After two delays and a January 2026 re-write, their compliance date is **April 1, 2027**. The FDIC's 2024 custodial-account recordkeeping proposal (RIN 3064-AG07) has not been finalised or withdrawn. It sits on the Unified Agenda as a "Long-Term Action" with the final rule date "To Be Determined".

### Cited Findings
**Reach and enforcement (Subpart B)**
- 12 CFR 328.102(a): **any person** may not use FDIC-associated terms or images in a business name, advertisement or publication in a way that implies an uninsured product is FDIC-insured. A violation includes advertising uninsured products with FDIC terms or images *without a clear, prominent disclaimer* that they are not FDIC-insured, and claiming to be FDIC-insured, or associated with the FDIC or an insured bank, when that is untrue or not clearly described. — [Cornell LII, 12 CFR 328.102](https://www.law.cornell.edu/cfr/text/12/328.102)
- 328.102(b)(1)–(4): no person may make false or misleading statements about deposit insurance. A statement violates the rule if it contains a material misrepresentation, or **omits material information**, that could mislead a reasonable consumer. **Actual deception does not need to be shown.** Implying that uninsured products are insured is a material misrepresentation. — [Cornell LII](https://www.law.cornell.edu/cfr/text/12/328.102)
- 328.102(b)(5) lists **material omissions specific to non-banks**:
  - (i) a deposit-insurance statement that does not clearly identify the insured bank(s) where consumer deposits may be placed;
  - (ii) failing to clearly disclose that the company **is not an FDIC-insured depository institution** and that "**FDIC insurance only covers the failure of the FDIC-insured depository institution**";
  - (iii) on websites where deposits and **non-deposit products appear close together**, failing to disclose that the non-deposit products **are not FDIC-insured, are not deposits, and may lose value** (there are exceptions for unrelated services and physical goods, and the "may lose value" wording is not required for fiat-storage products that do not fluctuate in value);
  - (iv) pass-through coverage statements that do not disclose the conditions for pass-through coverage.
  — [Cornell LII](https://www.law.cornell.edu/cfr/text/12/328.102)
- 328.102(b)(6): a misrepresentation counts as "knowingly" made if the person keeps making it after a regulator has warned that it is false or misleading. — [Cornell LII](https://www.law.cornell.edu/cfr/text/12/328.102)
- Secondary guidance: FDI Act §18(a)(4) bars *any person* from falsely representing an uninsured product as FDIC-insured. A non-bank that mentions FDIC insurance should state that it is not a bank and that only the partner bank provides insurance, and leaving that out is a "material omission". "Not FDIC Insured" is given as an example of a disclaimer. — [Luthor.ai FDIC advertising guide (vendor; verify against FDIC)](https://www.luthor.ai/resources/fdic-advertising)
- Enforcement record against non-banks:
  - On July 28, 2022, the FDIC and the Federal Reserve sent a joint cease-and-desist letter to Voyager Digital over implications that customer funds were FDIC-insured. In August 2022 the FDIC sent letters to FTX US, Cryptonews, Cryptosec, SmartAsset and FDICCrypto, citing §18(a)(4) and Part 328 Subpart B. FTX US's letter cited a tweet by its president. — [ABA Banking Journal](https://bankingjournal.aba.com/2022/08/fdic-alleges-five-crypto-companies-misled-on-deposit-insurance/); [FDIC PR-60-2022](https://fdic.gov/news/press-releases/2022/pr22060.html)
  - Later letters went to CEX.IO and Zera (February 2023), Unbanked, Inc., and **Utoppia, a neobank offering crypto wallets**. Commentators read this as scrutiny widening to non-bank fintechs generally. The FDIC can also assess civil money penalties. — [Husch Blackwell](https://huschblackwell.com/newsandinsights/why-fintechs-and-crypto-companies-should-pay-attention-to-the-fdics-latest-round-of-cease-and-desist-letters); [Banking Dive on Utoppia](https://www.bankingdive.com/news/fdic-cease-desist-orders-neobank-utoppia-deposit-insurance-crypto/646155/); [American Banker on CEX.IO/Zera](https://www.americanbanker.com/news/fdic-issues-cease-and-desist-letters-to-cex-io-zera)

**Compliance-date history (Subpart A: 328.4 digital signs, 328.5 ATMs)**
- The 2023 amendments took effect April 1, 2024. Compliance with 328.4/328.5 was first postponed to March 1, 2026. Other amendments, including Subpart B, kept a May 1, 2025 compliance date. — [Luthor.ai (vendor)](https://www.luthor.ai/resources/fdic-advertising); [FDIC FIL: compliance-date extension for 328.4 and 328.5](https://www.fdic.gov/news/inactive-financial-institution-letters/2025/compliance-date-extension-sections-3284-and-3285-amendments); [Federal Register 2025-03790 (Mar 11, 2025)](https://www.federalregister.gov/documents/2025/03/11/2025-03790/fdic-official-signs-and-advertising-requirements-false-advertising-misrepresentation-of-insured)
- A November 2025 FDIC action moved the 328.4/328.5 date from March 1, 2026 to **January 1, 2027**. — [Federal Register 2025-21461 (Nov 28, 2025)](https://www.federalregister.gov/documents/2025/11/28/2025-21461/fdic-official-signs-and-advertising-requirements-false-advertising-misrepresentation-of-insured) (from the search snippet)
- **FIL-3-2026 (January 22, 2026)** adopted a final rule that re-writes the digital and ATM signage rules, with a compliance date of **April 1, 2027**:
  - IDIs may vary the colour, font and size of the digital sign;
  - the digital sign is required only on the **homepage, login page and first page of the deposit-account-opening process**;
  - non-deposit signage applies only to pages **primarily dedicated to non-deposit products**;
  - the one-time notice about third-party non-deposit products may disappear automatically after 3 seconds;
  - on ATMs, the requirement is narrowed to the initial screen.
  — [FDIC FIL-3-2026](https://www.fdic.gov/news/financial-institution-letters/2026/notice-final-rulemaking-fdic-official-signs-advertisement)
- A vendor guide says the FDIC's Part 328 Q&A, updated May 13, 2026, also states April 1, 2027. — [Luthor.ai](https://www.luthor.ai/resources/fdic-advertising); [FDIC Part 328 Q&A](https://www.fdic.gov/deposit-insurance/questions-and-answers-related-fdics-part-328-final-rule)

**Custodial deposit account recordkeeping (RIN 3064-AG07)**
- Proposed October 2, 2024 (89 FR 80135). It would require IDIs to keep records of beneficial owners in custodial deposit accounts with transactional features, which mainly arise in bank-fintech arrangements. The comment period was extended to January 16, 2025. — [Federal Register / govinfo](https://www.govinfo.gov/content/pkg/FR-2024-10-02/html/2024-22565.htm); [FDIC FIL on comment extension](https://www.fdic.gov/news/financial-institution-letters/2024/fdic-extends-comment-period-proposed-rule-custodial-deposit)
- Unified Agenda status: **"Long-Term Actions"**, with the final rule "To Be Determined". The FDIC's stated aim remains to speed up deposit-insurance determinations if a bank holding custodial accounts fails. — [reginfo.gov RIN 3064-AG07](https://www.reginfo.gov/public/do/eAgendaViewRule?pubId=202504&RIN=3064-AG07)
- The American Fintech Council urged withdrawal, and NCLC supported the proposal. I found no withdrawal or final rule. — [AFC comment](https://fdic.gov/federal-register-publications/american-fintech-council-ian-p-moloney-rin-3064-ag07); [NCLC comment](https://fdic.gov/federal-register-publications/national-consumer-law-center-rin-3064-ag07)

### Inferences
- **Subpart B applies to this app now.** The site's existing line ("a financial technology company, not a bank"; balances are not FDIC-insured) is the right foundation. Under 328.102(b)(5), any page that mentions FDIC, the partner bank or "insured" should also:
  - (a) name the insured bank, where any bank deposit is involved (for example a card settlement or fiat on-ramp account at Lead Bank or BMO);
  - (b) state that FDIC insurance covers only the failure of that bank;
  - (c) next to the USDC balance, say "not a deposit, not FDIC-insured, may lose value".
- Whether USDC qualifies as a "fiat-storage product that does not fluctuate in value", which would exempt it from the "may lose value" wording, is **[counsel]**. The conservative choice is to keep the wording.
- Bank-like UI cues (the word "account", "balance", "routing number", a bank-style logo lockup, "insured", "protected") are where "reasonable consumer" omission risk sits. **Avoid "FDIC" anywhere unless it is paired with the 328.102(b)(5) disclosures.**
- **Subpart A (signage) binds IDIs, not the app.** The partner bank may contractually require the app to carry its digital FDIC sign, or the non-deposit signage, on bank-channel pages by April 1, 2027, if any bank deposit product is presented in-app. Expect this to show up as a **bank marketing/UX review requirement**.
- **Custodial recordkeeping is dormant but alive.** Partner banks already ask fintechs for per-user ledgers that reconcile to omnibus accounts (post-Synapse practice), so build them anyway.
- **Checklist output:**
  - (1) an FDIC/insured-status disclosure standard, with exact wording and placement, in a marketing-compliance policy;
  - (2) a pre-publication marketing review log, with partner-bank sign-off where bank products are referenced;
  - (3) a per-user sub-ledger reconcilable to any omnibus or FBO account, ready to supply to the bank.

### Gaps
- I could not fetch the text of 12 CFR 328.101 (eCFR redirected), so I have **not confirmed whether the "non-deposit product" definition expressly names crypto-assets**. Section 328.102 itself does not mention crypto.
- I did not confirm whether the January 2026 rule changed Subpart B or only 328.4/328.5. The FIL describes only signage changes.
- Whether the FDIC Q&A treats a fintech's app as a bank "digital deposit-taking channel" when the bank's deposits are offered through it is not confirmed.
- No sign the FDIC has acted on RIN 3064-AG07 since January 2025.

---

## 2. CFPB: Regulation E/EFTA for stablecoin wallets and P2P, the digital-payment larger-participant rule, UDAAP, and the documents required

### Takeaway
- **The larger-participant rule is dead.** Congress nullified it under the CRA (P.L. 119-11, signed May 9, 2025).
- **The proposed interpretive rule is withdrawn.** It would have treated stablecoins as "funds" under EFTA, and the CFPB withdrew it on May 15, 2025.
- **Whether Reg E covers USDC wallets and in-app P2P transfers is an open legal question.**
- **The debit card itself is squarely within Reg E**, as a bank-issued access device to a consumer account.
- **Federal CFPB enforcement is near-dormant in 2026, but UDAAP/UDAP exposure remains** through state attorneys general, state regulators, the FTC and private litigation.

### Cited Findings
- **Larger-participant rule (digital consumer payment apps):**
  - The CFPB's 2024 rule would have supervised non-banks handling ≥50 million consumer payment transactions a year. Congress nullified it with S.J. Res. 28, which the President signed on May 9, 2025 (P.L. 119-11). — [Holland & Knight](https://www.hklaw.com/en/insights/publications/2025/05/cfpb-overdraft-and-digital-payment-rules-repealed); [CRS IF12935](https://www.congress.gov/crs_external_products/IF/PDF/IF12935/IF12935.8.pdf); [Consumer Finance Monitor](https://www.consumerfinancemonitor.com/2025/05/21/trump-signs-resolution-voiding-cfpb-large-nonbank-supervision-rule/)
  - Under the CRA, the CFPB cannot reissue a "substantially the same" rule without new legislation. This is the general CRA effect, noted in the CRS product above. **[not re-fetched for the specific wording]**
- **EFTA/Reg E crypto interpretive rule:**
  - Proposed January 2025. It would have applied EFTA/Reg E to crypto and stablecoins, wallets and gaming accounts by treating crypto as "funds". — [WilmerHale](https://www.wilmerhale.com/en/sitecore/content/whlaunch/home/research/news-publications/20250129-cfpb-proposes-significant-expansion-in-scope-of-efta-and-regulation-e); [Perkins Coie](https://perkinscoie.com/insights/update/cfpb-proposes-rule-expand-regulation-e-crypto-and-gaming-accounts)
  - **Withdrawn May 15, 2025** because it did not align with "current agency needs, priorities, or objectives". The notice also said comments raised issues about whether it properly interpreted EFTA. — [Orrick InfoBytes](https://infobytes.orrick.com/2025-05-16/cfpb-withdraws-eft-interpretive-rule/); [NASCUS summary](https://www.nascus.org/summary-cfpb-withdrawal-of-proposed-interpretive-rule-electronic-funds-transfers-emerging-payment-mechanisms/)
  - Commentators note that the proposal's reading of EFTA could still be used by private litigants and state regulators. — [MoFo](https://www.mofo.com/resources/insights/250123-not-just-fun-and-games-cfpb-seeks-comments)
- **Reg E definitions that decide coverage:**
  - "Account" means a demand deposit, savings or **other consumer asset account** held directly or indirectly by a financial institution, primarily for personal, family or household purposes.
  - "Prepaid account" includes an account issued on a prepaid basis, or loadable, whose primary function is general transactions **including person-to-person transfers**, and which is not a checking/share-draft/NOW account. A prepaid account must be "capable of holding funds".
  - "Financial institution" includes any person that directly or indirectly holds the account, **or any person "that issues an access device and agrees with a consumer to provide electronic fund transfer services."**
  - "Funds" is not defined.
  — [CFPB, 12 CFR 1005.2](https://www.consumerfinance.gov/rules-policy/regulations/1005/2/)
- **Prepaid agreement submission (12 CFR 1005.19):**
  - Issuers must submit prepaid account agreements to the CFPB no later than 30 days after offering, amending or withdrawing them, through the CFPB Collect website (in effect since April 1, 2019).
  - Issuers must also post agreements on their websites and provide them on request.
  - There is a **de minimis exception for issuers with fewer than 3,000 open prepaid accounts**.
  — [CFPB 1005.19](https://www.consumerfinance.gov/rules-policy/regulations/1005/19/); [Federal Register 2019-03852](https://www.govinfo.gov/content/pkg/FR-2019-03-06/html/2019-03852.htm); [CFPB submission FAQ](https://files.consumerfinance.gov/f/documents/cfpb_prepaid-product-agreement-submission_frequently-asked-questions.pdf)
- **CFPB posture in 2026** (sources conflict, so verify):
  - One public enforcement action in FY2026, 16 consent orders terminated, and new "Enforcement Principles" focused on demonstrable harm. — [National Mortgage News](https://www.nationalmortgagenews.com/news/cfpb-s-sharp-pivot-on-enforcement-one-action-in-a-year)
  - Courts have ruled that the attempt to halt CFPB funding was unlawful, and some dropped matters have been picked up by state AGs. — [American Banker](https://www.americanbanker.com/news/its-all-on-the-line-for-the-cfpb-in-2026)
  - On September 16, 2026 the House Financial Services Committee approved H.R. 10184 (28–21), which would put the CFPB under appropriations. It is not law. — [Consumer Finance Monitor](https://www.consumerfinancemonitor.com/2026/09/22/house-financial-services-committee-approves-legislation-to-place-cfpb-under-congressional-appropriations-process/)
- **Reg E operating requirements** (well-established; **[not re-fetched]**, see [CFPB Reg E index](https://www.consumerfinance.gov/rules-policy/regulations/1005/)):
  - 1005.7 initial disclosures (liability, error-resolution notice, fees, types of transfers);
  - 1005.8 change-in-terms notice at least 21 days ahead;
  - 1005.9 receipts and periodic statements;
  - 1005.6 consumer liability limits ($50 / $500 / unlimited tiers, tied to notice timing);
  - 1005.11 error resolution (investigate within 10 business days, or 45 days with provisional credit, with written results);
  - 1005.10 preauthorized transfers;
  - 1005.18 prepaid-specific short-form and long-form pre-acquisition disclosures, and the option of account-history access instead of periodic statements.

### Inferences
- **Debit card:**
  - The issuing bank is the Reg E "financial institution" for the card. The programme manager (Dakota) and the app will be contractually required to run the bank's Reg E processes: disclosures, dispute intake, provisional credit, investigation logs and timelines.
  - Whether the card is structured as a **debit card on a deposit account or a prepaid card** determines whether the 1005.18 prepaid short/long-form disclosures and the 1005.19 agreement submission apply.
  - **[counsel + Dakota]** Find out how Dakota's card programme legally characterises the underlying account, and whether a USDC balance is converted at authorisation.
- **USDC wallet and in-app P2P:**
  - With the interpretive rule gone, Reg E coverage turns on whether a USDC balance held for the user is an "other consumer asset account" holding "funds".
  - The app arguably "issues an access device" (app credentials) and "agrees to provide EFT services", which brings it into the 1005.2(i) definition of "financial institution" even though it is not a bank.
  - **[counsel]** The prudent course used by many custodial crypto and fintech apps is to **voluntarily adopt Reg E-style error resolution and unauthorized-transfer protections** in the user agreement. It is also a UDAAP mitigant and what sponsor banks expect.
- **UDAAP/UDAP:**
  - Bank-like marketing ("account", "bank", "savings", "earn", "safe", "protected") for an uninsured stablecoin product is the main deception risk.
  - The CFPA's UDAAP authority (12 U.S.C. 5531/5536 **[not re-fetched]**) also gives state AGs enforcement standing. State UDAP statutes and FTC Act §5 apply regardless of how active the CFPB is.
- **Checklist output:**
  - (1) user agreement / terms of service with an error-resolution section;
  - (2) Reg E initial disclosures for the card (bank template);
  - (3) prepaid short-form and long-form disclosures, if the card is prepaid;
  - (4) a written dispute/error-resolution procedure and log (10/45-day clocks);
  - (5) a periodic statement or transaction-history feature;
  - (6) a change-in-terms notice process (21 days);
  - (7) CFPB Collect submission of the prepaid agreement, if prepaid and ≥3,000 accounts, and the agreement posted on the website;
  - (8) a UDAAP marketing-review policy.

### Gaps
- No court or agency ruling since May 2025 settles whether a custodial stablecoin balance is "funds" under EFTA.
- I did not verify whether any state (for example New York or California) has adopted Reg E-equivalent rules for stablecoin wallets.
- The CFPB's funding status as of November 2026 is contested across sources. I found no confirmed current larger-participant rulemaking for payment apps.

---

## 3. GLBA: FTC Safeguards Rule, Regulation P privacy notice, state privacy laws (CCPA and its GLBA carve-out), and state breach notification

### Takeaway
As a non-bank "financial institution" under FTC jurisdiction, the app needs:
- a written information security programme that meets 16 CFR 314.4, including a Qualified Individual, a written risk assessment, MFA, encryption, pen-testing or continuous monitoring, an incident response plan and an annual report to the board;
- FTC notice within 30 days of a breach affecting 500 or more consumers;
- a GLBA/Reg P privacy notice.

California's CCPA exempts only GLBA-covered *data*, not the company, so a CCPA privacy policy is still needed for non-GLBA data such as web and marketing data. All 50 states plus DC have breach-notice laws.

### Cited Findings
- **Safeguards Rule elements (16 CFR 314.4):**
  - (a) a designated **Qualified Individual** (who can be outsourced, but the company stays responsible);
  - (b) a **written risk assessment** with criteria, reassessed periodically;
  - (c) safeguards including access controls, a data inventory, **encryption in transit and at rest**, secure development and app evaluation, **MFA**, disposal within 2 years of last use, change management, and activity logging and monitoring;
  - (d) **continuous monitoring, or else annual penetration testing plus vulnerability assessments every six months**;
  - (e) security-awareness training;
  - (f) **service-provider oversight**, with contract requirements and periodic reassessment;
  - (g) keeping the programme current;
  - (h) a **written incident response plan**;
  - (i) a **written report from the Qualified Individual to the board** (or a senior officer) at least annually.
  — [FTC, Safeguards Rule: What Your Business Needs to Know](https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know)
- **Exemption:** institutions holding information on **fewer than 5,000 consumers** are exempt from certain provisions (16 CFR 314.6). The FTC page does not list which ones. — [FTC](https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know)
- **FTC breach notice (16 CFR 314.4(j)):** a "notification event" is unauthorised acquisition of **unencrypted** information on **≥500 consumers**. Notify the FTC through its online form as soon as possible and **no later than 30 days after discovery**. This has been in effect since May 2024. — [FTC](https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know)
- **Coverage:** entities "significantly engaged" in financial activities under FTC jurisdiction. Examples include check cashers, "wire transferors", account servicers and finders. — [FTC](https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know)
- **Privacy Rule:** financial institutions must tell customers about their information-sharing practices and their right to **opt out** of certain sharing with third parties. — [FTC GLBA page](https://www.ftc.gov/business-guidance/privacy-security/gramm-leach-bliley-act)
  - Regulation P (12 CFR 1016) is the CFPB-issued implementing rule for most non-banks. It covers the initial notice at account opening, the annual notice (with an exception under the FAST Act / 1016.5(e) where the company shares only within exceptions and has not changed its practices), the opt-out notice, and a model form. **[not re-fetched]** — [CFPB Reg P](https://www.consumerfinance.gov/rules-policy/regulations/1016/)
- **State privacy laws:**
  - California has **never** given financial institutions an entity-level GLBA exemption. Its exemption covers only GLBA nonpublic personal information, so non-GLBA personal data held by a financial institution is still covered.
  - In 2025, Montana (effective October 1, 2025) and Connecticut (SB 1295) moved from entity-level to **data-level** GLBA exemptions.
  - Oregon's entity exemption is limited to FDIC/NCUA-insured institutions, so it would not cover a fintech.
  - Minnesota's entity exemption covers state-regulated money transmitters, among others.
  — [Orrick, July 2025](https://www.orrick.com/en/Insights/2025/07/Where-is-the-GLBA-Entity-Level-Exemption-Two-More-State-Privacy-Laws)
  - One count (pre-2026): 20 states have comprehensive privacy laws, and 15 had broad entity-level GLBA exemptions. — [Bloomberg Law](https://news.bloomberglaw.com/us-law-week/what-financial-institutions-must-know-about-evolving-privacy-laws)
- **State breach notification:**
  - All 50 states and DC have breach-notice statutes (in force as of January 1, 2026). Only about 20 states (39%) set a fixed deadline, 24 allow a private right of action, and 6 require free credit monitoring. — [Privacy Rights Clearinghouse 2026 survey](https://privacyrights.org/resources-tools/reports/data-breach-notification-laws-50-state-survey-2026-edition)
  - California and New York joined the group requiring notice within 30 days, and Oklahoma's SB 626 revised its law effective January 1, 2026. — [Perkins Coie 2025 update](https://perkinscoie.com/insights/update/2025-breach-notification-law-update)
  - All of these laws have an encryption safe harbour. — [IAPP chart](https://iapp.org/resources/article/state-data-breach-notification-chart)

### Inferences
- **Who is the "financial institution"?**
  - Even though Dakota is the licensed money transmitter, the app collects and holds NPI (KYC data, bank links, transaction histories), so it is very likely a GLBA financial institution in its own right. At minimum it is a service provider that Dakota and the bank will contractually bind to Safeguards-equivalent controls.
  - **[counsel]** Decide whether the app gives its own Reg P notice, or whether Dakota's or the bank's notice covers it. Typically both the programme manager and the brand give one.
- **The <5,000-consumer exemption does not help for long.** Build the full programme before launch because partner diligence will demand it anyway.
- **CCPA:** if the company meets CCPA thresholds (for example ≥$25M+ revenue, which is not likely at launch, or ≥100k consumers' data, or ≥50% of revenue from selling or sharing), it needs a CCPA privacy policy for non-GLBA data (cookies, ad pixels, marketing lists) and a "Do Not Sell/Share" mechanism if ad-tech sharing is used. The thresholds are **[not re-fetched]**. Expect bank partners to require CCPA-grade practices regardless.
- **Checklist output:**
  - (1) a written information security programme (WISP);
  - (2) a Qualified Individual designation memo;
  - (3) a written risk assessment;
  - (4) an annual pen-test report plus six-monthly vulnerability scan reports, or evidence of continuous monitoring;
  - (5) an incident response plan with an FTC 30-day / 500-consumer trigger and a state-by-state notice matrix;
  - (6) a vendor risk-management file covering Dakota, KYC vendors, cloud and analytics;
  - (7) an annual board report;
  - (8) a GLBA/Reg P privacy notice (initial; annual if no exception) plus an opt-out mechanism if sharing outside the exceptions;
  - (9) a website privacy policy covering CCPA and other state laws;
  - (10) cookie/tracking consent and controls;
  - (11) data retention and disposal schedule (2-year disposal rule).

### Gaps
- I did not verify the exact list of 314.4 provisions exempted by 314.6 (<5,000 consumers).
- I did not re-verify the current Reg P annual-notice exception text, or whether the CFPB has amended Reg P in 2025–2026.
- No 2026-dated list of which state comprehensive privacy laws now lack an entity-level GLBA exemption, so an updated count is needed.

---

## 4. E-SIGN consent, TCPA/CAN-SPAM messaging, and ADA/WCAG website accessibility

### Takeaway
Because every required disclosure (Reg E, Reg P, the cardholder agreement) will be delivered electronically, the app needs an **E-SIGN consumer-consent flow** that meets 15 U.S.C. 7001(c). That means a pre-consent statement, hardware and software requirements, and consent that "reasonably demonstrates" access.
- **SMS and calls:** TCPA consent rules apply. The FCC's "revoke-all" consent rule has been delayed to **January 31, 2027**.
- **Marketing email:** CAN-SPAM applies, with penalties up to $53,088 per email. Transactional messages are mostly exempt.
- **Accessibility:** there is still no DOJ Title III web regulation. WCAG 2.1 AA is the de facto benchmark, and website lawsuits rose in 2025.

### Cited Findings
- **E-SIGN, 15 U.S.C. 7001(c)(1).** An electronic record satisfies a consumer "in writing" requirement only if:
  - (A) the consumer has **affirmatively consented** and has not withdrawn;
  - (B) before consenting, the consumer received a **clear and conspicuous statement** of: (i) the right to paper and the right to withdraw, with any fees or consequences; (ii) the scope of consent (this transaction or categories of records); (iii) how to withdraw and how to update contact information; (iv) how to get paper copies and any fee;
  - (C) the consumer received a statement of **hardware and software requirements** and consented electronically "in a manner that **reasonably demonstrates** that the consumer can access" the records;
  - (D) if requirements change materially, the consumer gets a revised statement and the right to withdraw without fees.
  - Section 7001(c)(2)(A) says E-SIGN does not change the content or timing of required disclosures.
  — [Cornell LII, 15 U.S.C. 7001](https://www.law.cornell.edu/uscode/text/15/7001)
- **TCPA revoke-all rule:**
  - The FCC's April 2025 order delayed the "revoke-all" part of the consent-revocation rule to April 11, 2026, after requests from banking associations.
  - A January 6, 2026 bureau order delayed it again, to **January 31, 2027**. Until then, revocation can be applied by brand or call type, and other revocation obligations still apply.
  — [Burr & Forman](https://www.burr.com/telephone-consumer-protection-act/the-fcc-delays-effective-date-of-tcpa-revoke-all-rule-until-january-31-2027); [Consumer Financial Services Law Monitor](https://www.consumerfinancialserviceslawmonitor.com/2026/01/fcc-further-extends-effective-date-for-tcpa-revoke-all-rule/); [FCC DA-26-12](https://docs.fcc.gov/public/attachments/DA-26-12A1.pdf)
- **CAN-SPAM:**
  - Each violating email is subject to penalties of up to **$53,088** (inflation-adjusted).
  - "Transactional or relationship" messages (facilitating an agreed transaction or updating an existing customer) are exempt from most provisions but must not have false routing information.
  - In a mixed message, the subject line and the placement of content decide its primary purpose.
  — [FTC CAN-SPAM Compliance Guide](https://www.ftc.gov/business-guidance/resources/CAN-SPAM-act-compliance-guide-business)
- **ADA/WCAG:**
  - DOJ's position is that Title III covers websites, but it has not issued a Title III web rule. In September 2025 DOJ said it would re-examine all ADA regulations. — [ABA Business Law Today, Aug 2025](https://www.americanbar.org/groups/business_law/resources/business-law-today/2025-august/digital-accessibility-under-title-iii-ada/)
  - DOJ's March 2022 guidance is high-level and does not mandate WCAG. — [DOJ press release](https://www.justice.gov/opa/pr/justice-department-issues-web-accessibility-guidance-under-americans-disabilities-act)
  - An April 20, 2026 Federal Register document refers to an **ANPRM on web accessibility under Titles II and III**, with possible compliance dates of 6 to 24 months after a final rule. I could not confirm its status. — [Federal Register, 91 FR (Apr 20, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-04-20/html/2026-07663.htm)
  - The 2024 Title II rule (WCAG 2.1 AA, deadlines April 24, 2026 and April 26, 2027) applies to public entities only. Title III website lawsuits reportedly rose 27% in 2025 (Seyfarth data, via a secondary source). The Eleventh Circuit's Winn-Dixie decision shows a circuit split. — [AudioEye summary (vendor)](https://audioeye.com/post/doj-website-accessibility-ada/); [ABA GPSolo](https://www.americanbar.org/groups/gpsolo/publications/gpsolo_ereport/2022/february-2022/title-iii-americans-disabilities-act-website-compliance/)

### Inferences
- **E-SIGN:**
  - Put an E-SIGN consent screen as a **standalone, affirmative step before account opening** (not buried in the terms of service). Log the consent, IP, timestamp, version of the disclosure, and evidence that the consumer could access a PDF or HTML version (for example, by having the user open the disclosure).
  - Partner banks will require this because Reg E and Reg P disclosures are invalid electronically without it.
- **SMS:**
  - Separate **transactional/security SMS** (one-time passcodes, fraud alerts, which need only prior express consent) from **marketing SMS** (prior express written consent).
  - Build "STOP = stop everything" now so the app is ready for the January 31, 2027 revoke-all date. Honour opt-outs within 10 business days, which is the 2024 FCC rule's timeframe **[not re-fetched]**.
- **Email:** separate transactional and marketing streams; for marketing, a physical postal address, an unsubscribe that works for 30 days, and opt-outs honoured within 10 business days **[not re-fetched; on the FTC guide]**.
- **Accessibility:** target WCAG 2.1 AA (or 2.2 AA) and publish an accessibility statement. Expect bank partners to ask for a VPAT or accessibility conformance report.
- **Checklist output:**
  - (1) E-SIGN disclosure and consent record;
  - (2) SMS terms and consent language, with a consent-capture log;
  - (3) email marketing policy and suppression list;
  - (4) accessibility statement plus a WCAG audit report or VPAT.

### Gaps
- I did not confirm the status of the FCC "one-to-one" lead-generation consent rule (my recollection is that the Eleventh Circuit vacated it in January 2025; **unverified this session**).
- Not confirmed whether the April 2026 Federal Register ADA item is an ANPRM or an interim rule. Sources conflict.
- No state-specific mini-TCPA analysis (Florida, Oklahoma, Maryland and others) was done.

---

## 5. Card programme: approvals through a programme manager and issuing bank, the cardholder agreement and fee disclosures, Reg E for debit and prepaid, and Reg II

### Takeaway
Issuing through Dakota's programme means sequential sign-offs:
1. Dakota's onboarding and due diligence on the app as a sub-programme or brand.
2. The issuing bank's (Lead/BMO) programme approval, which includes its third-party-risk diligence on the app, its compliance policies, insurance, marketing and UX.
3. Visa or Mastercard approval of the programme and brand. Mastercard requires programme managers to be approved as the BIN sponsor's agent.
4. Card-art and physical-proof approval by the brand, the bank and the network.
5. Ongoing pre-approval of marketing materials by the bank.

The app needs a cardholder agreement (usually the bank's template), Reg E disclosures, and prepaid-specific disclosures if the card is prepaid. Reg II's 21¢ interchange cap was vacated by the Eighth Circuit on October 26, 2026. This matters mainly for revenue modelling.

### Cited Findings
- **Approval sequence:**
  - Approval from issuing banks and card networks is needed before a programme proceeds. For physical cards, **the customer, the issuing bank and the network must all approve the proof** before production. The programme manager gives compliance guidance on card-design rules. — [Marqeta Program Management Guide](https://www.marqeta.com/resources/program-management-guide)
  - The sponsor (issuing) bank holds the BIN licence, and day-to-day programme management often falls to the company or a programme manager. In managed programmes **the business typically submits card art and secures approvals itself**. — [Lithic](https://www.lithic.com/blog/what-is-card-program-management); [Lithic, managed vs processor-only](https://www.lithic.com/blog/card-program-management)
  - **Mastercard Rules:** a programme manager acts as the BIN sponsor's agent and must obtain Mastercard approval for its management of each card programme where the Standards require it. — [Mastercard Rules (PDF)](https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/mastercard-rules.pdf)
  - **Visa Rules:** Visa's review or approval of card designs or marketing does **not** replace the member's own legal review or relieve it of compliance duties. — [Visa Core Rules (Oct 2026 edition)](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf)
  - Product changes generally need bank review before they ship, and the programme manager coordinates changes across the bank, processor and network. — [Trio](https://trio.dev/card-issuing-program/); [GE MBA](https://ge.mba/research/scheme-certified-card-program-manager-role-and-value)
- **Bank partner diligence and insurance:**
  - One BaaS provider requires fintech clients to carry cyber/data security, professional liability/E&O, commercial general liability and **commercial crime** coverage, each at **≥$1M per occurrence and in aggregate**. Executive (D&O) liability and umbrella cover are optional. — [Synctera docs](https://docs.synctera.com/docs/rc-implementation-operational-resilience)
  - A broker says sponsor banks usually require crime/fidelity bond cover for fund movement. Cyber policies typically cover data breaches but not stolen funds. This is a vendor claim. — [Corgi](https://corgi.insure/fintech); [Lockton fintech brochure](https://lockbox.lockton.com/m/6a243cc4d3445130/original/5591517_Lockton_Fintech_Brochure_08-25-1.pdf)
  - Fintech partner diligence typically covers entity status and foundational documents, financials, **insurance (for example cyber)**, management qualifications, and audits and testing. — [Shearman & Sterling](https://digital.shearman.com/i/1394543/23)
- **Reg E for the card:** see Section 2 (prepaid account definition; 1005.19 submission within 30 days, de minimis under 3,000 accounts). — [CFPB 1005.2](https://www.consumerfinance.gov/rules-policy/regulations/1005/2/); [CFPB 1005.19](https://www.consumerfinance.gov/rules-policy/regulations/1005/19/)
- **Reg II:**
  - On **October 26, 2026 the Eighth Circuit affirmed vacatur of the Regulation II debit interchange fee cap** (21¢ + 5 bps) in *Corner Post*. The Fed must develop a new standard and may seek rehearing or certiorari. A parallel case (*Linney's Pizza*) is in the Sixth Circuit, where the district court upheld the rule. — [Venable, Nov 2026](https://www.venable.com/insights/publications/2026/11/eighth-circuit-vacates-federal-reserves-debit-card); [ABA Banking Journal, Oct 2026](https://bankingjournal.aba.com/2026/10/federal-appeals-court-strikes-down-the-feds-debit-card-fee-cap/?%5C_hsmi=446252261)
  - The Fed's 2023 proposal to lower the cap was still pending in late 2025, when banking associations asked for its withdrawal. — [ABA Banking Journal, Dec 2025](https://bankingjournal.aba.com/2025/12/aba-associations-ask-fed-to-withdraw-proposal-to-lower-debit-card-fee-cap/)
  - Routing: debit issuers must enable at least two unaffiliated networks, and since 2022–2023 this includes card-not-present transactions. — [ABA Banking Journal, Oct 2022](https://bankingjournal.aba.com/2022/10/fed-finalizes-rule-expanding-durbin-routing-requirements-to-card-not-present-transactions/)

### Inferences
- **Reg II responsibility:**
  - Reg II obligations fall on the **issuing bank**. The fee cap does not apply to issuers with under $10B in assets (the statutory small-issuer exemption, **[not re-fetched]**), which is why fintech programmes favour small banks.
  - The routing (two-network) rule applies to all issuers and is handled by the bank and processor.
  - The app has no Reg II filing, but interchange-sharing economics depend on (a) whether the issuer is exempt and (b) post-*Corner Post* developments.
- **Fee disclosures:** if the card is prepaid, the 1005.18 short form (with fixed fee lines and the "Not FDIC insured"-type statements where funds are not pass-through insured **[not re-fetched]**) and the long form are required before acquisition. If it is a debit card on a deposit account, the Truth in Savings/Reg DD account disclosures are the bank's. **[counsel + Dakota]**
- **Insurance:** plan for $1M+ limits on cyber, tech E&O, crime/fidelity and CGL, with D&O likely needed for investors. Bank and Dakota contracts will set the actual minimums.
- **Checklist output:**
  - (1) Dakota programme application and onboarding questionnaire, with compliance policy pack (AML/KYC reliance, complaints, marketing, UDAAP, privacy, infosec, vendor management, BCP/DR);
  - (2) issuing-bank programme approval memo / sub-programme approval;
  - (3) network programme registration and brand approval;
  - (4) approved card-art proofs signed off by brand, bank and network;
  - (5) bank-approved marketing materials and a marketing review log;
  - (6) cardholder agreement (bank form) with fee schedule;
  - (7) Reg E initial disclosures and dispute procedures;
  - (8) prepaid short-form and long-form disclosures, plus CFPB agreement submission, if prepaid;
  - (9) a complaint-handling policy and log (banks require it);
  - (10) certificates of insurance naming the bank or Dakota as required.

### Gaps
- No public document from Dakota describing its card-programme approval steps, bank-partner sign-off or required insurance limits. Ask Dakota directly.
- Typical approval timelines for card art and programmes are not published. One source suggests the whole build takes about 6–9 months ([Trio](https://trio.dev/card-issuing-program/)), which I did not verify.
- Whether the 2023 interagency third-party risk guidance has been amended in 2025–2026 was not checked.

---

## 6. Corporate: Delaware C-corp formation, EIN, foreign qualification, state/local licences, CTA beneficial-ownership reporting, partner-required insurance, and trademark clearance

### Takeaway
A newly formed Delaware C-corp has **no CTA/BOI filing obligation**. FinCEN's March 2025 interim final rule exempted domestic companies, and a **final rule effective August 14, 2026** (91 FR 52508) made that permanent. Foreign companies registered in the US still file. The remaining formation stack is standard:
- Delaware certificate of incorporation, bylaws, board consents, stock issuances and 83(b) elections;
- EIN;
- foreign qualification in each state where staff work;
- local business licences;
- the Delaware franchise tax and annual report each March 1;
- insurance that partners require;
- a USPTO clearance search, because likelihood-of-confusion refusals are common in Class 36.

### Cited Findings
- **CTA/BOI:**
  - The interim final rule was published March 26, 2025 and was effective that day. It removed BOI reporting for entities formerly called "domestic reporting companies", and foreign reporting companies do not report US-person beneficial owners. — [Federal Register / govinfo, 90 FR 13688](https://www.govinfo.gov/content/pkg/FR-2025-03-26/html/2025-05199.htm); [FinCEN press release](https://www.fincen.gov/news/news-releases/fincen-removes-beneficial-ownership-reporting-requirements-us-companies-and-us)
  - **Final rule:** Treasury released it on August 11, 2026, and it took effect August 14, 2026 (91 FR 52508). Domestic companies have no initial, updated or corrected report to file. — [ABA Business Law Today](https://www.americanbar.org/groups/business_law/resources/business-law-today/2026-august/in-brief-corporations-llcs-partnerships); [MoFo](https://www.mofo.com/resources/insights/260820-fincen-ends-beneficial-ownership-reporting); [Thomson Reuters](https://tax.thomsonreuters.com/news/domestic-entities-off-the-hook-for-beneficial-ownership-reporting-under-final-rule/)
  - The final rule also exempts foreign companies from reporting US-person company applicants and drops the requirement to update FinCEN ID information. — [Thomson Reuters](https://tax.thomsonreuters.com/news/domestic-entities-off-the-hook-for-beneficial-ownership-reporting-under-final-rule/)
  - FinCEN will delete previously reported BOI about US persons. — [Harvard Law Forum on Corporate Governance](https://corpgov.law.harvard.edu/2026/08/27/fincen-permanently-eliminates-boi-reporting-requirements-for-us-companies-and-us-persons/)
  - **The CDD Rule beneficial-ownership collection by financial institutions is unchanged**, so banks and Dakota will still collect beneficial-owner information from the company at onboarding. — [MoFo](https://www.mofo.com/resources/insights/260820-fincen-ends-beneficial-ownership-reporting)
- **Delaware maintenance:**
  - The annual franchise tax report and payment are due by **March 1**. The authorised-shares method has a $175 minimum and a $200,000 maximum, and there is a $50 filing fee. A $200 penalty applies to incomplete or late reports. No Certificate of Good Standing is issued while tax is owed, and the charter can be voided after more than one year of non-compliance. — [Wolters Kluwer / CT Corporation, Jan 27, 2026](https://www.wolterskluwer.com/en/expert-insights/delaware-corporations-annual-franchise-report-and-tax-requirement)
  - The assumed-par-value-capital method can be elected. Startups with many authorised shares usually elect it to cut the tax. — [Wolters Kluwer](https://www.wolterskluwer.com/en/expert-insights/delaware-corporations-annual-franchise-report-and-tax-requirement)
- **Insurance:** see Section 5. The BaaS benchmark is $1M+ each for cyber, E&O, CGL and crime ([Synctera](https://docs.synctera.com/docs/rc-implementation-operational-resilience)), and diligence checklists include insurance ([Shearman](https://digital.shearman.com/i/1394543/23)).
- **Trademark:**
  - Likelihood of confusion is the USPTO's **most common refusal ground**, and a comprehensive clearance search is the recommended way to avoid it. Relatedness of goods and services matters as well as similarity of the marks. — [USPTO, Likelihood of confusion](https://uspto.gov/trademarks/search/likelihood-confusion)
  - TTAB decisions treat Class 36 financial services as closely related. For example, a mortgage-lending case held the services "need not be identical or even competitive". — [TTAB example](https://ttabvue.uspto.gov/ttabvue/ttabvue-90406741-EXA-10.pdf); [Synergy One Lending](https://case-law.vlex.com/vid/synergy-one-lending-inc-894437550)
- **Restricted words:**
  - GENIUS Act §5903(e)(2)(B) treats misrepresenting stablecoins as federally insured or government-guaranteed as a violation of 12 U.S.C. 1828(a)(4) or **18 U.S.C. 709**. Section 709 is the federal criminal statute on misuse of names such as "Federal", "national", "deposit insurance" and "FDIC". — [Cornell LII, 12 U.S.C. 5903](https://www.law.cornell.edu/uscode/text/12/5903)

### Inferences
- **Formation document list:**
  - Delaware certificate of incorporation, filed with a registered agent;
  - bylaws;
  - initial board consent (officers, stock issuance, fiscal year, banking resolutions);
  - founder stock purchase agreements with vesting, plus IP assignment / CIIAs;
  - **83(b) elections within 30 days** of grant **[not re-fetched]**;
  - stock ledger / cap table;
  - EIN from IRS Form SS-4 or the online application **[not re-fetched]**;
  - a business bank account.
- **Foreign qualification:**
  - Register as a foreign corporation (certificate of authority) in each state where the company has employees or an office.
  - Register for state payroll withholding and unemployment insurance, and get city/county business licences or tax registrations, such as a San Francisco business registration or NYC requirements, where staff are based **[counsel]**.
  - Remote-employee states also trigger registration in practice.
- **Insurance:**
  - D&O is typically required by investors.
  - Cyber, tech E&O, crime/fidelity (covering social engineering and funds-transfer fraud) and CGL are commonly required by bank and programme partners.
  - EPLI follows once there are employees.
- **Names:** avoid "bank", "banking", "savings", "trust", "deposit", "federal" and "national" in the company or product name. State banking codes restrict "bank" in names of non-banks **[counsel; another researcher may cover]**.
- **Trademark:** clear the brand (word and logo) in Class 36 (financial services, payment processing, electronic funds transfer) and Class 9 (downloadable app), and check state registers and common-law use, before investing in card art. Card networks and banks will not approve card art under a contested mark.
- **Checklist output:**
  - (1) the formation documents above;
  - (2) EIN confirmation letter (CP 575);
  - (3) foreign qualification certificates;
  - (4) state payroll and UI registrations;
  - (5) local business licences;
  - (6) Delaware annual report (each March 1);
  - (7) insurance binders and certificates of insurance;
  - (8) a trademark clearance opinion and USPTO applications (Classes 36 and 9);
  - (9) **no BOI report** (record a file memo of the exemption analysis; re-check if any foreign parent entity is used).

### Gaps
- State "bank" naming restrictions were not researched in this session.
- I did not verify the current Delaware fees on the Division of Corporations site (secondary source used).
- No authoritative published list of insurance minimums from Dakota, Lead Bank or BMO.

---

## 7. Tax: Form 1099-DA broker status, optional stablecoin reporting, 1099-MISC/1099-INT for rewards, and W-9/TIN collection with backup withholding

### Takeaway
Form 1099-DA applies to **sales effected after 2025**. A "broker" is someone who stands ready to **effect sales** of digital assets for others, or a digital-asset middleman such as a processor of digital-asset payments.
- If Dakota executes the USD↔USDC conversions, Dakota is likely the reporting broker.
- If the app is the one that "effects" sales for customers, for example because its own name is on the order or it acts as agent, the app may be a broker too.

Qualifying stablecoins have an **optional method**: no reporting for customers with ≤$10,000 of aggregate stablecoin proceeds a year, and aggregate reporting per stablecoin above that. Rewards go on **1099-MISC, not 1099-DA**. Under the One Big Beautiful Bill Act (OBBBA) the 1099-MISC threshold rose to $2,000 for payments after December 31, 2025, and backup withholding tracks that threshold. Collect **W-9s, or W-8s for non-US persons**, at onboarding. Digital-asset backup withholding is waived for 2025–2026 sales and conditionally relieved for 2027 through TIN matching.

### Cited Findings
- **Broker definition (2026 Form 1099-DA instructions):**
  - A broker is a person who, in the ordinary course of business, "stands ready to effect sales of digital assets to be made by others". This includes those who effect dispositions as agent, dealer or **digital-asset middleman**, which covers processors of digital-asset payments (PDAPs) and kiosk operators.
  - **Software-only, non-custodial providers are excluded** from the middleman definition.
  - Generally only US digital-asset brokers report.
  — [IRS, Instructions for Form 1099-DA (2026)](https://www.irs.gov/instructions/i1099da)
- **Sale definition:** a sale includes a disposition for **cash**, stored-value cards, different digital assets, or broker services. Cash (USD) is excluded from "digital asset", so **redeeming USDC for USD is a sale**. — [IRS i1099DA](https://www.irs.gov/instructions/i1099da)
- **Optional method for qualifying stablecoins:**
  - A qualifying stablecoin is designed to track one government currency 1:1, has an effective stabilisation mechanism, and is generally accepted as payment by people other than the issuer.
  - There is **no reporting if the customer's aggregate gross proceeds from designated sales are ≤$10,000 for the year**. Above that, the broker reports aggregate proceeds **per stablecoin type** on separate 1099-DAs.
  - A "designated sale" is any sale of a qualifying stablecoin except an exchange for non-stablecoin digital assets.
  — [IRS i1099DA](https://www.irs.gov/instructions/i1099da)
  - Several secondary sources say basis and acquisition dates may be omitted under the aggregate method. — [TIN Compliance](https://www.tincompliance.com/form-1099-da/); [CoinTracker](https://www.cointracker.io/blog/1099-da-and-stablecoins)
- **Other de minimis rules and scope:**
  - PDAP sales of ≤$600 a year per customer need not be reported.
  - **"Do not report rewards and staking payments on Form 1099-DA."**
  - Notice 2024-57 excludes wrapping, liquidity provision, staking, lending and some other transactions until further guidance.
  — [IRS i1099DA](https://www.irs.gov/instructions/i1099da)
- **TIN and backup withholding:**
  - Use Form W-9 for US persons and W-8 for foreign persons. Payees who don't furnish a TIN are subject to backup withholding. TINs can be truncated on payee statements but not on IRS filings. — [IRS i1099DA](https://www.irs.gov/instructions/i1099da)
  - **Notice 2025-33** (June 2025): **no backup withholding on digital-asset sales effected in 2025 or 2026**.
  - For 2027 sales, no backup withholding for a customer whose name/TIN was submitted to IRS TIN Matching and **matched**. Pre-existing-account relief is limited to accounts opened before January 1, 2026.
  - Deposit and reporting relief for backup withholding runs through sales effected before January 1, 2028. The reporting start date is unchanged.
  — [IRS news release](https://www.irs.gov/newsroom/irs-provides-additional-transition-relief-for-brokers-who-are-required-to-file-information-returns-and-backup-withhold-on-certain-digital-asset-sales); [RSM](https://www.rsmus.com/insights/tax-alerts/2025/irs-extends-digital-asset-broker-relief-through-2027); [KPMG](https://kpmg.com/us/en/taxnewsflash/news/2025/06/tnf-notice-2025-33-extended-transitional-relief-from-reporting-and-backup-withholding-rules-for-custodial-brokers-effectuating-digital-asset-transactions.html); [EY](https://taxnews.ey.com/news/2025-1267-irs-extends-transitional-relief-from-broker-reporting-and-withholding-on-digital-assets)
  - The draft Form W-9 adds a US digital-asset-broker certification (exempt payee code 14). Commentators asked the IRS to clarify how it interacts with the Notice 2025-33 relief. — [KPMG on draft W-9](https://kpmg.com/kpmg-us/content/dam/kpmg/pdf/2025/091925-irs-issued-draft-form-w9.pdf)
- **Rewards:**
  - Rewards are ordinary income at fair market value when received. Rev. Rul. 2023-14 says staking rewards are income on dominion and control.
  - Because rewards are not a sale, a centralised payer may report them on **1099-MISC** (other income). — [The Tax Adviser, Mar 2026](https://www.thetaxadviser.com/issues/2026/mar/navigating-the-form-1099-da-reporting-maze/); [IRS digital assets](https://www.irs.gov/filing/digital-assets)
  - In 2025, PayPal issued 1099-MISC for crypto bonuses, prizes and awards of $600 or more. — [PayPal help](https://www.paypal.com/cshelp/article/help679)
- **OBBBA threshold:**
  - The 1099-MISC and 1099-NEC threshold rose from $600 to **$2,000 for payments made after December 31, 2025**, indexed for inflation after 2026, and backup withholding tracks the new threshold. — [Patriot Software](https://www.patriotsoftware.com/blog/accounting/1099-reporting-threshold/); [Littler](https://www.littler.com/news-analysis/asap/tax-bill-changes-1099-reporting-thresholds); [RSM](https://rsmus.com/insights/tax-alerts/2025/tips-navigating-obbba-new-changes-us-tax-reporting-withholding-rules.html); [CPA Practice Advisor](https://cpapracticeadvisor.com/2025/07/30/one-big-beautiful-bill-act-changes-1099-thresholds/165863/)
  - **Conflict:** Avalara describes the effective timing differently (it says "effective for 2027"). — [Avalara](https://www.avalara.com/us/en/blog/2025/07/one-big-beautiful-bill-act-1099-reporting-threshold)

### Inferences
- **Broker status turns on who "effects" the USD↔USDC conversion.**
  - ACH-in, mint or buy USDC, then redeem and ACH-out: each redemption to the bank is a **sale of USDC for cash**.
  - If Dakota is the counterparty and agent, Dakota is likely the broker, and the app may still be a "digital asset middleman" or co-broker, depending on its role in effecting the transaction.
  - The multiple-broker rules (one broker files when brokers agree, documented with W-9 broker certifications under Notice 2024-56) can allocate the duty. **[counsel + tax adviser + Dakota]** Get a written allocation of 1099-DA responsibility in the Dakota contract.
- **Stablecoin threshold:** under the optional method, most retail users (≤$10k a year of USDC redemptions) produce no 1099-DA. Heavy users get one aggregate 1099-DA per stablecoin. USDC should meet the "qualifying stablecoin" test, but confirm.
- **P2P book transfers in USDC** between users are not sales for USD. They are transfers of the same asset, and transfer-statement rules apply to broker-to-broker transfers. Card spend that converts USDC at the point of sale **may be a PDAP sale or a sale for cash** reportable by whoever effects it. **[counsel]**
- **Rewards characterisation:**
  - **As interest:** "interest" on a stablecoin balance paid by the app could be 1099-INT reportable at a $10 threshold **[not re-fetched]**, and it collides with GENIUS's issuer yield ban and with "deposit"-like optics.
  - **As promotional rewards / other income:** 1099-MISC once a user's annual total reaches $2,000, starting with 2026 payments.
  - **[counsel]** The characterisation drives the form and the threshold.
- **W-9 and backup withholding:**
  - Collect a **W-9 (TIN certification) at onboarding** from every US user. This is needed anyway for KYC and for 1099-DA/1099-MISC.
  - Enrol in IRS TIN Matching before 2027 to keep backup-withholding relief.
  - Build the 24% backup-withholding capability, the B-notice process and FIRE/IRIS e-filing **[not re-fetched]**.
- **Checklist output:**
  - (1) a written 1099-DA responsibility allocation with Dakota;
  - (2) W-9/W-8 collection in onboarding with a TIN certification record;
  - (3) IRS TIN Matching enrolment;
  - (4) a backup-withholding procedure;
  - (5) 1099-MISC (or 1099-INT) issuance for rewards, with a year-end process, payee statements by January 31 and filing via IRIS or FIRE;
  - (6) a written policy electing or declining the optional stablecoin method;
  - (7) a records-retention policy for cost basis and proceeds.

### Gaps
- I did not find any IRS guidance applying the broker rules specifically to a **fiat-on/off-ramp front end layered over a licensed money transmitter**. Allocation between parties must be negotiated.
- I did not confirm the April 2025 CRA repeal of the DeFi/non-custodial broker rule this session. It is believed to be P.L. 119-5 and mostly irrelevant to a custodial model.
- The OBBBA effective-date conflict (2026 vs 2027) needs checking against the IRS 2026 1099-MISC instructions.

---

## 8. Stablecoin-specific marketing rules (GENIUS Act), briefly

### Takeaway
GENIUS Act §4 (12 U.S.C. 5903) makes it **unlawful for anyone**, not just issuers, to represent payment stablecoins as backed by the full faith and credit of the United States, guaranteed by the US government, or covered by federal deposit or share insurance. A violation is treated as an FDI Act §18(a)(4) / 18 U.S.C. 709 violation. It is also unlawful to market a product as a "payment stablecoin" unless it is issued under the Act, with fines of up to $500,000 per violation for knowing and willful participation. The Act is expected to be effective **January 18, 2027**. Digital-asset service providers may not offer non-permitted stablecoins to US persons from **July 18, 2028**. The legal-tender marketing ban and the yield ban apply on their face to issuers.

### Cited Findings
- §5903(e)(2)(A): "It shall be unlawful to represent that payment stablecoins are backed by the full faith and credit of the United States, guaranteed by the United States Government, or subject to Federal deposit insurance or Federal share insurance." Under (e)(2)(B), a violation is treated as a violation of 12 U.S.C. 1828(a)(4) or 18 U.S.C. 709. — [Cornell LII, 12 U.S.C. 5903](https://www.law.cornell.edu/uscode/text/12/5903)
- §5903(e)(3): it is unlawful to market a product in the US as a payment stablecoin unless it is issued under the chapter. Knowing and willful participation carries fines of up to **$500,000 per violation**, and related acts are counted as one violation. — [Cornell LII](https://www.law.cornell.edu/uscode/text/12/5903)
- §5903(a)(9)(A): **permitted issuers** may not market a stablecoin in a way a reasonable person would perceive as legal tender, issued by the US, or guaranteed or approved by the US government. — [Cornell LII](https://www.law.cornell.edu/uscode/text/12/5903)
- §5903(a)(11): **permitted and foreign issuers** may not pay holders "any form of interest or yield (whether in cash, tokens, or other consideration) solely in connection with the holding, use, or retention" of the stablecoin. — [Cornell LII](https://www.law.cornell.edu/uscode/text/12/5903)
- Effective date: the earlier of 18 months after July 18, 2025 or 120 days after final regulations. — [Cornell LII statutory note](https://www.law.cornell.edu/uscode/text/12/5903)
- Treasury's proposed rule on GENIUS prohibitions was published August 18, 2026 (91 FR 53368), with **comments due October 19, 2026**. It notes the Act's effective date is expected to be January 18, 2027, and that from July 18, 2028 DASPs may not offer or sell non-permitted stablecoins to US persons. Examples of an "offer" include advertising payment stablecoins as available for purchase in the US. Non-issuers providing **white-label branding** may face criminal exposure if they knowingly take part in unlawful issuance. — [Sullivan & Cromwell, Aug 2026](https://www.sullcrom.com/insights/memo/2026/August/Treasury-Department-Proposes-Rules-Clarifying-GENIUS-Act-Prohibitions); [Federal Register 2026-16796](https://www.federalregister.gov/documents/2026/08/18/2026-16796/genius-act-regulations-on-payment-stablecoin-issuance-offer-and-sale)

### Inferences
- The app's copy must never say or imply that USDC balances are "insured", "FDIC-protected", "government-backed", "as safe as a bank" or "legal tender". Wording such as "a digital dollar issued by [issuer], redeemable 1:1, not FDIC-insured, not a deposit" is the safer pattern. This overlaps with Part 328 Subpart B (Section 1), and both regimes now converge on the same penalty provision, §1828(a)(4).
- If **rewards** are funded by the issuer (Circle) or are economically tied to holding a balance, they bear directly on the §5903(a)(11) yield ban and on the ongoing market-structure debate over third-party rewards. **[counsel; covered in depth by the GENIUS researcher]**
- **Checklist output:** a marketing-copy standard and banned-terms list (FDIC, insured, guaranteed, government-backed, legal tender, savings account, interest), reviewed before every campaign, with sign-off records retained.

### Gaps
- Whether Treasury's final rules will expressly reach third-party distributors' "marketing" (not just offers and sales) is open. The NPR comment period closed October 19, 2026, and no final rule was found.
- Whether third-party (non-issuer) rewards on stablecoin balances will be restricted by market-structure legislation was not researched here. It is the GENIUS researcher's scope.

# US Federal Stablecoin Law (GENIUS Act, Market-Structure Bills) and Federal Charter Routes for a Fintech — status as of 2026-11-24

Research notes, not legal advice. "Snippet-level" marks a fact taken from search-result summaries rather than a page I read in full; verify those before relying on them. Primary statute text was read directly from the enrolled Public Law 119-27 on govinfo.gov.

## 1. GENIUS Act: implementation status (Nov 2026) and what applies to a non-issuer platform holding and transferring stablecoins for consumers

### Takeaway
The GENIUS Act takes effect **January 18, 2027** (18 months after enactment). That date comes first because the OCC's final rule (Oct 21, 2026) is the only final primary-regulator rule, and 120 days after it would be later. Almost every other implementing rule (Treasury, FDIC, Fed, NCUA, FinCEN/OFAC) is still a **proposal**. For a non-issuer consumer platform, the duties that matter are:
- **From Jan 18, 2027:** only permitted issuers may issue payment stablecoins in the US.
- **Marketing and insured-status misrepresentation bans:** these apply to anyone.
- **From July 18, 2028:** the digital asset service provider (DASP) ban on offering or selling any payment stablecoin not issued by a permitted issuer, plus foreign-issuer conditions. Treasury's August 2026 proposal would implement this.
- **Section 10 custody rules:** these bind whoever custodies the coins. Here that is Dakota, but counsel must test whether Moneta's role makes it a custodian or DASP.

### Cited Findings
**Statute basics (P.L. 119-27, S. 1582, signed July 18, 2025)**
- Effective date (Sec. 20): the Act takes effect on the earlier of (1) 18 months after enactment or (2) 120 days after the primary federal payment stablecoin regulators issue any final implementing regulations — [GENIUS Act text, govinfo](https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm). The OCC final rule "takes effect on January 18, 2027," which is the same day as the Act — [Mayer Brown, Nov 4, 2026](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking).
- DASP definition (Sec. 2(7)): a person that, "for compensation or profit, engages in the business in the United States (including on behalf of customers or users in the United States)" of:
  - (i) exchanging digital assets for monetary value;
  - (ii) exchanging digital assets for other digital assets;
  - (iii) transferring digital assets to a third party;
  - (iv) acting as a digital asset custodian; or
  - (v) participating in financial services relating to digital asset issuance.

  Excluded: distributed ledger protocols; developing or operating protocols or self-custodial software interfaces; immutable self-custodial software interfaces; validators; and participation in liquidity pools for peer-to-peer liquidity — [GENIUS Act text](https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm).
- Issuer limitation (Sec. 3(a)): "It shall be unlawful for any person other than a permitted payment stablecoin issuer to issue a payment stablecoin in the United States." Under Sec. 3(f), whoever "knowingly participates in a violation of subsection (a)" faces up to $1,000,000 per violation, up to 5 years' imprisonment, or both — [GENIUS Act text](https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm).
- DASP offer and sale ban (Sec. 3(b)(1)): "beginning on the date that is 3 years after the date of enactment" (that is, **July 18, 2028**), "it shall be unlawful for a digital asset service provider to offer or sell a payment stablecoin to a person in the United States, unless the payment stablecoin is issued by a permitted payment stablecoin issuer." Exceptions are the Sec. 3(c) Treasury safe harbors and the Sec. 18 foreign comparability regime — [GENIUS Act text](https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm).
- Foreign issuers (Sec. 3(b)(2) and Sec. 8):
  - A DASP may not offer or make available a foreign issuer's stablecoin unless the issuer can and will comply with US lawful orders.
  - Treasury can designate a noncompliant foreign issuer and then bar DASPs from "facilitating secondary trading." A DASP that knowingly violates that bar faces up to **$100,000 per violation per day**, and Treasury can seek an injunction to stop a DASP from offering the coin — [GENIUS Act text](https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm).
- Insured-status and marketing rules (Sec. 4(e)), which apply to "any person" and not just issuers:
  - Payment stablecoins "shall not be backed by the full faith and credit of the United States, guaranteed by the United States Government, subject to deposit insurance by the [FDIC], or subject to share insurance by the [NCUA]."
  - "It shall be unlawful to represent that payment stablecoins are backed by the full faith and credit of the United States, guaranteed by the United States Government, or subject to Federal deposit insurance or Federal share insurance." Violations are treated as violations of 12 U.S.C. 1828(a)(4) or 18 U.S.C. 709.
  - "It shall be unlawful to market a product in the United States as a payment stablecoin unless the product is issued pursuant to this Act." Knowing and willful participation carries up to $500,000 per violation — [GENIUS Act text](https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm).
- The OCC final rule requires issuer redemption disclosures to state that stablecoins are not deposits, are not FDIC/NCUA-insured, "are not legal tender and are not issued, guaranteed, or approved by the United States" — [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking).
- Custody (Sec. 10): a person may engage "in the business of providing custodial or safekeeping services for the payment stablecoin reserve, the payment stablecoins used as collateral, or the private keys used to issue permitted payment stablecoins" only if it meets two tests:
  1. It is supervised by a federal payment stablecoin regulator or another listed federal financial regulator, or by a state bank or credit union supervisor that shares information with the Fed.
  2. It treats customer stablecoins, keys and cash "as belonging to such customer," protects them from the custodian's creditors, and keeps them segregated and not commingled. Omnibus accounts are allowed at a state-chartered depository institution, insured depository institution, national bank or trust company.

  [GENIUS Act text](https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm)
- OCC custody subpart (Part 15, Subpart C, §§15.20–15.23): applies only to payment stablecoins made available to US persons. It reaches collateral "only where the custodian has actual knowledge of that use." It requires written custody agreements and separate recordkeeping, permits omnibus sub-custody accounts with safeguards (§15.22(c)), and excludes hardware and software providers that do not control keys or offer custody — [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking).
- AML/BSA: a permitted payment stablecoin issuer "shall be treated as a financial institution for purposes of the Bank Secrecy Act" (Sec. 4(a)(5)) — [GENIUS Act text](https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm). FinCEN must issue guidance and rulemaking within 3 years of enactment on illicit-finance detection, including "tailored risk management standards for financial institutions interacting with decentralized finance protocols." Treasury owes Congress recommendations on "the scope of the term 'digital asset service provider'" (Sec. 9) — [GENIUS Act text](https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm).
- Pending-applicant waiver (Sec. 5(f)): regulators may waive the Act's requirements "for a period not to exceed 12 months beginning on the effective date" for an insured depository institution subsidiary or a federal qualified issuer "with a pending application on that effective date" — [GENIUS Act text](https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm). Under the OCC final rule, existing OCC-approved issuers are not grandfathered. The one-year waiver is available only to applicants with applications "pending with the OCC pursuant to the new rule as of January 18" — snippet-level, [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking).
- Payment stablecoin definition: excludes national currency, deposits (including tokenized deposits) and securities. There is a carve-out stating that a PPSI's coin is not a security "solely by virtue of" meeting the stablecoin conditions — [GENIUS Act text](https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm).

**Rulemaking status by agency (as of Nov 2026)**

*OCC (final)*
- Proposed Feb 25, 2026 and final rule issued Oct 21, 2026, effective Jan 18, 2027 — [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking). Sources disagree on the proposal date: some say March 2, 2026 Federal Register publication — snippet-level, [Gibson Dunn](https://www.gibsondunn.com/the-genius-act-occ-finalizes-its-payment-stablecoin-framework/).
- Changes from the proposal:
  - Insured-deposit reserve diversification cut from 10% to 5%.
  - 30% weekly-liquidity and 20-day WAM tests dropped.
  - The automatic 7-day redemption extension replaced by a 24-hour OCC notice.
  - Capital and the operational backstop must be met "at all times."

  [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking)
- OCC procedure: 30 days to determine completeness and 120 days to decide a complete application, after which it is deemed approved. The OCC declined to create a separate approval process for DASP activities and confirmed that independently authorized activities are not limited by Part 15 (§15.10(b)(2)) — [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking).
- As of Oct 28, 2026, the OCC was the only primary federal payment stablecoin regulator to have finalized its GENIUS rules. The Stablecoin Certification Review Committee (SCRC) had adopted interim procedures, and "nearly every other implementing rulemaking remains at the proposal stage" — snippet-level, [WilmerHale, Oct 27, 2026](https://www.wilmerhale.com/en/insights/client-alerts/20261027-occ-finalizes-genius-act-rule-for-permitted-payment-stablecoin-issuers-easing-several-key-proposed-requirements-and-raising-new-issues).

*Treasury (proposed): Section 3 issuance, offer and sale rule*
- Published Aug 18, 2026 as FR Doc. 2026-16796 (docket TREAS-DO-2026-0496). Comments closed Oct 19, 2026 — snippet-level, [Federal Register](https://www.federalregister.gov/documents/2026/08/18/2026-16796/genius-act-regulations-on-payment-stablecoin-issuance-offer-and-sale).
- From July 18, 2028, DASPs must ensure that only qualifying stablecoins are offered or sold. A DASP may rely on an issuer's representations if it does "reasonable due diligence."
- DASP safe harbor for non-US customers: the DASP must reasonably believe recipients are not in the US, implement avoidance policies, and avoid US-targeted advertising.
- Ongoing safe harbors for direct person-to-person transfers without an intermediary, transfers between accounts owned by the same individual at the same parent company, and self-custody transactions.

  [Jones Day, Aug 2026](https://www.jonesday.com/en/insights/2026/08/us-treasury-proposes-genius-act-rules-for-stablecoin-issuance-offer-and-sale)
- Treasury concluded that a strict reading of the foreign-issuer provision "would effectively foreclose DASPs from offering or selling FPSI-issued stablecoins and is not compelled by the statute" — snippet-level, [Freshfields](https://www.freshfields.com/en/our-thinking/blogs/a-fresh-take/treasury-proposes-genius-act-gatekeeping-rules-with-a-path-for-foreign-issuers-102nri4).
- Proposed §1523.3(d)(3) treats a DASP as offering to a US person if it answers an unsolicited US inquiry by indicating willingness to sell — snippet-level, [Federal Register](https://www.federalregister.gov/documents/2026/08/18/2026-16796/genius-act-regulations-on-payment-stablecoin-issuance-offer-and-sale).

*FinCEN / OFAC and the banking agencies (proposed)*
- FinCEN and OFAC proposed a joint AML/CFT and sanctions program rule for PPSIs, published Apr 10, 2026 (FR Doc. 2026-06963).
  - Issuers would be BSA financial institutions with block/freeze/reject capabilities.
  - Comments were due June 9, 2026, and the rule would take effect 12 months after finalization.

  [Holland & Knight](https://www.hklaw.com/en/insights/publications/2026/04/fincen-and-ofac-propose-aml-sanctions-rules-for-stablecoin-issuers); [Federal Register](https://www.federalregister.gov/documents/2026/04/10/2026-06963/permitted-payment-stablecoin-issuer-anti-money-launderingcountering-the-financing-of-terrorism)
- June 18, 2026: FinCEN, OCC, Fed, FDIC and NCUA jointly proposed the GENIUS customer identification program rule — [FinCEN](https://www.fincen.gov/news/news-releases/fincen-agencies-propose-rule-implement-genius-act-customer-identification).

*FDIC (proposed)*
- Application-procedures NPR approved Dec 16, 2025 and published Dec 19, 2025 (RIN 3064-AG20), with a 120-day decision clock — [FDIC](https://www.fdic.gov/news/press-releases/2025/fdic-approves-proposal-establish-genius-act-application-procedures-fdic).
- Pass-through insurance proposal at 91 FR 18534 (Apr 10, 2026): deposits held as stablecoin reserves "are not insured to payment stablecoin holders on a pass-through basis," only as corporate deposits of the issuer — quoted in [OCC Corporate Decision #1392](https://www.occ.gov/topics/charters-and-licensing/interpretations-and-decisions/2026/cd1392.pdf). Mayer Brown notes this proposal is not final — [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking).

*Federal Reserve (proposed)*
- Sept 24, 2026: two proposals, one an application process for state member bank subsidiaries and the other substantive issuer rules (Docket R-1899, published Sept 29, 2026) — [Federal Reserve](https://federalreserve.gov/newsevents/pressreleases/bcreg20260924a.htm).

*NCUA (proposed)*
- February 2026 proposal, plus a supplemental proposal published May 18, 2026 (docket NCUA-2026-1024) — [Federal Register](https://www.federalregister.gov/documents/2026/05/18/2026-09915/implementing-the-guiding-and-establishing-national-innovation-for-us-stablecoins-act-for-the).

### Inferences
- **Two hard dates for Moneta's road map.**
  - **Jan 18, 2027:** RD, USDC and any other coin Moneta touches must come from a permitted payment stablecoin issuer (PPSI), from an applicant protected by the up-to-12-month waiver, or from a qualifying foreign issuer. Otherwise the issuer is in violation of Sec. 3(a). A platform that "knowingly participates" could be exposed under Sec. 3(f).
  - **July 18, 2028:** Moneta itself, if it is a DASP, may only offer or sell permitted coins to US persons.
- **Who currently issues RD, and has that entity filed a Part 15 (or state) application?** This is the single most important diligence question. For an OCC-route issuer, the waiver appears to require an application pending under the new rule by Jan 18, 2027. Dakota's July 28, 2026 charter application (see Section 4) is a trust-bank charter application, and whether it also counts as a pending GENIUS issuer application is a question for counsel.
- **Whether Moneta is a DASP is a counsel call.** Moneta takes compensation and "transfers digital assets to a third party" or acts as a custodian. That likely makes it a DASP if it holds customer accounts or keys or directs transfers in its own name. It may not be one if it is purely a software front-end for Dakota, the licensed party. The definition's exclusions cover self-custodial software, not hosted front-ends.
- **Consumer copy.** Under the Sec. 4(e) rules, Moneta's UI and marketing cannot say or imply that balances are FDIC-insured, government-backed or "legal tender." This matches the existing "not FDIC-insured" copy guardrail. Any pass-through-insurance messaging about reserve deposits would conflict with the FDIC proposal.
- **Custody.** Sec. 10 literally covers custody of reserves, collateral coins and issuance keys. Whether it reaches ordinary hosted consumer wallets is a statutory-scope question. Practically, Dakota is a state-licensed money transmitter and not "supervised by a State bank supervisor" in the Sec. 10 sense. That would matter if Sec. 10 applies to its custody. A national trust charter would cure it.

### Gaps
- I did not read the Treasury proposal's full text, which the Federal Register blocked for automated fetch. Still unconfirmed:
  - how it defines "offer or sell";
  - whether custody or transfer-only services count;
  - whether it adds DASP-specific penalties or anti-evasion rules on yield. One search summary claimed "fines up to $1 million per violation or imprisonment up to five years," but in the statute those penalties attach to Sec. 3(a) unlawful issuance, not to the DASP ban.
- I found no final rule from Treasury, FDIC, the Fed, NCUA or FinCEN/OFAC as of late Nov 2026. That is consistent with the WilmerHale note, but not confirmed after Oct 28.
- I found no source on whether Treasury has issued the Sec. 18 foreign-regime comparability determinations, for example for EU MiCA or UK regimes.
- Who issues RD, under what licence, and whether a Part 15 or state application is on file: not found in public sources.

## 2. Yield and rewards: the issuer ban, and whether exchanges, wallets, affiliates or third parties may pay "rewards" on stablecoin balances

### Takeaway
The statute bars only **issuers** (permitted and foreign) from paying interest or yield "solely in connection with the holding, use, or retention" of a payment stablecoin. It does not expressly bar exchanges, wallets or other third parties. The OCC's final rule (Oct 21, 2026) **dropped** the proposed presumption that affiliate and third-party rewards arrangements are prohibited yield. It will instead judge each arrangement on its facts, with no safe harbor and an express anti-evasion reservation. The legislative fix in the Senate CLARITY text died with the Sept 15, 2026 cloture vote. That text would have banned deposit-like yield on idle balances while allowing "bona fide activity-based rewards." Result: third-party balance rewards are currently **not expressly prohibited by statute but carry live evasion risk**. Rewards funded by the issuer or an issuer affiliate are the riskiest. Counsel must decide the structure.

### Cited Findings
- Statute, Sec. 4(a)(11): "No permitted payment stablecoin issuer or foreign payment stablecoin issuer shall pay the holder of any payment stablecoin any form of interest or yield (whether in cash, tokens, or other consideration) solely in connection with the holding, use, or retention of such payment stablecoin" — [GENIUS Act text](https://www.govinfo.gov/content/pkg/PLAW-119publ27/html/PLAW-119publ27.htm).
- CRS: the Act "prohibits issuers from paying yield directly to customers but does not explicitly prohibit exchanges from paying yield to their customers" — snippet-level, [CRS IF13174, "The Stablecoin Yield Debate," Mar 6, 2026](https://www.congress.gov/crs-product/IF13174).
- What the OCC final rule does:
  - The yield ban sits in §15.10(c)(4) for PPSIs and §15.31(c) for foreign issuers.
  - The proposal's rebuttable presumption that certain affiliate and related third-party arrangements violate the ban "was not finalized," for either PPSIs or foreign issuers.
  - There is "no safe harbor, white-label carve-out, or de minimis exception," and "the OCC retains its authority to address evasion of section 4."
  - Affiliate and insider transactions must not be "quantitatively detrimental" to the issuer.

  [Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking)
- OCC quotes reported by CoinDesk:
  - The OCC "will apply the language of the statute to the facts and circumstances of any particular arrangement."
  - "The OCC declines to presume that rewards programs that predated the GENIUS Act comply with the GENIUS Act."
  - "Unless and until such legislation passes, the OCC must implement the GENIUS Act's yield prohibition, as enacted."
  - A reward that "might be made, at least in part, for other reasons" would fall outside the ban.

  CoinDesk also reports that Coinbase One pays 3.75% on USDC positions — [CoinDesk, Oct 21, 2026](https://www.coindesk.com/policy/2026/10/21/occ-s-final-rule-to-start-fresh-in-weighing-stablecoin-rewards-against-genius-act-ban). CoinDesk's summary also says exchanges' existing programs need OCC sign-off and get no safe harbor. That is CoinDesk's characterization; the rule text was not verified on this point.
- Industry position: Coinbase and others argued that the statute reaches only issuer-paid yield and that the OCC's presumption exceeded its authority — snippet-level, [Forbes, May 20, 2026](https://www.forbes.com/sites/digital-assets/2026/05/20/the-genius-act-stablecoin-yield-ban-has-a-coinbase-shaped-hole/).
- Senate legislative fix (now stalled):
  - Senators Tillis and Alsobrooks released a compromise on May 1–2, 2026. It bans rewards "economically or functionally equivalent to the payment of interest or yield on an interest-bearing bank deposit" while leaving room for activity-based rewards. Regulators would define permissible reward activities and a disclosure regime — [Sheppard Mullin via National Law Review, May 14, 2026](https://natlawreview.com/article/stablecoin-yield-saga-senate-compromise-signals-path-forward-clarity-act); [Forbes, May 1, 2026](https://www.forbes.com/sites/jasonbrett/2026/05/01/tillis-alsobrooks-reach-compromise-on-stablecoin-yield-in-clarity-act/).
  - The May 12, 2026 Senate Banking text "prohibit[s] interest or yield on idle stablecoin balances while permitting activity-based rewards" — [Latham & Watkins tracker](https://www.lw.com/en/us-crypto-policy-tracker/legislative-developments).
  - An earlier March 2026 draft would not "allow rewards on balances" — snippet-level, [CoinDesk, Mar 23, 2026](https://www.coindesk.com/policy/2026/03/23/stablecoin-yield-in-crypto-clarity-act-won-t-allow-rewards-on-balances-latest-text-says).
  - The ABA wanted crypto firms also barred from "allow[ing] yield-like benefits to reach stablecoin holders indirectly" — snippet-level, [Yahoo Finance](https://finance.yahoo.com/markets/crypto/articles/banks-stay-tight-lipped-senators-180152795.html).
- The bill carrying that compromise failed cloture on Sept 15, 2026 (see Section 3). Commenters had asked the OCC to wait for CLARITY on yield, and the OCC declined — [CoinDesk](https://www.coindesk.com/policy/2026/10/21/occ-s-final-rule-to-start-fresh-in-weighing-stablecoin-rewards-against-genius-act-ban).

### Inferences
- Paying users a balance-based return on a payment stablecoin breaks down by who pays it:
  - **Paid by Moneta from its own revenue, as an unaffiliated platform:** not expressly barred by GENIUS.
  - **Paid or funded by the issuer, or passed through from the issuer's reserve income** (for example, Dakota paying Moneta, which passes it on): this is the fact pattern the OCC reserved the right to treat as evasion.
- If RD's "rewards" are paid by the issuer itself, RD likely cannot keep paying them once its issuer becomes a PPSI. That would be on or after Jan 18, 2027, or the end of any waiver.
- If RD's return is a pass-through of Treasury yield, RD may not be a "payment stablecoin" at all, but a security or tokenized fund. That would bring SEC regimes into play. Counsel must classify RD before Moneta offers it.
- Lower-risk designs under the defeated Senate framework, which signals where regulators lean: rewards tied to activity (payments, card spend, transfers), clearly funded by Moneta, not computed as a percentage of idle balance, and with disclosures. "Membership" yield was specifically attacked by bank groups.
- Marketing language such as "earn X% APY on your dollars" invites deposit-equivalence and misrepresentation scrutiny. It should be avoided regardless of structure.

### Gaps
- I did not read the OCC final rule's preamble directly to confirm what exchanges must do. CoinDesk's reporting that exchanges need OCC approval is unclear, because the OCC does not supervise exchanges.
- No Treasury, SEC or CFTC guidance on third-party stablecoin rewards was found.
- RD's legal structure (issuer, who pays rewards, the source of funds) is not publicly documented in the sources found.

## 3. Market-structure legislation (CLARITY Act and Senate bills): status and registration exposure for a wallet or payment app

### Takeaway
The House passed CLARITY (H.R. 3633) 294-134 on July 17, 2025. Senate Agriculture (Jan 29, 2026, party line) and Senate Banking (May 14, 2026, 15-9) each advanced their versions. On **Sept 15, 2026 the Senate failed cloture on the motion to proceed (49-50)**. Law firms describe the bill as "effectively dead for the remainder of this Congress." There is therefore **no enacted federal requirement** for a wallet or payment app to register as a digital-commodity broker, dealer or custodian. The House bill's CFTC broker, dealer and exchange registration regime remains a template for future legislation. Agencies are proceeding under existing authority, and the CFTC has a crypto-markets rule at OIRA, with no binding rule expected before late 2027.

### Cited Findings
- Senate path, in order:
  - House passed CLARITY 294-134 on July 17, 2025.
  - Senate Agriculture advanced its bill (Digital Commodity Intermediaries Act) 12-11 on Jan 29, 2026.
  - Senate Banking released a 309-page text on May 12, 2026 and advanced it 15-9 on May 14, 2026, with Democrats Alsobrooks and Gallego joining.
  - The bill was placed on the Senate calendar (No. 423) on June 1, 2026.
  - Before enactment it still needed reconciliation with the Agriculture version, a 60-vote floor vote and reconciliation with the House.

  [Latham & Watkins tracker](https://www.lw.com/en/us-crypto-policy-tracker/legislative-developments); [Troutman, May 2026](https://www.troutmanfinancialservices.com/2026/05/senate-banking-committee-advances-clarity-act-in-bipartisan-vote/)
- The cloture vote on Sept 15, 2026 failed 49-50, with one senator not voting, 11 short of 60. The article calls the bill "effectively dead for the remainder of this Congress" — [Troutman Pepper Locke, Sept 25, 2026](https://www.troutman.com/insights/in-the-wake-of-clarity-acts-failure-agencies-move-forward-without-congressional-action-or-certainty/); [CNBC](https://www.cnbc.com/2026/09/15/senate-cloture-vote-on-clarity-act-fails-dealing-regulatory-setback-to-crypto-industry.html); [DLA Piper](https://www.dlapiper.com/en/insights/publications/2026/09/senate-fails-to-advance-the-clarity-act). Coverage attributes the failure mainly to ethics language on officials' crypto holdings. A reconsideration motion was entered, and some outlets say the bill is "stalled, not killed" — snippet-level, same search set.
- House CLARITY "creates a CFTC registration regime for digital commodity exchanges, brokers, and dealers" — [Latham tracker](https://www.lw.com/en/us-crypto-policy-tracker/legislative-developments).
- Agency actions instead of legislation:
  - **SEC:** proposed "Regulation Crypto Assets" on Aug 18, 2026 (fundraising exemptions up to $20M/$75M; comments due Oct 20, 2026).
  - **CFTC, Sept 17, 2026:** sent "Regulation Crypto Asset Transactions and Regulation Crypto Asset Markets" (RIN 3038-AF80) to OIRA, with a binding rule not expected before late 2027.
  - **CFTC Staff Letter 26-25 (Sept 17, 2026):** extended introducing-broker no-action relief to "passive software providers" routing users' own orders to registered intermediaries and DCMs.
  - The CFTC "cannot create a spot intermediary registration regime without Congress."

  [Troutman Pepper Locke](https://www.troutman.com/insights/in-the-wake-of-clarity-acts-failure-agencies-move-forward-without-congressional-action-or-certainty/)
- State regimes remain relevant to wallets and payment apps. California's DFAL, effective July 1, 2025, covers exchange, transfer, storage or administration of digital assets for California residents. Illinois enacted digital-asset business registration in Aug 2025 — [Latham tracker](https://www.lw.com/en/us-crypto-policy-tracker/legislative-developments). These are state-level and out of scope beyond flagging.

### Inferences
- For a consumer stablecoin wallet that holds only payment stablecoins, which GENIUS keeps out of the commodity and securities definitions, the failed bill would mainly have mattered for the yield rule. It would also matter if Moneta later lists non-stablecoin crypto, where it would have triggered CFTC broker or dealer registration.
- With no federal market-structure law, the federal touchpoints for a stablecoin-only consumer app remain GENIUS (DASP), BSA (via Dakota or Moneta's own MSB status) and consumer-protection law.
- Watch for reintroduction in the next Congress (2027). Any revived Senate text will likely carry the Tillis-Alsobrooks yield language, which would bind DASPs and platforms directly.

### Gaps
- The official Senate roll-call direction is inconsistent across coverage: CNBC was reported as 50-49 in one summary, while others say 49-50. The outcome, cloture not invoked, is consistent.
- I did not read the Senate Banking or Agriculture texts' intermediary and custodian registration sections directly. Whether they would have required a stablecoin-only wallet to register is unconfirmed.

## 4. Federal charter routes: requirements, capital, timelines, cost, and recent fintech and crypto applicants

### Takeaway
Under Comptroller Gould the OCC has approved crypto and fintech charters at record pace. It is also now denying weak applications (Wise in July 2026, plus a full-service bank denial in August 2026), and the ICBA is suing over trust charters (filed Oct 2, 2026). The four main routes compare as follows:

| Route | Capital | Timing | Notes |
|---|---|---|---|
| (a) National trust bank: uninsured, no deposits or lending | Recent decisions require ~$7–10M initial capital or $10M tier 1, plus 180 days of wind-down opex in liquid assets | Median approval ~4–5 months; capital within 12 months and open within 18 months of conditional approval | Exempt from BHC Act if structured to avoid the "bank" definition. Dakota filed for this on July 28, 2026. |
| (b) Full-service de novo national bank | Revolut must raise ≥$95M; Erebor reportedly ~$625M | Also needs FDIC insurance (new two-phase process) and Fed approval for the holding company | The real "neobank" charter. |
| (c) State-chartered ILC | e.g., OneMain $341M capital, 15% leverage | FDIC-approved | Parent avoids BHC Act. |
| (d) State charters such as a Wyoming SPDI | — | — | Kraken got a limited Fed master account in March 2026, not yet live. A Fed "payment account" for nonbanks was proposed in May 2026 and is not final. |

Application cost is not publicly documented.

### Cited Findings
**Recent approvals (OCC national trust banks)**

Tracker dates are snippet- and tracker-level. Verify against OCC corporate decisions.

| Company | Charter | Conditional approval | Final approval / status |
|---|---|---|---|
| Circle | National trust | Dec 12, 2025 | Final Jul 10, 2026 |
| Ripple | National trust | Dec 12, 2025 | Final Oct 26, 2026 |
| BitGo | Conversion | Dec 12, 2025 | Final Jan 29, 2026 |
| Paxos | Conversion | Dec 12, 2025 | Conditional; must open by June 2027 |
| Fidelity Digital Assets | Conversion | Dec 12, 2025 | Conditional; must open by June 2027 |
| Bridge (Stripe) | National trust | Feb 12, 2026 | Conditional |
| Crypto.com / Foris DAX | National trust | Feb 20, 2026 | Conditional; custody only |
| Coinbase | National trust | Apr 2, 2026 | Final Nov 6, 2026 |
| World Liberty Financial | National trust | Aug 14, 2026 | Conditional; must raise $20M tier 1 |

[Stablecoin Insider OCC tracker, Nov 16, 2026](https://stablecoininsider.org/occ-charter-tracker/). Coinbase applied in Oct 2025 and announced final approval Nov 9, 2026 — snippet-level, [Coin360](https://coin360.com/news/coinbase-occ-national-trust-bank-charter-approval).

**Primary corroboration: OCC Corporate Decision #1392 (Sept 18, 2026), Catena Trust Bank, N.A. (NY)**
- The decision cites these earlier OCC decisions: CA #1359 (Ripple, Dec 12, 2025), CA #1356 (First National Digital Currency Bank, Dec 12, 2025), CA #1353 (BitGo, Dec 12, 2025), CA #1355 (Fidelity Digital Assets, Dec 12, 2025), CA #1358 (Paxos), CD #1365 (Bridge, Feb 12, 2026), CD #1367 (Foris DAX, Feb 20, 2026) and CD #1385 (World Liberty).
- Catena's approved activities: custody, investment management, trust, conversion and clearing, and execution services "for fiat currency, investment securities, and digital assets, including payment stablecoins that will comply with the GENIUS Act."
- The OCC rejected bank trade groups' argument that stablecoin issuance is deposit-taking. It said "stablecoins are not deposits under the FDI Act," and noted that GENIUS defines a federal qualified issuer to include an uninsured national bank.

  [OCC CD #1392](https://www.occ.gov/topics/charters-and-licensing/interpretations-and-decisions/2026/cd1392.pdf)

**Conditions imposed in CD #1392**, typical of the crypto trust-bank template:
1. Limit operations to "those of a trust company and activities related thereto" and not meet the BHC Act §2(c)(1)–(2) "bank" definition.
2. Conform, cease or divest stablecoin activities to comply with GENIUS and its regulations, "in the sole discretion of the OCC."
3. 60 days' notice and OCC non-objection before significant business-plan deviations, for 3 years.
4. "Minimum of $10 million in tier 1 capital of which the greater of at least 50 percent… or $5 million, must be held in Eligible Liquid Assets," for 3 years.
5. "180 days of operating expenses in Eligible Liquid Assets," not double counted and calculated on a wind-down scenario.
6. Prior OCC non-objection for new directors and senior officers (including the CCO, BSA officer, CTO, CISO and chief trust officer) for 3 years.

Pre-opening requirements:
- GAAP accrual accounts and an external audit annually for at least 3 years.
- Director qualifying shares and a fidelity bond.
- A biographical and financial report for any 10%+ subscriber.
- A board-adopted BSA/AML/OFAC program.
- An information security program under 12 CFR 30 App. B.
- An IT architecture review.
- A notice letter at least 60 days before opening.
- The bank applies for Federal Reserve Bank stock (12 USC 222).

"If the capital… is not raised within 12 months or if the Bank is not opened for business within 18 months from the preliminary conditional approval date, this approval expires." The OCC "is opposed to granting extensions" — [OCC CD #1392](https://www.occ.gov/topics/charters-and-licensing/interpretations-and-decisions/2026/cd1392.pdf).

**National trust charter application package**
- Charter application under 12 USC 21, 24(Seventh), 92a and 12 CFR 5.20, covering fiduciary powers under 12 CFR 5.26.
- A business plan with detailed financial projections and risk analysis, and a capital and liquidity plan.
- Biographical and financial reports for all organizers, directors and officers.
- Background checks including fingerprints.
- Articles of association and organization certificate.
- Pre-opening: IT architecture and risk plan, information security program, BSA/AML program (12 CFR 21.21), audit, and a preopening exam.

Capital and rule changes:
- Recent trust-bank initial paid-in capital ranged from "$7 million (Paycom National Trust Bank, 2024) to $10 million (UKG National Trust Bank, 2026)," with ongoing tier 1 minimums of $5–7M.
- 12 USC 92a(i) floors capital at the level state trust companies must hold in that state.
- OCC Bulletin 2026-4 amended 12 CFR 5.20 to confirm that national trust banks may conduct non-fiduciary activities related to trust operations, effective Apr 1, 2026.

[Duane Morris, Sept 10, 2026](https://blogs.duanemorris.com/bankinglaw/2026/09/10/applying-for-a-national-trust-charter-key-requirements-from-the-occ/)

Ranges and timing:
- Minimum tier 1 for nondepository trust approvals has ranged "$5 million to $45 million."
- Nondepository trust banks had the fastest approvals since 2025, at a median of 134 days.

Both are snippet-level, attributed in search results to [S&P Global Market Intelligence, Apr 2026](https://www.spglobal.com/market-intelligence/en/news-insights/articles/2026/4/nonbanks-dominate-bank-charter-boom-as-approval-timelines-shrink-100265630). World Liberty was conditioned on $20M tier 1 — [Stablecoin Insider](https://stablecoininsider.org/occ-charter-tracker/).

**Dakota (Moneta's provider)**
- BPI's opposition letter identifies the filing as "Dakota National Trust Bank Charter Application (2026-Charter-347047)," "submitted… on July 28, 2026." BPI argues it would exceed 12 U.S.C. 27(a), which it reads as limiting trust charters to institutions "predominantly engaged in trust and fiduciary activities." It asks the OCC to confirm:
  - no customer-fund liabilities other than trust deposits;
  - no indirect deposit-taking, payments or lending via custody;
  - no commingling of stablecoin reserve cash, including in a Fed master account;
  - 1:1 capital against funds placed at insured banks;
  - adequate parent support.

  BPI notes the public file contains only "a few sentences" — [BPI letter, Aug 27, 2026](https://bpi.com/wp-content/uploads/2026/08/BPI-Comment-Letter-re-Dakota-NTB-Application-8-27-26.pdf).
- Proposed scope: "digital asset custody, stablecoin issuance, and related services," with no deposit-taking. Lead Bank currently provides deposit insurance for Dakota's offering. If conditionally approved, Dakota has 18 months to open — [Banking Dive, Aug 5, 2026](https://www.bankingdive.com/news/dakota-occ-trust-charter-bank-application-stablecoin/827082/).
- The ICBA opposed an application by "Dakota Ridge, a Colorado-based company," to form "Dakota National Trust Bank" in New York, which would issue stablecoins. Grounds: beyond trust powers, lack of independence from the parent, thin banking experience, and "regulatory arbitrage" — [ICBA, Aug 28, 2026](https://www.icba.org/w/icba-opposes-dakota-ridge-national-trust-bank-charter-application). Whether "Dakota Ridge" is Dakota Platform's parent is **unconfirmed**.
- No OCC decision on Dakota was found as of Nov 2026.

**Full-service national banks (insured)**
- **Erebor Bank, N.A. (Columbus, OH):** FDIC approved deposit insurance on Dec 16, 2025, conditioned on being "well capitalized" and lapsing if not established within 12 months — [FDIC](https://fdic.gov/news/press-releases/2025/fdic-approves-deposit-insurance-application-erebor-bank-na-columbus-ohio). It received its final national bank charter in Feb 2026, less than four months after conditional OCC approval — [Banking Dive](https://bankingdive.com/news/erebor-bank-receives-national-bank-charter/811724/). A Substack claims a Feb 8, 2026 launch with $625M initial capital — low-reliability, [insights4vc](https://insights4vc.substack.com/p/erebor-a-stablecoin-native-us-bank). Another outlet expects launch in late 2026 or early 2027 — conflicting, [Crowdfund Insider](https://www.crowdfundinsider.com/?p=256582).
- **Revolut Bank US, N.A.:**
  - Preliminary conditional approval around Sept 2–3, 2026.
  - At least $95M paid-in capital after organizational costs and a ≥10% tier 1 leverage ratio for 3 years.
  - Retail FX excluded pending separate non-objection.
  - FDIC and Fed approvals still needed.

  [Banking Dive](https://www.bankingdive.com/news/revolut-nabs-conditional-occ-charter/829703/). Four product lines were held back — [American Banker](https://www.americanbanker.com/news/revolut-wins-us-charter-with-limits-on-four-products).
- **Nubank:** conditional OCC approval about 121 days after filing (Jan 29, 2026 per tracker), awaiting FDIC and Fed — [Banking Dive](https://www.bankingdive.com/news/nubank-gets-conditional-occ-approval-charter/810981/).
- **Mercury Bank, N.A.:** conditional approval Apr 24, 2026 per tracker. It will be headquartered in Utah, with the parent filing to become a bank holding company and FDIC and Fed approvals pending — [Yahoo Finance/RBI](https://finance.yahoo.com/economy/policy/articles/occ-grants-conditional-approval-mercury-111447858.html).
- "Nearly three dozen fintech-type firms" went through the OCC charter process in 2026, including MoonPay, which is seeking a charter to issue stablecoins federally — [American Banker](https://www.americanbanker.com/news/fintechs-asking-for-and-receiving-bank-charters-in-2026).

**Denials and process tightening**
- **Wise:** the OCC denied its national trust charter in July 2026, citing "long-standing" AML deficiencies. Wise had applied in June 2025 to get direct Fed payment access and plans to refile under the GENIUS framework — [Banking Dive](https://www.bankingdive.com/news/occ-denies-wise-trust-charter-application-aml-deficiencies/826156/).
- **A second denial, a full-service national bank, in early August 2026:** grounds were capital structure, management and board experience, financial assumptions, profitability and unfamiliarity with US law. OCC Bulletin 2026-27 (June 17, 2026) allows returning deficient applications and public denials — [Skadden, Aug 2026](https://www.skadden.com/insights/publications/2026/08/bank-charter-update).
- **FDIC two-phase deposit insurance process (Aug 10, 2026):**
  - Phase I: contingent authorization within 120 days. Requires a comprehensive business plan, 3-year projections and qualified management, filed simultaneously with the OCC or state.
  - Phase II: final approval within 12 months after organizational steps.

  [Skadden](https://www.skadden.com/insights/publications/2026/08/bank-charter-update)

**Litigation risk**
- The ICBA sued the OCC in D.D.C. (filed Oct 2, 2026). It challenges the OCC's authority to charter non-depository, non-fiduciary crypto firms as national trust banks, attacks the 12 CFR 5.20 rule and interpretive letter, and seeks to vacate Protego's conditional charter — [Consumer Finance Monitor](https://www.consumerfinancemonitor.com/2026/10/05/icba-sues-occ-over-crypto-national-trust-bank-charters-a-significant-challenge-to-the-occs-chartering-authority/); [ICBA](https://icba.org/w/occ-release-oct-2026).
- The complaint cites 21 national trust charters approved or conditionally approved under this administration, at least 13 crypto-related — snippet-level, same source.
- No ruling was found.

**Industrial loan companies (state-chartered, FDIC-insured; parent avoids the BHC Act)**
- 2026 approvals:
  - Ford Credit Bank and GM Financial Bank (Jan), with orders lapsing if not established within 12 months — [Financial Regulation News](https://financialregnews.com/fdic-approves-applications-by-ford-gm-to-create-industrial-loan-banks/).
  - Edward Jones, with a ≥9% leverage ratio — [Banking Dive](https://www.bankingdive.com/news/edward-jones-ilc-charter-fdic-approve-industrial-bank-utah/813515/).
  - Stellantis (May) — [Banking Dive](https://www.bankingdive.com/news/stellantis-fdic-ilc-charter-approval-utah-industrial-bank/820364/).
  - OneMain (announced Nov 18, 2026), with ≥$341M capital at launch and a ≥15% leverage ratio — [Banking Dive](https://www.bankingdive.com/news/onemain-fdic-approves-ilc-charter-subprime-lender-cfpb-13-ag-lawsuit-ncrc/875075/).
- PayPal (Utah) and Affirm (Nevada) have pending ILC applications — [Banking Dive](https://www.bankingdive.com/news/stellantis-fdic-ilc-charter-approval-utah-industrial-bank/820364/).

**Fed account access**
- The Kansas City Fed approved a limited-purpose master account for Kraken Financial, a Wyoming SPDI, on Mar 4, 2026 — [Kansas City Fed](https://www.kansascityfed.org/newsroom/2026-news-releases/federal-reserve-bank-of-kansas-city-approves-limited-account/). Its CEO later said it was not yet live — snippet-level, [PYMNTS](https://www.pymnts.com/cryptocurrency/2026/kraken-cracked-the-feds-vault-it-still-cant-spend/).
- The Fed formally proposed a "payment account" ("skinny master account") on May 20, 2026:
  - No intraday credit, no discount window, no interest on balances.
  - Fedwire, NSS and FedNow access.
  - Governor Waller targets a final rule by end-2026.
  - Reserve Banks were asked to pause Tier 3 decisions while policy is finalized.

  [ABA Banking Journal](https://bankingjournal.aba.com/2026/05/fed-releases-formal-proposal-to-create-skinny-master-accounts/); [Mayer Brown, May 2026](https://www.mayerbrown.com/en/insights/publications/2026/05/federal-reserve-access-for-fintechs-executive-order-and-federal-reserve-payment-account-proposal-signal-potential-new-era-for-fintech-payment-access). Not final as of the latest sources found.

### Inferences
- **Fastest federal route for Moneta's stated ambitions** (stablecoin custody, an institutional treasury platform, its own stablecoin issuance) is an OCC national trust bank structured outside the BHC Act. Planning numbers from the 2025–26 decisions:
  - ~$10M+ tier 1 (WLF: $20M), with half in liquid assets;
  - plus 180 days of wind-down opex in liquid assets;
  - ~4–6 months to conditional approval;
  - ≤12 months to capitalize and ≤18 months to open;
  - a 3-year de novo period with business-plan lock-in;
  - an experienced BSA/AML, trust and IT bench, the area where Wise failed.
- **A national trust charter does not allow consumer deposits or lending.** A true consumer "neobank" balance sheet needs a full-service national bank (Revolut: ≥$95M) or an ILC, plus FDIC insurance and, for a national bank parent, BHC Act registration with the Fed.
- **Dakota's own outcome affects Moneta directly.** Dakota's charter is opposed by the BPI and possibly the ICBA. An approval would put Moneta's custodian under federal supervision, which helps Sec. 10 and the institutional pitch. A denial or delay leaves Moneta relying on state money-transmitter licensing. The ICBA lawsuit could cloud all crypto trust charters.
- **Fed access is not needed for Moneta's near-term model.** A payment account would matter only if Moneta later wanted direct Fedwire or FedNow settlement for an institutional fiat-plus-stablecoin product.

### Gaps
- **Application cost:** I found no public figure for legal, consulting or OCC filing-fee costs of a trust or full-service charter. Counsel or consultants would need to quote.
- I did not read the OCC Licensing Manual "Charters" booklet directly, so the exact Interagency Charter Application form contents and current fee schedule are unverified.
- Dakota's public application file (OCC PDF) was not read. Its proposed capital, location and whether it covers RD issuance are unknown.
- Erebor's launch status and capital conflict across sources.
- Stripe/Bridge final approval, and Coinbase and Ripple final-approval dates: tracker-level only.

## 5. Prediction markets: what the CFTC requires, and the 2025–2026 state-vs-CFTC litigation

### Takeaway
A US event-contract venue needs:
- **CFTC designation as a Designated Contract Market (DCM)** to list contracts;
- a **registered Derivatives Clearing Organization (DCO)**, either its own or a partner's, to clear;
- **Futures Commission Merchant (FCM) or introducing broker** registration for any separate intermediary that holds customer funds or routes orders.

Kalshi (DCM 2020, DCO Kalshi Klear 2024) and Polymarket US (DCM QCX, DCO QC Clearing) are the models. The CFTC proposed a public-interest review rule for event contracts in June 2026 (amending Rule 40.11). States are winning in most circuits: the 9th, 6th, 4th and 10th have sided with states, the 3rd with Kalshi. Supreme Court petitions are pending with no cert decision found. Sports contracts therefore remain legally contested state by state.

### Cited Findings
- **Kalshi structure:** KalshiEx LLC has been a DCM since Nov 3, 2020. Its clearing arm, Kalshi Klear LLC, received its DCO order in Aug 2024 — snippet-level, [CFTC DCM list](https://www.cftc.gov/IndustryOversight/IndustryFilings/TradingOrganizations).
- **Polymarket US structure:** QCX LLC (d/b/a Polymarket US) was designated July 9, 2025, with QC Clearing LLC (d/b/a Polymarket Clearing) as DCO, per a CFTC staff no-action letter — snippet-level, [CFTC Staff Letter 26-14](https://www.cftc.gov/csl/26-14/download). An Amended Order of Designation around Nov 24, 2025 enabled intermediated US access, and a Polymarket affiliate has filed for FCM registration — snippet-level, [Yahoo Finance](https://finance.yahoo.com/news/polymarket-secures-cftc-approval-regulated-161424022.html).
- **Applications and FCM costs:** 17 new DCM applications were filed since early 2025 and 7 approved. KPMG gives 60–90 days or 3–6 months for complete applications (two versions of its piece) — snippet-level, [KPMG](https://kpmg.com/us/en/articles/2026/prediction-markets-path-entry.html). An FCM carries "a $1M+ capital requirement" and heavy compliance — snippet-level, secondary, [DeFi Rate](https://defirate.com/news/prediction-market-land-grab-dcms-fcms-and-the-race-to-control-the-stack/).
- **CFTC rulemaking:**
  - The CFTC withdrew its earlier event-contract proposal in Feb 2026 and issued an ANPRM on Mar 12, 2026 — snippet-level, [CFTC release 9194-26](https://www.cftc.gov/PressRoom/PressReleases/9194-26).
  - It then issued an NPRM on June 10, 2026 (Federal Register June 12; comments due July 27) amending Rule 40.11 with a three-step public-interest test.
  - Sports contracts settled on objective league data (scores, advancement, season metrics) are "generally… not contrary to the public interest." Injuries, officiating, discrete in-game actions, altercations and pre-collegiate sports likely are.
  - Contracts are still listed by self-certification (Rule 40.2) or voluntary approval (Rule 40.3).

  [Greenberg Traurig, June 2026](https://www.gtlaw.com/en/insights/2026/6/cftc-proposes-new-rules-for-events-contracts-on-prediction-markets)
- **CFTC no-action relief:** Staff Letter 26-25 (Sept 17, 2026) gives introducing-broker no-action relief to "passive software providers" routing users' orders to DCMs and registered intermediaries — [Troutman Pepper Locke](https://www.troutman.com/insights/in-the-wake-of-clarity-acts-failure-agencies-move-forward-without-congressional-action-or-certainty/).
- **Litigation by circuit:**
  - **3rd Cir. (Apr 2026, NJ):** a divided panel upheld Kalshi's injunction, holding the contracts are swaps and state law is preempted — [Vladeck](https://www.stevevladeck.com/p/262-sports-bets-swaps-and-the-kalshi).
  - **9th Cir. (Aug 2026, NV):** sports event contracts are bets, not swaps — snippet-level, [PYMNTS](https://www.pymnts.com/legal/2026/a-second-federal-appeals-court-rules-sports-event-contracts-are-not-swaps/).
  - **6th Cir. (Sept 25, 2026, OH/TN):** unanimous for the states. It held that even if the contracts were swaps, the CEA would not preempt state law — [CNBC](https://www.cnbc.com/2026/09/25/appeals-court-rules-states-can-regulate-sports-prediction-markets.html); [The Block](https://www.theblock.co/news/regulation/2026-09-26-kalshi-loses-appeal-over-ohio-and-tennessee-sports-betting-laws-widening-circuit-split-416937).
  - **10th Cir. (Sept 8, 2026, Utah):** Kalshi lost an emergency appeal and halted Utah trading — snippet-level, [crypto.news](https://crypto.news/kalshi-suspends-trading-utah-federal-court-loss).
  - **4th Cir. (Nov 18, 2026, MD):** 2-1 that Maryland may enforce its gambling laws — snippet-level, [Sportico](https://www.sportico.com/law/analysis/2026/kalshi-maryland-4th-circuit-ruling-decision-1234958963/).
  - Other matters are pending in the 2nd, 7th and 8th Circuits — snippet-level, [Front Office Sports](https://frontofficesports.com/prediction-markets-arrive-on-supreme-courts-doorstep/).
- **Supreme Court:** New Jersey petitioned in Flaherty v. KalshiEX, No. 26-299 (around Sept 2026). Ohio plus 38 states and DC filed an amicus urging review on Oct 7, 2026. Robinhood and Crypto.com also petitioned. No grant or denial was found as of Nov 24, 2026 — snippet-level, [Bloomberg Law](https://news.bloomberglaw.com/litigation/new-jersey-seeks-high-court-review-of-kalshis-sports-markets); [gambling.com](https://www.gambling.com/us/news/39-states-urge-supreme-court-to-review-kalshi-dispute).

### Inferences
- **What Moneta would be in this stack.** If another team builds the market, Moneta's "money layer" role means holding user funds that flow to and from a DCM/FCM. That could make Moneta part of the regulated customer-funds chain. Two possible structures:
  - Moneta acts only as a wallet the user funds from, with the venue's FCM or DCO holding margin. This is likely outside CFTC registration, subject to counsel.
  - Moneta itself holds customer funds for trading. That points to FCM-type registration or partnership.
- **Stablecoin collateral.** The CFTC's 2026 FAQs on tokenized collateral under Reg. 1.25 are relevant if stablecoins are used as margin or collateral at the DCO.
- **Sports contracts carry separate state-law risk** pending the Supreme Court. Non-sports, financial or economic event contracts face less state-law risk.
- **RPM (Australian motorsport P2P market).** Offering it to US users would require one of the CFTC routes above or a geofence. P2P "bets" outside a DCM risk being illegal off-exchange swaps or state gambling.

### Gaps
- I did not verify Kalshi, Polymarket or Crypto.com orders against primary CFTC documents. Kalshi Klear's DCO date and the QCX designation date are snippet-level.
- The CFTC's formal position or amicus in the circuit cases was not found.
- Whether the June 2026 Rule 40.11 proposal has been finalized was not found.
- CFTC treatment of offshore or P2P markets (relevant to RPM) was not researched.

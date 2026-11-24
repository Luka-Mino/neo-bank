# Swiss and EU licensing for a fiat + stablecoin accounts/payments platform (status as of 2026-11-24)

Research notes, not legal advice. Every point marked "counsel must decide" needs a Swiss or EU regulatory lawyer. Sources are cited inline. Where a source is a vendor or consultancy page rather than a regulator or law firm, that is said. Items drawn from statutory background that I did not re-fetch this session are labelled as such.

## 1. Switzerland today: SRO membership under AMLA, the FinTech licence, the banking licence and FINMA Guidance 06/2024

### Takeaway
Today a Swiss entity has three tiers. (1) SRO membership covers AML-only financial intermediation such as crypto brokerage, transfers and custody without deposit-taking. (2) The FINMA FinTech licence (Art. 1b Banking Act) covers non-interest-bearing client funds up to CHF 100m, with capital of 3% of deposits and at least CHF 300k. (3) A full bank licence needs CHF 10m paid-in capital. Issuing a stablecoin today generally requires a banking licence unless a bank default guarantee meets FINMA Guidance 06/2024.

### Cited Findings
**SRO membership (AML-only tier)**
- Under the Swiss AML ordinance, a financial intermediary must join an SRO or apply to FINMA within 2 months of starting the activity. Otherwise the activity is illegal. This comes from a third-party summary surfaced in search, so verify it against AMLO — [VQF FAQ / third-party guides via search](https://vqf.ch/en/faq); [lawsupport-ch guide (third-party, low authority)](https://lawsupport-ch.pages.dev/licensing/vasp-registration-switzerland/)
- VQF accepts advisors, traditional financial intermediaries and virtual asset service providers (VASPs). A third-party source notes that most token exchanges, crypto brokers and custodians fall into this category — [VQF SRO](https://vqf.ch/en/142-inhalte-english/sro/sro); [Goldblum (law firm) VQF note](https://goldblum.ch/knowledgebase/vqf-sro-switzerland)
- **VQF admission steps:** submit an application for admission with all required documents, then an admission interview, then a written decision. The forms cover company information and the scope of any previous financial-intermediary activity, plus an extra form where third parties perform due diligence. Applications can be filed digitally once VQF holds a signed declaration of consent — [VQF SRO admission](https://vqf.ch/en/141-inhalte-english/sro/sro-beitritt); [VQF FAQ](https://vqf.ch/en/faq); [VQF Doc 201 application form](https://www.vqf.ch/en/dokumente/beitritt-eng/357-vqf-doc-no-201-5/file)
- **Timeline:** typically 3–6 months from a complete application to acceptance. This comes from a third-party guide; VQF publishes no timeline — [lawsupport-ch guide](https://lawsupport-ch.pages.dev/licensing/vasp-registration-switzerland/)
- **Fees:** VQF fees depend on fee category and activity. One third-party guide says AML compliance costs start at CHF 3,000; I could not verify this — [Goldblum](https://www.goldblum.ch/financial-regulation/sro-membership/)
- **Limits of the SRO tier under the Banking Ordinance:**
  - Funds held on settlement accounts are not treated as public deposits if they pay no interest and are forwarded within 60 days. This window was extended from 7 days on 1 Aug 2017.
  - The "sandbox" allows public deposits of up to CHF 1m without a licence, provided depositors are told beforehand that the firm is not supervised as a bank.
  - Above CHF 1m, the firm must notify FINMA within 10 days and apply for a licence within 30 days.
  - Outside the settlement-account exemption: crypto wallet providers that can dispose of client assets without client involvement, and brokers holding client assets for more than 60 days.
  - Sources: [Bär & Karrer "Fintech rules eased"](https://media.baerkarrer.ch/karmarun/image/upload/baer-karrer/Fintech_rules_eased.pdf); [Mondaq/Bär & Karrer](https://www.mondaq.com/technology/627334/fintech-rules-eased); [Chambers Banking Regulation 2026 – Switzerland](https://chambers.com/practice-guides/guides/banking-regulation-2026/switzerland/law-and-practice)

**FinTech licence (Art. 1b Banking Act)**
- **Legal form:** company limited by shares (AG), corporation with unlimited partners, or GmbH. It must have its registered office and conduct its business in Switzerland — [FINMA FinTech licence](https://www.finma.ch/en/authorisation/fintech/fintech-bewilligung/)
- **Deposit cap:** up to CHF 100m of public deposits, or crypto-based assets, provided they are not invested and earn no interest — [FINMA](https://www.finma.ch/en/authorisation/fintech/fintech-bewilligung/)
- **No client protection in insolvency:** client assets are neither privileged nor covered by deposit protection in bankruptcy, and clients must be told so (Art. 1b(4)(d) BA; Art. 7a(3) BankO) — [FINMA](https://www.finma.ch/en/authorisation/fintech/fintech-bewilligung/)
- **Capital:** fully paid-in capital of 3% of public deposits and at least CHF 300,000. For example, CHF 100m of deposits needs CHF 3m. This has applied since 1 Jan 2019; a 5% figure from the draft stage was not adopted. Commonly cited as Art. 17a Banking Ordinance; verify on Fedlex — [CMS](https://cms.law/en/che/legal-updates/FinTech-Licenses-now-part-of-Switzerland-s-financial-law-framework); [Vischer](https://www.vischer.com/en/knowledge/blog/federal-council-publishes-implementing-provisions-for-the-new-fintech-licence-38678); [PwC "The Swiss fintech license" (2023)](https://www.pwc.ch/en/publications/2023/The_swiss_fintech_license.pdf)
- **Application:** filed through FINMA's EHP platform after self-registration, with two-factor access.
  - Forms: the expanded application template (a guide only, not submittable), the "Gewähr" fit-and-proper form, and declarations A1–A4 and B1–B3 for qualified holders.
  - FINMA "Guidelines for FinTech licence" (24.04.2025). FINMA can ask for a licensing audit report from a recognised audit firm.
  - Fees are set by the FINMA Fees and Levies Ordinance; no amounts are given.
  - Sources: [FINMA](https://www.finma.ch/en/authorisation/fintech/fintech-bewilligung/)
- **Content of the FINMA guidelines:**
  - a detailed justification for applying, and a description of the planned activity and organisation
  - articles of association and organisational regulations tailored to the Art. 1b business
  - an organisational chart showing executive staff and FTEs per unit
  - Source: [FINMA FinTech guidelines PDF](https://www.finma.ch/en/~/media/finma/dokumente/bewilligungstraeger/pdf/fintech.pdf?la=en)
- **Timeline:** FINMA gives none. "The duration of the licensing procedure depends on the complexity of the project and the quality and completeness of the application."
  - FINMA "recommends always seeking a preliminary assessment" before filing; the timetable and topic blocks are then agreed with FINMA.
  - A Fast Track exists only for low-risk projects that have had a preliminary assessment and are filed via EHP.
  - Sources: [FINMA](https://www.finma.ch/en/authorisation/fintech/fintech-bewilligung/); [FINMA Fast Track](https://www.finma.ch/en/authorisation/fintech/fintech-bewilligung/fintech-fast-track/)
- **Take-up is very low:** FINMA revoked one FinTech authorisation, leaving four institutions operating under the regime as of Oct 2025 — [Loyens & Loeff](https://www.loyensloeff.com/insights/news--events/news/swiss-federal-council-proposes-finia-amendments-new-licences-for-payment-and-crypto-institutions-to-replace-fintech-regime/)

**Full banking licence**
- Fully paid-up minimum capital of at least CHF 10 million.
  - Organisation: separation of strategic and executive management; effective separation of internal functions; risk management; an internal audit function independent of executive management.
  - **Swiss presence:** "management of the bank from Switzerland".
  - Fit and proper: "guarantee of irreproachable business activity" by qualified participants and top management.
  - Audit firms: a recognised audit firm for the licensing process and a recognised regulatory audit firm for ongoing supervision.
  - The application includes a business plan showing compliance with capital, risk-diversification and liquidity rules. The project must be presented to FINMA before filing (authorization@finma.ch).
  - Duration "depends on the quality and complexity of the application".
  - Source: [FINMA – Authorisation requirements for banks](https://www.finma.ch/en/authorisation/banks-and-securities-firms/getting-licensed/banks/)

**FINMA Guidance 06/2024 (stablecoins), 26 July 2024**
- The guidance sets minimum requirements for bank default guarantees, which some stablecoin issuers use to avoid needing a banking licence (Art. 5(3)(f) Banking Ordinance). FINMA says such guarantees create risks for holders and for the guaranteeing banks — [FINMA news](https://www.finma.ch/en/news/2024/07/20240726-m-am-06-24-stablecoins/)
- **Minimum requirements for the guarantee:**
  - In the issuer's bankruptcy, each customer must have its own claim against the guaranteeing Swiss bank, and customers must be told about the guarantee.
  - The guarantee must cover the deposits plus interest, and covered claims must not exceed its upper limit.
  - Its terms must allow customers to call it quickly and simply.
  - Sources: [CMS](https://cms.law/en/che/legal-updates/swiss-finma-communicates-its-stablecoin-practice); [Homburger](https://homburger.ch/en/insights/finma-publishes-guidance-on-stablecoins); [Walder Wyss newsletter 205](https://walderwyss.com/assets/content/publications/240731_Newsletter-205_FINMA-guidance-on-stablecoins.pdf); [Schellenberg Wittmer](https://www.swlegal.com/en/insights/newsletter-detail/finma-guidance-062024-on-stablecoins/)

### Inferences
- A US-only USDC product could not be "Swiss-anchored" through SRO membership alone. SRO membership allows AML-supervised custody, transfer and brokerage, but not holding client fiat for more than 60 days, or more than CHF 1m outside the settlement exemption. Any account model where clients park CHF/USD/EUR balances needs at least the FinTech licence, or later the payment instrument institution licence.
- The FinTech licence's CHF 100m cap and its lack of client segregation in bankruptcy explain why only four firms hold it. For an institutional treasury product, the cap is likely to bind quickly: around 30 mid-size corporate clients at CHF 3–4m each would reach it.
- **Statutory background, not re-fetched this session.** AMLA Art. 2(3) treats anyone who professionally accepts, holds or helps transfer third-party assets as a financial intermediary. FINMA applies the travel rule to crypto transfers (FINMA Guidance 02/2019). FinTech licensees and banks are subject to AMLA directly under FINMA, not through an SRO. Counsel should confirm.

### Gaps
- **SRO fees:** no official PolyReg, SO-FIT or VQF fee schedules or timelines were retrieved. The 3–6 month and CHF 3k+ figures come from low-authority third-party pages.
- **FINMA licensing fees:** no amounts found for FinTech or bank applications.
- **Practical FinTech licence timeline:** FINMA publishes none. Industry anecdote, not found in a reliable source this session, suggests 6–12+ months after pre-consultation.
- **Residence rule for FinTech executives:** I did not find an explicit written requirement that FinTech-licence executives be Swiss-resident. FINMA says only "registered office and business activities in Switzerland" for FinTech, and "management … from Switzerland" for banks. Counsel must confirm FINMA's current practice on the residence of executive management.
- **AML for issuers:** law-firm summaries of Guidance 06/2024 also discuss issuer AML duties, including identifying holders. I did not retrieve that part of the primary text.

## 2. The FinIA revision ("payment instrument institution" / Zahlungsmittelinstitut and "crypto institution"): status, capital, stablecoin rules and FINMA dossier

### Takeaway
As of mid-November 2026 the revision is still a consultation draft. No Federal Council dispatch (Botschaft) to Parliament was found, so it is nowhere near law. Entry into force around 2027 looks optimistic; 2028 or later is more realistic. The draft does remove the CHF 100m cap and adds bankruptcy segregation. Minimum capital is left entirely to a future Federal Council ordinance.

Contrary to the team's notes, the payment instrument institution licence covers issuing and holding Swiss-issued stablecoins. USDC, as a foreign-issued stablecoin, is a "trading crypto-asset" whose custody falls under the separate crypto-institution licence.

### Cited Findings
**Status and timeline**
- The Federal Council opened the consultation on 22 Oct 2025, and it closed on 6 Feb 2026.
  - The SIF fact sheet says the Federal Council would send a dispatch to Parliament "frühestens im zweiten Halbjahr 2026" (in the second half of 2026 at the earliest).
  - The consultation documents (draft, explanatory report, comparison table) are in German only.
  - Sources: [Federal Council press release, 22 Oct 2025](https://www.admin.ch/en/newnsb/x4TMWQ1SWofNoFx7XyHhY); [SIF Faktenblatt Stablecoins (DE)](https://www.sif.admin.ch/dam/de/sd-web/dUviLBIEgTjT/Faktenblatt%20Stablecoins.pdf); [SIF fact sheet (EN)](https://www.sif.admin.ch/dam/it/sd-web/dUviLBIEgTjT/Faktenblatt%20Stablecoins%20EN.pdf)
- **No dispatch found as of Nov 2026.** A regulatory tracker updated 17 Nov 2026 lists the FinIA draft as "Proposed" and "Not enacted". It records no dispatch date, no consultation report, no parliamentary progress and no entry-into-force date. My own searches of admin.ch, sif.admin.ch, efd.admin.ch, parlament.ch and finma.ch found no consultation report or dispatch either — [achivx Switzerland tracker (secondary)](https://achivx.org/regulation/switzerland/); [SIF DLT/Blockchain page](https://www.sif.admin.ch/de/dlt-blockchain)
- **Consultation responses:**
  - The Swiss Bankers Association (SBVg) backs the bill in principle but wants banks to be able to issue stablecoins directly, not only through a separate payment instrument institution.
  - Circle lobbied for foreign stablecoins to receive equivalence treatment.
  - SIX, Swiss Fintech Innovations, SGB, SP and Raiffeisen also responded.
  - Sources: [SBVg Stellungnahme 11 Feb 2026](https://www.swissbanking.ch/_Resources/Persistent/9/2/7/5/9275b673eccd1aeed7f0d69d16d82a7b4dfc2e1d/20260211_Stellungnahme%20SBVg_%C3%84nderung%20FINIG.pdf); [cvj.ch](https://cvj.ch/fokus/legal-compliance/bankiervereinigung-fordert-direktes-stablecoin-emissionsrecht-fuer-schweizer-banken/); [finews.ch](https://www.finews.ch/news/finanzplatz/71155-sbvg-stablecoin-vorlage-bundesrat-vernehmlassung-stellungnahme-finanzinstitutsgesetz-finig-kryptowaehrungen-systemstabilitaet-regulierungsfolgenabschaetzung); [Blockchain.News on Circle's response](https://blockchain.news/news/circle-switzerland-stablecoin-consultation-response-february-2026); [SIX response](https://www.six-group.com/dam/download/company/policy-and-regulatory-framework/six-stellungnahme-finig-stablecoins-und-kryptos.pdf)

**Scope of the payment instrument institution (Zahlungsmittelinstitut)**
- **Core activity** is the same as for FinTech institutions: accepting client funds without paying interest and without lending ("ohne damit ein Aktivgeschäft (z.B. Kreditvergabe) zu betreiben").
  - Licence conditions "orientieren sich an den bisherigen Anforderungen für «Fintech-Institute»" (follow the existing FinTech-institution requirements), with targeted changes.
  - Client funds become segregable in bankruptcy ("im Konkurs des Instituts absonderbar").
  - The CHF 100m cap is abolished ("wird aufgehoben").
  - Source: [SIF Faktenblatt](https://www.sif.admin.ch/dam/de/sd-web/dUviLBIEgTjT/Faktenblatt%20Stablecoins.pdf)
- **Stablecoin issuance:** only payment instrument institutions may issue "wertstabile kryptobasierte Zahlungsmittel" (value-stable crypto-based payment instruments).
  - These are crypto-based assets issued in Switzerland that aim for a stable value against a single state currency, with a redemption claim ("Rückzahlungsanspruch").
  - Issuers must publish a whitepaper.
  - Secondary trading is otherwise unregulated apart from custody and AML rules.
  - Source: [SIF Faktenblatt](https://www.sif.admin.ch/dam/de/sd-web/dUviLBIEgTjT/Faktenblatt%20Stablecoins.pdf)
- **Banks need a separate entity to issue stablecoins.** Banks wanting to issue such stablecoins would need a separate legal entity holding this licence; this is the SBVg's main objection — [cvj.ch](https://cvj.ch/fokus/legal-compliance/bankiervereinigung-fordert-direktes-stablecoin-emissionsrecht-fuer-schweizer-banken/); [Borel & Barbey](https://www.borel-barbey.ch/en/the-swiss-federal-council-launches-a-consultation-aiming-at-advancing-swiss-crypto-and-stablecoin-regulation/)
- **Reserves:** client funds must be held as deposits with a Swiss bank or another payment instrument institution, or as high-quality liquid assets with short maturities. Payment instrument institutions may issue and hold Swiss stablecoins and offer payment services — [Schellenberg Wittmer, 24 Oct 2025](https://www.swlegal.com/en/insights/newsletter-detail/consultation-for-revised-swiss-rules-on-stablecoin/)
- **Redemption:** under the draft, the institution redeems only tokens it issued itself, and must do so within a short period; the Federal Council sets the details. This comes from a search summary of the draft text — [draft FINIG text (law.ch copy)](https://law.ch/wp-content/uploads/2025/10/finig-gesetz-de.pdf)
- **AML duties for Swiss stablecoin issuers:**
  - Assess the risks of secondary-market use before issuing, for example through exclusion lists of wallets, or by ensuring holders are identified by equivalently supervised intermediaries.
  - Be able to block transactions and freeze or claw back individual tokens on the secondary market.
  - Source: [Schellenberg Wittmer](https://www.swlegal.com/en/insights/newsletter-detail/consultation-for-revised-swiss-rules-on-stablecoin/)

**Capital and own funds: not in the statute**
- Draft Art. 51e: "Das Zahlungsmittelinstitut muss über das verlangte Mindestkapital verfügen. Dieses muss vollständig einbezahlt sein. Der Bundesrat regelt die Höhe des Mindestkapitals." (The minimum capital must be fully paid in; the Federal Council sets the amount.)
- Draft Art. 51f: adequate own funds on an individual and consolidated basis, also set by the Federal Council.
- The SP's consultation response criticises leaving minimum capital, own funds, liquidity and risk diversification to ordinance level.
- Sources: [FDF explanatory report / comparison (bfadmin.cdbf.ch 7943)](https://bfadmin.cdbf.ch/Serveur/documents/7943); [draft comparison (bfadmin.cdbf.ch 7946)](https://bfadmin.cdbf.ch/Serveur/documents/7946); [SP Vernehmlassungsantwort](https://www.sp-ps.ch/wp-content/uploads/2026/02/SPS_Vernehmlassungsantwort_Finanzinstitutsgesetz.pdf)

**Crypto institution (Krypto-Institut)**
- Requirements are modelled on, but lighter than, those for securities firms.
- **Covered assets** are "crypto-based assets with trading character": anything that is not a utility token, financial instrument, Swiss value-stable payment instrument or bank deposit. The SIF fact sheet says this explicitly includes "im Ausland ausgegebene Stablecoins" (stablecoins issued abroad).
- **Activities:** custody (including staking), brokerage, short-term proprietary trading and market making. It may also run an organised trading facility limited to such assets.
- Sources: [SIF Faktenblatt](https://www.sif.admin.ch/dam/de/sd-web/dUviLBIEgTjT/Faktenblatt%20Stablecoins.pdf); [Loyens & Loeff](https://www.loyensloeff.com/insights/news--events/news/swiss-federal-council-proposes-finia-amendments-new-licences-for-payment-and-crypto-institutions-to-replace-fintech-regime/); [Schellenberg Wittmer](https://www.swlegal.com/en/insights/newsletter-detail/consultation-for-revised-swiss-rules-on-stablecoin/)
- **Supervision:** both new categories would be directly supervised by FINMA as financial intermediaries, which moves crypto firms from SRO supervision to FINMA — [RPCS blog](https://www.rpcs.ch/blog/finma-supervision-payment-crypto-institutions); [Borel & Barbey newsflash PDF](https://www.borel-barbey.ch/wp-content/uploads/2025/10/BB-NL_News-Flash_27.10.2025.pdf)

### Inferences
- **Status:** the dispatch is still pending, so the bill has not reached either chamber.
  - Swiss procedure (statutory background, not verified this session) runs: dispatch, first and second chamber, reconciling differences, a final vote, a 100-day optional-referendum period, then an implementing ordinance with its own consultation, and finally FINMA practice.
  - Even a 2027 dispatch makes entry into force before 2028 unlikely.
  - Search snippets also showed secondary estimates of "earliest 2027" and "not before 2028" that I could not attribute to a specific source. The team's "~2027" assumption should be treated as a best case.
- **Licence coverage for Moneta's model:**
  - The payment instrument institution would cover fiat client balances and issuing and holding a Swiss stablecoin.
  - It does not clearly cover custody of USDC (a foreign stablecoin), which the draft places with crypto institutions.
  - A Moneta-type platform holding USDC for clients would therefore appear to need both licences, or a bank licence. Counsel must decide whether one entity can hold both, and whether the final bill changes this.
- **"Removes the deposit cap":** yes, per the official fact sheet. The capital floor is the trade-off. The current FinTech formula (3%, minimum CHF 300k) is the most likely starting point, since the regime "orientiert sich" (follows) the FinTech requirements, but this is unconfirmed.
- **Likely FINMA dossier**, inferred from FinTech and bank practice since the new regime follows the FinTech requirements:
  - EHP application with business plan and programme of operations
  - articles and organisational regulations
  - organisational chart with FTEs
  - Gewähr (fit-and-proper) forms for board and management, and declarations for qualified holders
  - proof of capital
  - recognised audit firm (licensing and regulatory audit)
  - AML framework, including holder identification and freeze/claw-back capability for stablecoins
  - stablecoin whitepaper, and reserve and redemption policy
  - registered office and business activity in Switzerland, with management run from Switzerland
  - Counsel must confirm once FINMA issues guidance after enactment.

### Gaps
- **Consultation report:** whether it has been published (expected before the dispatch) is not confirmed. If it was published between Feb and Nov 2026, I did not find it.
- **Minimum capital and own funds:** no figure in any source. Left to the Federal Council.
- **Transitional periods:** no source covered them for existing FinTech licensees, SRO-affiliated crypto firms, or default-guarantee stablecoin issuers.
- **Reserve and redemption details:** composition limits, concentration rules, redemption at par within X days and fees all remain at ordinance level.
- **Foreign stablecoin equivalence:** whether foreign stablecoins (USDC) will get an equivalence route, as Circle asked, is unresolved.

## 3. EU MiCA: CASP authorisation for custody, transfer and exchange; capital; end of transition; which member states; passporting

### Takeaway
Custody, transfer and exchange of crypto for funds require a MiCA CASP authorisation, unless an already-licensed entity notifies under Art. 60.
- **Capital:** the class 2 minimum is €125k, or the higher of that and a quarter of the previous year's fixed overheads.
- **Presence:** registered office and effective management in the EU, and at least one EU-resident director.
- **Statutory clock:** a 25-working-day completeness check, then 40 working days for the decision.
- **Transition over:** all grandfathering ended by 1 July 2026.

Germany issues by far the most authorisations, followed by France, the Netherlands, Cyprus and Malta.

### Cited Findings
- **Capital classes (Annex IV):**
  - Class 1, €50,000: order execution, placing, transfer services, reception and transmission of orders, advice, portfolio management.
  - Class 2, €125,000: Class 1 plus custody and administration, exchange of crypto for funds, and exchange of crypto for crypto.
  - Class 3, €150,000: Class 2 plus operating a trading platform.
  - Sources: [ESMA Interactive Single Rulebook – MiCA minimum capital](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/minimum-capital-requirements-crypto-asset); [ESMA Q&A 2343](https://www.esma.europa.eu/publications-data/questions-answers/2343)
- **Ongoing prudential requirement (Art. 67):** the higher of the fixed minimum or one quarter of the previous year's fixed overheads; new firms use projected overheads. This comes from secondary commentary — verify the Art. 67 text — [MiCA licence guide (secondary)](https://www.upshift.finance/blog/mica-license)
- **Who may provide services (Art. 59):** an authorised legal person with its registered office in a Member State where it provides at least part of its services, its place of effective management in the EU, and at least one EU-resident director.
  - Art. 59(7): services may be provided throughout the EU, through establishment or freedom to provide services, with no physical presence required in host states.
  - Art. 59(1)(b) and Art. 60: credit institutions, CSDs, investment firms, market operators, e-money institutions (EMIs), UCITS management companies and AIFMs can provide crypto services by notification instead of authorisation.
  - Source: [MiCA Art. 59 (Springlex text)](https://www.springlex.eu/en/packages/mica/mica-regulation/article-59/)
- **Application contents (Art. 62(2)(a)–(s)):**
  - identity, LEI and legal form
  - articles of association
  - programme of operations (how and where services will be marketed)
  - proof of Art. 67 prudential safeguards
  - governance arrangements
  - fit-and-proper proof for the management body
  - qualifying holders and their good repute
  - internal controls, risk management including ML/TF risk, and a business continuity plan
  - ICT technical documentation and security arrangements, with a non-technical description
  - procedure for segregating client crypto-assets and funds
  - complaints handling
  - custody and administration policy, if providing custody
  - trading-platform rules and market-abuse detection, if operating a platform
  - a non-discriminatory commercial policy and pricing methodology, if exchanging crypto
  - execution policy, if executing orders
  - proof of staff knowledge and expertise, if giving advice or managing portfolios
  - how transfer services will be provided, if offering transfers
  - the type of crypto-asset each service relates to
  - Source: [ESMA ISR – MiCA Art. 62](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-62-application-authorisation-crypto)
- **Programme of operations detail (RTS (EU) 2025/305):** three years of operations, covering intended services, target markets and clients, resource allocation, outsourcing, and financial forecasts including stress scenarios — [Commission Delegated Reg. (EU) 2025/305](https://eur-lex.europa.eu/eli/reg/2025/305/oj); [Springlex RTS Art. 2](https://www.springlex.eu/en/packages/mica/rts-ca-regulation/article-2/)
  - Application form example: [Central Bank of Ireland CASP application form](https://centralbank.ie/docs/default-source/regulation/micar/application-form-for-authorisation-as-a-crypto-asset-service-provider.pdf)
- **Statutory clock (Art. 63):**
  - acknowledgement within 5 working days
  - completeness check within 25 working days
  - decision within 40 working days of a complete application
  - information requests by working day 20; the clock suspends for at most 20 working days
  - ESMA notified within 2 working days of a grant
  - Source: [MiCA Art. 63 (Springlex)](https://www.springlex.eu/en/packages/mica/mica-regulation/article-63/)
- **End of transition:** no MiCA transitional period runs beyond 1 July 2026. ESMA's April 2026 position was that from that date, anyone serving EU clients without MiCA authorisation is in breach of EU law and must stop.
  - Several states cut the period short: Germany and Ireland ended theirs on 31 Dec 2025, while Malta and France ended on 1 July 2026.
  - Sources: [Elliptic](https://www.elliptic.co/insights/what-the-end-of-micas-transitional-period-means-for-crypto-businesses/); [Zyphe](https://www.zyphe.com/resources/news/mica-transitional-period-ends-july-2026); [CASP Tracker (secondary)](https://casptracker.eu/crypto-license-in-europe-by-country/)
- **Register counts (secondary; check the ESMA interim register directly):**
  - As of 14 Oct 2026: 367 firms licensed by 29 national authorities in 27 states. Germany leads with 100 (27.2%), then France 36, the Netherlands 29, Cyprus 25 and Malta 23 — [CASP Tracker](https://casptracker.eu/crypto-license-in-europe-by-country/)
  - Another count for 24 Sep 2026: 362 entries for 357 legal entities. Earlier counts were about 280 on 3 Jul 2026 and about 230 in late June 2026. Counts differ on whether Art. 60 notifications (such as banks) are included — [Zitadelle / Tazapay / others via search](https://www.zitadelleag.com/services/vasp-licensing/mica-casp); [Finance Magnates – Germany 22%](https://www.financemagnates.com/cryptocurrency/regulation/germany-leads-mica-register-with-22-of-casp-entities/); [crypto.news – German banks](https://crypto.news/germany-extends-mica-lead-as-six-more-banks-secure-crypto-licenses/)
  - Lithuania had only 4 MiCA CASP licences as of the April 2026 Coincub report — [Coincub Europe Crypto Report 2026](https://coincub.com/wp-content/uploads/2026/04/Europe-Crypto-Report-2026-1.pdf)
- **National authorities and guidance pages:** [CSSF Luxembourg CASP overview](https://cssf.lu/en/crypto-assets-service-providers-casp); [CONSOB CASP template](https://www.consob.it/documents/d/asset-library-1912910/application_for_authorisation_as_a_casp_template)

### Inferences
- **Germany:** its lead reflects many banks and investment firms using Art. 60 notification, not speed for newcomers.
- **Choice of state for a new entrant:** the most-used routes appear to be France (AMF), the Netherlands (AFM), Cyprus, Malta and Ireland. Luxembourg is credible for institutional business. Lithuania, historically the VASP hub, has issued few MiCA licences, which suggests a tougher Bank of Lithuania under MiCA.
- **Approval times:** the statutory clock is about 3–4 months from a complete file. Practitioners and vendors quote 4–9 months end to end ([Zitadelle, vendor](https://www.zitadelleag.com/services/vasp-licensing/mica-casp)); treat this as indicative only.
- **Class needed:** a treasury and payments platform doing custody, transfer and fiat on/off-ramp needs class 2 (€125k minimum, realistically more once Art. 67 overheads and runway are counted).

### Gaps
- **Fastest regulator:** no reliable, regulator-sourced data on median processing times by member state was found. "Fastest" claims online come from vendors.
- **Luxembourg and Ireland counts:** current CASP numbers were not found.
- **ESMA's 2026 peer reviews:** the follow-up to its Malta peer review, and any other 2026 supervisory-convergence actions on "licence shopping", were not covered this session.

## 4. EU e-money and payments: USDC as an e-money token, why an EMI or bank licence is needed, EMI application, PSD3/PSR, partner routes

### Takeaway
USDC is an e-money token (EMT), which MiCA treats as electronic money. Circle issues it in the EU through its French EMI.

Since 2 March 2026, an EU platform that custodies or transfers EMTs for clients generally needs both a MiCA CASP authorisation and a PSD2 payment or e-money licence, or must act as an agent of a licensed payment service provider (PSP). IBAN accounts holding client fiat need an EMI or a bank. EMI minimum capital is €350k; practical timelines run 6–18+ months, longest in Ireland.

PSD3/PSR is politically agreed but not yet law; Parliament's plenary vote is indicatively set for 14 Dec 2026.

### Cited Findings
- **Circle's EU set-up:** Circle Internet Financial Europe SAS received an EMI licence from France's ACPR on 1 July 2024. Circle states that USDC and EURC are now issued in the EU in line with MiCA's EMT rules. Circle Mint France lets EU business customers mint and redeem — [Circle press release via Business Wire](https://www.businesswire.com/news/home/20240701820713/en); [De Gaulle Fleurance](https://www.degaullefleurance.com/en/actualites/conseille-par-de-gaulle-fleurance-circle-obtient-un-agrement-detablissement-de-monnaie-electronique-eme-aupres-de-lacpr/); [NBC/CNBC](https://nbcnewyork.com/news/business/money-report/crypto-firm-circle-gets-approval-to-issue-stablecoin-in-eu-under-blocs-strict-rules/5557684)
- **EBA No-Action Letter (Opinion EBA/Op/2025/08, 10 June 2025):**
  - Under MiCA Art. 48(2), EMTs are electronic money, so CASPs providing EMT services may need both MiCA and PSD2 authorisation.
  - Executing EMT transfers may be a payment service, and so may EMT custody where it qualifies.
  - Exchanging crypto for funds or for other crypto is not a payment service.
  - National authorities were advised to allow a transition until 1 March 2026.
  - Options: obtain a payment institution (PI) or EMI licence, or act as an agent of an authorised PSP.
  - Sources: [EBA Opinion PDF](https://eba.europa.eu/sites/default/files/2025-07/bde8c438-bb3f-4343-a158-f42b7afc9650/EBA%20Op%202025%2008%20%28No-Action%20letter%20on%20PSD2-MICA%20interplay%29.pdf); [DLA Piper](https://www.dlapiper.com/en-us/insights/publications/2025/07/interplay-between-mica-and-psd2-for-transfers-of-electronic-money-tokens-eba-no-action-letter); [Morgan Lewis (June 2025)](https://www.morganlewis.com/pubs/2025/06/e-money-tokens-european-banking-authority-clarifies-psd2-mica-interplay-implications-for-casps); [Hogan Lovells](https://www.hoganlovells.com/en/publications/mica-and-psd2-eba-published-no-action-letter-on-dual-authorisation)
- **After 2 March 2026:** a February 2026 EBA opinion set supervisory priorities from 2 March 2026, ending the tolerance phase.
  - One firm reports that France's AMF requires CASPs with a pending PSP application to stop EMT payment-type services and offboard affected clients (single-source claim).
  - More than 100 CASPs have approached authorities about PSP authorisation.
  - Sources: [Morgan Lewis (Feb 2026)](https://www.morganlewis.com/pubs/2026/02/eba-issues-supervisory-priorities-as-psd2-mica-transition-period-for-emt-activities-ends); [Regulation Tomorrow (Feb 2026)](https://www.regulationtomorrow.com/2026/02/psd2-and-mica-how-to-proceed-once-the-transition-period-in-the-ebas-no-action-letter-comes-to-an-end/)
- **EMI initial capital:** €350,000 under Art. 4 of the E-Money Directive (2009/110/EC), usually evidenced before submission. Lithuania also offers a restricted EMI with discretionary capital. Client funds must be safeguarded in segregated accounts or by insurance or guarantee — [Crassula EMI guide (vendor)](https://crassula.io/guides/licenses/electronic-money-institution/); [Crassula Lithuania EMI (vendor)](https://crassula.io/guides/licenses/lithuania-emi/)
- **EMI application contents (EBA/GL/2017/09, applied to EMIs mutatis mutandis):**
  - programme of operations (Guideline 3)
  - business plan (Guideline 4)
  - evidence of initial capital
  - safeguarding measures
  - governance and internal control, and AML/CFT
  - The EBA's 2023 and Dec 2025 peer reviews flagged business plans and AML/CFT controls as weak points in applications.
  - Sources: [EBA GL/2017/09](https://www.eba.europa.eu/sites/default/files/documents/10180/1904583/f0e94433-f59b-4c24-9cec-2d6a2277b62c/Final%20Guidelines%20on%20Authorisations%20of%20Payment%20Institutions%20%28EBA-GL-2017-09%29.pdf); [Central Bank of Ireland PSD2 guidance note](https://centralbank.ie/docs/default-source/regulation/industry-market-sectors/electronic-money-institutions/authorisation-process/psd2-guidance-note.pdf?sfvrsn=14); [EBA follow-up peer review Dec 2025](https://www.eba.europa.eu/sites/default/files/2025-12/31b327d1-09ef-4ede-a5ec-40ea833fca4d/Follow-up%20peer%20review%20report%20on%20authorisations%20under%20PSD2.pdf)
- **DORA:** from 17 Jan 2025, ICT outsourcing by EMIs is subject to DORA. The Dutch EMI application form (DNB) also asks for a recovery and exit plan and a risk management framework — [DNB EMI licence form notes](https://www.dnb.nl/media/0g5fwn1s/toelichting-formulier-vergunningaanvraag-egi-eng.pdf)
- **EMI timelines (vendor and consultancy estimates):**
  - Lithuania: usually 6–12 months end to end.
  - Netherlands, France, Cyprus: 9–18 months.
  - Ireland and Spain: 12–24 months. Another source puts Ireland and the Netherlands at 12–18 months.
  - Sources: [Crassula (vendor)](https://crassula.io/guides/licenses/lithuania-emi/); [Global Law Experts](https://globallawexperts.com/emi-licence-eu/); [Zitadelle (vendor)](https://www.zitadelleag.com/services/payment-licensing/eu-emi)
- **PSD3/PSR status:**
  - Provisional agreement 27 Nov 2025.
  - Council final compromise texts published 23 Apr 2026 (PSD3 ST 8221/26; PSR ST 8222/26).
  - ECON committee approval 5 May 2026; indicative EP plenary 14 Dec 2026.
  - As of 10 Oct 2026 the Council had not adopted its position and nothing was in the Official Journal.
  - PSR applies about 21 months after entry into force, with some items such as payee-name verification 6 months later; PSD3 transposition takes about 21 months. Estimates for application range from late 2027 to late 2028.
  - Sources: [EP Legislative Train](https://www.europarl.europa.eu/legislative-train/theme-an-economy-that-works-for-people/file-revision-of-eu-rules-on-payment-services); [Morrison Foerster, 30 Apr 2026](https://www.mofo.com/resources/insights/260430-psd3-and-the-payment-services-regulation-key-developments); [Avanto status Aug 2026 (secondary)](https://avanto.team/insights/psd3-psr-status); [Freshfields](https://www.freshfields.com/en/our-thinking/blogs/risk-and-compliance/psd3-psr-what-the-eus-new-payments-rules-mean-for-your-business-102mrom)
- **Partner route: agent or distributor of a licensed EMI:**
  - An EMI can distribute e-money and provide payment services through agents and distributors, including in other EEA states.
  - The home authority must send an Annex VI notification for each new agent or distributor in a host state (Delegated Reg. 2017/2055).
  - National authorities decide whether an agent or distributor amounts to an "establishment", following the EBA's 2019 opinion.
  - The FCA (pre-Brexit practice) cited up to 3 months from a complete notification.
  - Sources: [EBA Q&A 2022_6437](https://eba.europa.eu/single-rule-book-qa/qna/view/publicId/2022_6437); [EBA Opinion on agents/distributors](https://www.eba.europa.eu/publications-and-media/press-releases/eba-publishes-opinion-nature-passport-notifications-agents-and-distributors-e-money); [FCA authorised EMI page](https://www.fca.org.uk/authorised-electronic-money-institution-authorised-emi)

### Inferences
- **Full EU stack for "stablecoin custody/transfer plus IBAN accounts"** in one entity:
  - (a) an EMI licence: covers IBAN e-money accounts and the PSD2 side of EMT transfers, €350k;
  - (b) a MiCA CASP authorisation: custody and exchange, class 2, €125k.
  - Alternatively, a bank licence with an Art. 60 notification.
  - The two capital requirements are separate regulatory floors; counsel must decide how they interact on a combined balance sheet.
- **Art. 60 shortcut for EMIs (statutory background, not re-fetched).** My recollection of Art. 60(4) is that an EMI may notify only for custody and transfer of the e-money tokens it issues itself. An EMI that does not issue USDC would then still need a full CASP authorisation for USDC custody. Verify the Art. 60(4) text.
- **E-money accounts (statutory background, not re-verified):** EMD2 Art. 12 and MiCA Art. 50 bar interest on e-money and EMTs. A "yield" feature on EU accounts would need a different structure (for example MMF sweeps through an investment firm). Counsel must decide.
- **PSD3 timing:** it will fold EMIs into the payment institution framework. A new EMI authorised in 2027 will probably face re-authorisation or transition under PSD3 within roughly 2 years.
- **Fastest EU launch:** become a registered agent or distributor of an existing EMI with MiCA permissions (EMI-as-a-service), or a CASP partner's agent for EMT services as the EBA letter allows. Then apply for its own CASP and EMI licences in parallel. Liability, safeguarding and client ownership stay with the partner.

### Gaps
- **Regulator timelines:** no primary-source EMI timelines from the Bank of Lithuania, the Central Bank of Ireland or DNB were retrieved; all ranges come from vendors or consultancies.
- **February 2026 EBA opinion:** its full text was not retrieved; only law-firm summaries.
- **PSD3 transition rules:** the provisions for existing EMIs were not confirmed this session.
- **Combined providers:** no list of current EMI-as-a-service providers that also hold MiCA CASP permissions was compiled.

## 5. Cross-border: serving EU clients from Switzerland, and a UK note

### Takeaway
There is no Swiss–EU passport. Under MiCA a Swiss firm can serve EU clients only through strictly limited reverse solicitation, so a Swiss-anchored group needs an EU subsidiary with its own CASP and EMI authorisation, real management in the EU and an EU-resident director.

In the UK, the FCA crypto gateway opened on 30 Sep 2026 and closes on 28 Feb 2027 for firms wanting to be authorised at go-live on 25 Oct 2027.

### Cited Findings
- **ESMA reverse-solicitation guidelines (published 26 Feb 2025):** a third-country firm may serve an EU client without authorisation only at the client's "exclusive initiative".
  - Any solicitation by the firm, by anyone acting on its behalf, or by persons with close links (affiliates, influencers) breaks the exemption.
  - Authorities assess all facts and circumstances.
  - EU-based firms cannot rely on the exemption.
  - Sources: [CMS Luxembourg](https://cms.law/en/lux/legal-updates/reverse-solicitation-regime-exempting-third-country-firms-from-micar-authorisation-requirements); [ESMA compliance table](https://www.esma.europa.eu/sites/default/files/2025-07/ESMA35-24871704-2592_Compliance_table_on_MiCA_reverse_solicitation_Guidelines.pdf); [Latham MiCA tracker](https://www.lw.com/en/markets-in-crypto-assets-regulation-tracker/mica-reverse-solicitation-broker-models); [EY Switzerland](https://www.ey.com/en_ch/insights/law/esma-guideline-on-reverse-solicitation-under-mica); [FSMA Belgium 2026 circular](https://www.fsma.be/sites/default/files/media/files/2026-07/fsma_2026_16_en.pdf)
- **EU subsidiary requirements (MiCA Art. 59(2)):** registered office in a Member State, effective management in the EU and at least one EU-resident director — [MiCA Art. 59](https://www.springlex.eu/en/packages/mica/mica-regulation/article-59/)
- **UK FCA cryptoasset regime:**
  - The authorisation gateway opened on 30 Sep 2026; firms apply through FCA Connect for Part 4A permissions.
  - Firms wanting authorisation at go-live must apply by 28 Feb 2027.
  - The regime starts on 25 Oct 2027.
  - Pre-application support (PASS) has been available since July 2026.
  - The FCA expects to decide applications made within the window before go-live, but will not expedite assessments.
  - Sources: [FCA – how the gateway will operate](https://www.fca.org.uk/firms/new-regime-cryptoasset-regulation/how-gateway-will-operate); [FCA press release "FCA opens the gateway to regulated crypto"](https://fca.org.uk/news/press-releases/fca-opens-gateway-regulated-crypto); [Mayer Brown, 5 Nov 2026](https://www.mayerbrown.com/en/insights/publications/2026/11/uk-cryptoasset-regime-the-fca-authorisation-gateway-is-now-open); [Davis Polk](https://www.davispolk.com/insights/client-update/fca-s-cryptoasset-authorisation-gateway-now-open)

### Inferences
- **Group structure:** the realistic multi-jurisdiction set-up is a Swiss parent or Swiss operating entity (SRO now, then a FINMA payment instrument or crypto institution licence later) plus an EU subsidiary (CASP plus EMI, or agent first).
  - Group marketing must be ring-fenced so that the Swiss entity is not seen as soliciting EU clients.
  - Intra-group outsourcing from the EU subsidiary to Swiss tech or ops would be assessed under MiCA, DORA and EBA outsourcing rules, so EU "substance" cannot be a letterbox.
- **UK:** missing the 28 Feb 2027 window means no UK crypto permissions at go-live. This is only relevant if the UK is in scope.

### Gaps
- **Swiss–EU bilateral package:** whether it changes anything for financial services market access was not checked. My understanding, unverified this session, is that financial services are not covered.
- **Swiss outbound rules:** whether Swiss rules restrict a FINMA licensee from serving EU clients cross-border was not researched.

## 6. Faster partner routes (Switzerland and EU)

### Takeaway
In both jurisdictions the quickest compliant launch is to sit on a licensed partner's licence while your own authorisations proceed in parallel.
- **Switzerland:** SRO membership plus a Swiss bank or licensed partner holding client fiat and stablecoin reserves. For a Swiss stablecoin, a FINMA-compliant bank default guarantee instead of a banking licence.
- **EU:** registration as agent or distributor of an EMI or CASP that already holds both PSD2 and MiCA permissions.

### Cited Findings
- **Switzerland:**
  - The settlement-account exemption (60 days, no interest) and the CHF 1m sandbox let an SRO-only firm move client money without a FinTech licence, within strict limits — [Bär & Karrer](https://media.baerkarrer.ch/karmarun/image/upload/baer-karrer/Fintech_rules_eased.pdf)
  - A bank default guarantee that meets FINMA Guidance 06/2024 is the current route for issuing a stablecoin without a banking licence — [FINMA Guidance 06/2024 news](https://www.finma.ch/en/news/2024/07/20240726-m-am-06-24-stablecoins/)
- **EU:**
  - Agents and distributors of an EMI can operate cross-border through Annex VI passport notifications, one per new agent — [EBA Q&A 2022_6437](https://eba.europa.eu/single-rule-book-qa/qna/view/publicId/2022_6437)
  - The EBA expressly recognises that a CASP may act as agent of an authorised PSP for EMT payment services instead of holding its own PI or EMI licence — [EBA No-Action Letter summary, DLA Piper](https://www.dlapiper.com/en-us/insights/publications/2025/07/interplay-between-mica-and-psd2-for-transfers-of-electronic-money-tokens-eba-no-action-letter)
- **Pre-application meetings exist in all three regimes:** FINMA (pre-assessment recommended), MiCA national authorities, and the FCA's PASS — [FINMA](https://www.finma.ch/en/authorisation/fintech/fintech-bewilligung/); [FCA gateway page](https://www.fca.org.uk/firms/new-regime-cryptoasset-regulation/how-gateway-will-operate)

### Inferences
- **Suggested sequencing (counsel to confirm):**
  1. **Now:** incorporate a Swiss AG; join an SRO (VQF or PolyReg) for crypto transfer and custody; partner with a FINMA-licensed Swiss bank for fiat and custody.
  2. **In parallel:** an EU launch as agent or distributor of an existing EMI/CASP partner, while applying for an own CASP licence (class 2) and EMI licence in one member state (France, the Netherlands, Ireland or Luxembourg for institutional credibility; Lithuania is cheaper and faster but has seen few MiCA grants).
  3. **Later:** convert to the Swiss payment instrument and crypto institution licences once enacted (probably 2028 or later), using FINMA pre-consultation in the meantime.
- **Swiss partner candidates:** FINMA-licensed crypto-capable banks such as Sygnum and AMINA. These are background examples only; I did not verify their current partnership offerings this session.

### Gaps
- **No partner comparison:** current Swiss and EU banking-as-a-service, EMI-as-a-service or stablecoin-custody partners were not identified or compared, so no pricing or terms are given.
- **SRO-only feasibility:** whether an SRO-only Swiss entity can run institutional fiat treasury balances using a partner bank's omnibus accounts depends on facts. It turns on the 60-day rule and whether the funds count as deposits; counsel must decide.

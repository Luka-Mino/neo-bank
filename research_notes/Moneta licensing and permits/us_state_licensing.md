# US State Licensing for a Consumer Stablecoin Wallet and Payments App (as of 2026-11-24)

Scope: US state law only. This is research, not legal advice; items marked "counsel" need a lawyer's decision. Product facts assumed (from the brief): the app holds the only signing key server-side for users' Base/USDC wallets, takes ACH deposits and converts them to USDC, pays withdrawals out to users' banks, records user-to-user transfers as book entries in its own database, and runs on Dakota Platform, Inc. (NMLS #2727274), which says partner "flows run under Dakota's licenses".

Source-quality legend: **[primary]** = statute, regulator or NMLS/CSBS document I read directly; **[law firm]** = law-firm alert; **[secondary/vendor]** = consultancy, licensing vendor or crypto-media summary (treat numbers as indicative only); **[search-summary]** = the claim came from a search-result summary whose underlying page I could not open, so it is unverified.

---

## 1. Which states require a money transmitter licence (MTL) for virtual currency and stablecoins; MTMA adoption; MTMA's definition of "control"

### Takeaway
Most states now treat custodying or transferring stablecoins for customers as licensable money transmission. They do it through the MTMA's optional virtual-currency article, a dedicated crypto statute (NY, CA, LA, and IL from 2027), or regulator interpretation (TX for stablecoins specifically, WA, FL, GA, PA). Only a handful clearly exempt virtual currency: Wyoming by statute, Montana (no MTL statute at all), and Hawaii since 2024. About 35 states had enacted the MTMA in full or in part by Aug–Oct 2026. The MTMA defines "control of virtual currency" as "the power to execute unilaterally or prevent indefinitely a virtual currency transaction". An app that holds the only signing key has that power.

### Cited Findings
**MTMA adoption count (late 2026)**
- A tracker citing CSBS's enactment chart dated **October 8, 2026** counts **35 states** with the MTMA in some form: 31 full adoptions and 4 partial (California, Connecticut, Rhode Island, Utah) — [Paloma tracker](https://trypaloma.app/blog/money-transmission-modernization-act-states) [secondary/search-summary]. Womble Bond Dickinson also gives 35 "in full or in part" as of August 2026 — [Womble Bond Dickinson](https://www.womblebonddickinson.com/us/insights/insights/102o0z1/csbs-launches-and-formalizes-money-transmission-modernization-act-guidance-reques) [law firm/search-summary]. A surety vendor said 31 states as of Sept 3, 2026 — [Cornerstone Surety](https://cornerstonesuretybonds.com/regulatory/csbs-money-transmission-modernization-act-updates-222b8223) [vendor]. **The counts conflict**, and the CSBS chart itself should be checked before quoting a number.
- CSBS's own June 2026 legislative update (read in full) lists these enactments **[primary]** — [CSBS MTMA Legislative Update, June 2026](https://www.csbs.org/sites/default/files/external-link-files/MTMA%20Legislative%20Update%20-%20June%202026.pdf):
  - **2026:** Louisiana HB 1230 (full, effective July 1, 2026); Oklahoma HB 3521 (full, effective Nov 1, 2026). Pending at that date: Alaska SB 86/HB 99 (passed both houses, awaiting transmittal to the governor) and Delaware SB 18 (full MTMA *including the virtual-currency title*, passed the Senate).
  - **2025:** Colorado (full, effective July 17, 2025), Massachusetts (full, Jan 1, 2026), Mississippi (full, July 1, 2025), Nebraska (full, Oct 1, 2025), Virginia HB 1942 (full, July 1, 2026).
  - **2024:** Connecticut (partial), Illinois (full, Jan 1, 2026), Kansas (full, Jan 1, 2025), **Maine (full, with virtual currency, Aug 9, 2024)**, Missouri, New Hampshire, South Carolina, South Dakota, Vermont, Wisconsin (all full), Rhode Island (net worth and permissible investments only).
  - **2023:** Arkansas, California, Georgia, Hawaii (significant or partial provisions); full adoptions in Indiana, Iowa, Maryland (by regulation), **Minnesota (with Title XIII virtual currency)**, Nevada, **North Dakota (with Title XIII virtual currency)**, Tennessee, **Texas (SB 895, effective Sept 1, 2023)**.
  - **2022:** Arizona (full); partial provisions in CA, CT, GA, HI, RI, SD, UT, WV.
- Another source lists Louisiana and Massachusetts as 2026 full adoptions — [Hector](https://hectortechnologies.com/resources/money-transmitter-license-by-state) [vendor].

**MTMA virtual-currency article (it is Article XIII, not Article 12; Article XIII is optional)** — from the CSBS model text **[primary]**, [CSBS Money Transmission Modernization Act (model law PDF)](https://www.csbs.org/sites/default/files/2023-02/CSBS%20Money%20Transmission%20Modernization%20Act.pdf):
- §13.01(a): "'Control of virtual currency,' when used in reference to a transaction or relationship involving virtual currency, means the power to execute unilaterally or prevent indefinitely a virtual currency transaction."
- §13.01(c): "Transfer" means to assume control of virtual currency from or on behalf of a person and to (1) credit it to another person's account, (2) move it between accounts of the same person, or (3) relinquish control to another person. §13.01(b): "Exchange" means to assume control, "at least momentarily", to sell, trade or convert.
- §13.01(g): "Virtual-currency business activity" means exchanging, transferring or storing virtual currency, or virtual-currency administration, "whether directly or through an agreement with a virtual-currency control-services vendor". §13.01(h) defines a control-services vendor as "a person that has control of virtual currency solely under an agreement with a person that, on behalf of another person, assumes control of virtual currency."
- §13.03: no person may engage in, or hold itself out as able to engage in, virtual-currency business activity unless licensed or exempt under §3.01. A licensed person "is engaged in the business of money transmission".
- §13.02(b) carve-outs: connectivity software or computing power only; "provides only data storage or security services for a business engaged in virtual-currency business activity and does not otherwise engage in virtual-currency business activity on behalf of another person"; activity of $5,000 a year or less; personal or own-account use.
- §13.05: a licensee with control must hold enough of each virtual currency to meet customers' aggregate entitlements. That virtual currency is held for customers, is not property of the licensee, and is not reachable by the licensee's creditors.
- A CSBS commentary note says virtual-currency business activity does not include *solely* receiving money for transmission to a person engaged in virtual-currency business activity, or receiving money from such a person for transmission onward.
- The same "control" wording is enacted in Minnesota Stat. §53B.69 subd. 2 [primary], [MN Revisor 53B.69](https://www.revisor.mn.gov/statutes/cite/53B.69), and in Maine, [Maine 32 MRSA §6100-OO](https://legislature.maine.gov/legis/statutes/32/title32sec6100-OO.html) [primary].
- Commentators argue that broader "control" definitions could pull wallet providers into licensing, including those using multi-party computation (MPC) — [S. Horowitz](https://s-horowitz.com/multi-party-computation-mpc-wallets-and-the-evolving-regulatory-landscape-in-the-united-states/) [law firm/search-summary].
- Colorado's Division of Banking issued "Interim Guidance: Cryptocurrency and the MTMA" on Dec 18, 2025 — [Colorado DOB](https://banking.colorado.gov/sites/banking/files/documents/Interim_Guidance_Cryptocurrency_and_the_MTMA_Final_12.18.25.pdf). The PDF returned HTTP 403 and was not read.

**State-by-state treatment of virtual currency (selected)**
- The NMLS Multistate MSB Licensing (MMLA) Phase One checklist (updated **4/7/2026**) has an activity table. My parse of its "Virtual currency" column (the header is garbled in the extracted text) is **[primary]**, [NMLS MMLA Phase One Checklist](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/stateresourcecenter/Shared%20Documents/Multistate%20MSB%20Licensing%20Program%20Phase%20One%20Checklist.pdf):
  - **MT licence required for VC:** CT, GA, IA, ME, NC, OH, OR, RI (currency transmitter), SD, VT, WA.
  - **No licence needed for VC:** KY, MA, ND, UT, WY.
  - **"Contact the state":** CA, ID, IL, IN, KS, LA, MD, MI, MN, MS, NE, PA, SC, TN, TX, WI.
  - ND is shown as "X" even though CSBS says ND enacted Title XIII. **This conflicts with CSBS and should be confirmed with ND.**
- The same checklist says Massachusetts "only regulates foreign transmissions and not domestic-only transactions" (FTA licence), and that NC, PA and WY "only regulate activity for personal, family, or household use" [primary].
- **Pennsylvania:** Act 7 of 2025 (SB 202, signed June 27, 2025) brings virtual-currency transmission under the Money Transmitter Act. It took effect **Aug 26, 2025** with "no grace period", and the 2024 VC Statement of Policy is rescinded — [PA DoBS Act 7 letter](https://www.pa.gov/content/dam/copapwp-pagov/en/dobs/documents/non-bank-licensees/forms/non-bank%20licensee%20act%207%20letter%20081225.pdf); [PA DoBS newsroom](https://www.pa.gov/agencies/dobs/newsroom/dobs-regulating-virtual-currency-transmitters-thanks-to-new-bipa.html) [primary]. A vendor says the PA bond for VC transmitters is $1,000,000 — [Faisal Khan PA page](https://faisalkhan.com/solutions/licensing/money-transmitter-license/pennsylvania-money-transmitter-license) [vendor, unverified].
- **Illinois:** the Digital Assets and Consumer Protection Act (Public Act 104-0428, signed Aug 18, 2025) requires digital asset businesses serving Illinois residents to **register with IDFPR by July 1, 2027**. IDFPR proposed rules with comments open to June 29, 2026 — [IDFPR Office of Innovation](https://idfpr.illinois.gov/about/innovation.html) [primary]; [Paul Hastings DACPA roadmap](https://www.paulhastings.com/insights/client-alerts/roadmap-to-dacpa-the-time-to-prepare-and-engage-is-now) [law firm]. A profile site lists custody requirements from Jan 1, 2027 — [CryptoSlate IL profile](https://cryptoslate.com/crypto-laws/illinois-digital-assets-consumer-protection-act-united-states/) [secondary, unverified].
- **Wyoming:** W.S. 40-22-104(a)(vi) exempts buying, selling, issuing or taking custody of payment instruments in the form of virtual currency, and receiving VC for transmission, from the Money Transmitters Act (from 2018 HB 19) — [Justia W.S. 40-22-104](https://law.justia.com/codes/wyoming/2022/title-40/chapter-22/section-40-22-104/); [K&L Gates 2018](https://www.klgates.com/thought-leadership/Understanding-the-Effect-of-Wyomings-Blockchain-and-Cryptocurrency-Legislation-06-04-2018) [primary/law firm]. 2026 HB 0075 (Enrolled Act 19) creates a kiosk chapter requiring kiosk operators to hold an MTL or a Title 13 charter — [WY HB0075 enrolled](https://wyoleg.gov/2026/Enroll/HB0075.pdf) [primary, not read in full].
- **Hawaii:** Hawaii announced that digital currency companies "will no longer require a Hawaii-issued money transmitter license", after its Digital Currency Innovation Lab ended in 2024 — [Greenberg Traurig, Feb 2024](https://www.gtlaw.com/pl/insights/2024/2/hawaiis-money-transmitters-modernization-act-will-no-longer-apply-to-cryptocurrency-activities) [law firm/search-summary].
- **Montana** has no money transmitter statute; one vendor says 49 of 50 states require an MT surety bond, with Montana the exception — [SuretyBonds.com guide](https://www.suretybonds.com/guide/federal/money-transmitter-license) [vendor/search-summary]. A 2026 consumer table also lists NH, SC and UT as having no standalone VC licence requirement — [BuyBitcoinSmart](https://www.buybitcoinsmart.com/united-states/states) [low reliability; NH and SC have since adopted the MTMA, so treat as unverified].
- Texas, Florida, Washington, Georgia, Louisiana, New York and California are covered in sections 4–6.

### Inferences
- Holding the *only* signing key server-side and signing every send meets the MTMA, DFAL and BitLicense tests of "control" or "custody or control". Under those regimes the app is the person "storing" and "transferring" virtual currency, unless the arrangement is restructured so that a licensee assumes control and the app is at most a contracted control-services vendor or a pure data-storage or security provider. Whether a server-held key operated "on behalf of" Dakota can qualify for the §13.02(b)(1)(B) carve-out is a **counsel question**, and the answer differs by state.
- Even where VC itself is out of scope (e.g., WY, MT, HI), the fiat legs (ACH in, bank payout) and internal book-entry transfers of a dollar-denominated balance are classic money transmission or stored value under ordinary MTL law.
- 35 is the best late-2026 MTMA count. 33 states are traceable to the June 2026 CSBS list (25 full, 4 "significant provisions", 4 partial), and Alaska plus Delaware passing would bring it to 35. That reconciliation is my own and is unverified.

### Gaps
- Could not open the live CSBS MTMA enactment chart, so the exact count and dates for Alaska and Delaware are unconfirmed.
- Beyond ME, MN, ND (and DE pending), I found no authoritative list of which MTMA states adopted the optional Article XIII. Colorado's Dec 2025 guidance was inaccessible (403).
- No primary confirmation of Hawaii's current statutory position or of NH, SC and UT treatment of VC.

---

## 2. NMLS multi-state process: documents, One Company One Exam, accelerated options, timelines and all-in costs

### Takeaway
Licensing runs through NMLS, using the Company Form (MU1) and Individual Forms (MU2). The MMLA programme lets one review state handle the common "Phase One" review for about 32 states; each state then runs its own "Phase Two". The required document set is well defined (see list below). The checklist also shows hard gating items: audited financials and electronic surety bonds must be in place *before* submission in roughly 18–20 states. Prior unlicensed activity disqualifies an applicant from the multistate protocol. I found no official "MSB Accelerated Application" programme; the MMLA is the closest. Public cost data is mostly from vendors. App and licence fees alone run about $65k across the 32 MMLA states, while aggregate bond face amounts run into the millions.

### Cited Findings
**Multistate programme mechanics** — [NMLS MMLA Phase One Checklist (updated 4/7/2026)](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/stateresourcecenter/Shared%20Documents/Multistate%20MSB%20Licensing%20Program%20Phase%20One%20Checklist.pdf) **[primary]**:
- "Completion of Phase One does not lead to a license in each state. Before a license will be issued a Phase Two must be completed in each state."
- **Disqualifiers from the multistate protocol:** headquarters outside the US; serving the marijuana industry; the company, its parent, a subsidiary, an affiliate or a control person has *prior unlicensed activity*; or a control person has a felony or a financial or dishonesty misdemeanour within 10 years.
- **Covered states** (those with fee entries): CA, CT, GA, ID, IL, IN, IA, KS, KY, LA, MA, MD, ME, MI, MN, MS, NC, ND, NE, OH, OR, PA, RI, SC, SD, TN, TX, UT, VT, WA, WI, WY. NY and FL are not in the MMLA list.
- **Application and licence fees via NMLS:** CA $5,000; CT $1,975; GA $2,150; ID $100; IL $200; IN $1,000; IA $1,500; KS $1,750; KY $1,100; LA $800; MA $1,300; MD $3,100; SC $2,250; SD $1,600; ME $500; MI $3,650 plus agent fees; MN $4,000; MS $1,500; NC $1,500; ND $950; NE $1,000; OH $5,000; OR $1,000; PA $5,000; RI $1,500; TN $100 plus; TX $10,000 plus an investigation fee if necessary; UT $300; VT $1,500; WA $1,100; WI $800; WY $1,500. Per person: credit report $15; FBI criminal background check $36.25. Uniform Authorized Agent Reporting fee: $0.25 per active agent location a year above 100 agents, capped at $25,000.
- **MU2 filers:** direct owners of 10% or more; indirect owners of 10% or more of voting securities; executive officers and control persons, including the board, CEO, CFO, COO, CTO and CCO/BSA Officer. Each must authorise a credit report, an FBI fingerprint background check and identity verification.
- **Third-party investigative background reports** are required for non-US citizens who have not lived in the US for 10 years, and for US citizens who have lived outside the US for more than 2 consecutive years in the last 10. Reports cover credit, civil and bankruptcy records, criminal records, regulatory history, employment and media.
- **Qualifying or responsible individual** required in CT, KY, IN (2 years' money-transmission experience), MD (3 years), MA, MI, PA, RI, TN, TX, VT and WA. WA's must be a W-2 employee with principal managerial authority.
- **Audited financials** must be submitted before the MU1 can be submitted in CA, CT, IL, IN, IA, KS, KY, ME, MD, MS, NE, OH, OR, SC, SD, TN, UT and VT. GA requires 3 years of audited statements unless the company is a start-up. PA requires 3 years audited unless a start-up. TX requires the applicant's own audited financials and "will not accept parent financials". The **start-up alternative** is unaudited quarter-end financials, plus documents showing the source of capitalisation, plus 2-year projections.
- **Electronic Surety Bond** must be filed before MU1 submission in GA, IN, IA, KS, MA, MI, MN, MS, NE, ND, OH, OR, RI, SC, SD, TN, TX, UT, VT and WY.
- **Document uploads:**
  - Business plan: executive summary, marketing, target markets, products and states, fee schedule, management structure, and an operational plan covering daily operations, flow of funds, settlement and reconciliation, per-state accounting, authorised agents, and payment types.
  - Formation documents and a good-standing certificate dated within 60 days.
  - Management chart showing compliance reporting and internal audit structure.
  - Ownership org chart totalling 100%, with indirect owners and affiliates.
  - Flow-of-funds document.
  - **AML/BSA policy with a company risk assessment, plus any independent review.**
  - Bank accounts used for transmission activity.
  - FinCEN MSB registration number.
  - Disclosure explanations.
  - If authorised agents are used, a description of the delegate-screening process.
- The MMLA has two phases, with Washington DFI as lead state — [NMLS MMLA programme page](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/stateresourcecenter/SitePages/MultistateMSBLicensingAgreementProgram.aspx) [primary/search-summary].
- **MTMA model application contents** (§5.03): criminal convictions and material litigation for 10 years; proposed authorised delegates and locations; other state licences and discipline; sample authorised-delegate contract; the depository institution used; audited financials for the latest year and 2 prior years, or certified unaudited if accepted; 10-year employment history of key individuals and control persons — [CSBS MTMA model](https://www.csbs.org/sites/default/files/2023-02/CSBS%20Money%20Transmission%20Modernization%20Act.pdf) **[primary]**.
- **DFAL and NYDFS add cybersecurity:** DFPI assesses applicants' information security programmes against the **NIST Cybersecurity Framework 2.0**, and requires an independent review of the BSA/AML programme — [Goodwin, Apr 3, 2026](https://www.goodwinlaw.com/en/insights/publications/2026/04/alerts-finance-dcb-california-dfal-license-application-open) [law firm].

**Prudential minimums (MTMA model)** — [CSBS MTMA model](https://www.csbs.org/sites/default/files/2023-02/CSBS%20Money%20Transmission%20Modernization%20Act.pdf) **[primary]**:
- §10.01 tangible net worth: the greater of $100,000, or 3% of total assets for the first $100m, plus 2% for $100m–$1bn, plus 0.5% above $1bn.
- §10.02 surety bond: the greater of $100,000 or 100% of average daily money transmission liability in the state, "up to a maximum of $500,000" (bracketed amounts that states may change).
- §10.03–10.04: permissible investments equal to outstanding money transmission obligations.
- State outliers:
  - WA: minimum tangible net worth of $100,000 for "virtual currency … storing on behalf of others (wallet)" — [WA DFI licensing FAQ](https://dfi.wa.gov/money-services/licensing-frequently-asked-questions) [primary/search-summary].
  - NY BitLicense: bond or trust account, generally at least $500,000 — [NYDFS VC page](https://www.dfs.ny.gov/apps_and_licensing/virtual_currency_businesses) [primary].
  - CA DFAL: initial expectation of $100k tangible net worth and a $500k bond — [Elliptic, May 6, 2026](https://www.elliptic.co/blog/california-dfal-july-2026-licensing-deadline) [secondary].
  - LA VCBA: bond from $100k, which OFI can raise to as much as $7m — [CryptoSlate LA profile](https://cryptoslate.com/crypto-laws/louisiana-virtual-currency-businesses-act/) [secondary/search-summary].

**Networked supervision and One Company, One Exam (OCOE)**
- OCOE lets multiple states jointly examine MSBs operating in **40 or more states**, with one lead state directing examiners drawn from several states. It ran as a pilot in 2019–early 2020, became a programme in late 2020, and the first single exams of nationwide payments firms took place in 2021 — [CSBS OCOE for MSBs](https://csbs.org/node/205541); [CSBS press release](https://www.csbs.org/node/199066) [primary/search-summary].
- MTMA §4.04 authorises and encourages states to join CSBS/MTRA multistate supervision, but states keep independent examination authority, and joint exams do not waive exam assessments — [CSBS MTMA model](https://www.csbs.org/sites/default/files/2023-02/CSBS%20Money%20Transmission%20Modernization%20Act.pdf) [primary].
- CSBS formalised an "MTMA guidance request intake process" in 2026 — [Womble Bond Dickinson](https://www.womblebonddickinson.com/us/insights/insights/102o0z1/csbs-launches-and-formalizes-money-transmission-modernization-act-guidance-reques) [law firm, not read in full].

**Timelines and all-in costs (mostly vendor data; treat as indicative)**
- Per-state approval estimates range from 4–6 weeks in fast states to 6–12+ months in slow ones (e.g., CT 6–12 months, TX 3–6 months), according to vendor comparison tools surfaced in search — [Spark stablecoin MTL comparison](https://www.spark.money/tools/stablecoin-money-transmitter-license-comparison) [vendor/search-summary].
- NYDFS publishes no BitLicense service standard. Secondary sources estimate 12–24 months, and say stablecoin models take longer — [InnReg](https://www.innreg.com/blog/bitlicense-new-york); [Buckingham Capital](https://www.buckinghamcapitalconsulting.com/new-york-bitlicense) [secondary/search-summary].
- Cost estimates conflict widely:
  - About $175k initial licensing cost for 53 jurisdictions, with renewals of about $135k — [SuretyBonds.com blog](https://www.suretybonds.com/blog/?p=10871) [vendor/search-summary].
  - $572,530 all-in for 51 jurisdictions, with **$8,455,000 of total surety bond face amount** — [Faisal Khan pricing](https://faisalkhan.com/pricing/us-state-money-transmitter-license-pricing) [vendor/search-summary].
  - $1.1–1.5m including paid-up capital and bonding — [Faisal Khan video](https://faisalkhan.com/resources/videos/how-much-do-money-transmitter-licenses-cost) [vendor/search-summary].

### Inferences
- Summing the NMLS checklist fees gives about **$64.7k** in application and licence fees for the 32 MMLA states alone (my arithmetic). NY (BitLicense $5,000 plus an MT licence), CA DFAL ($7,500 plus DFPI review costs), FL, NJ and others are extra, as are per-person fees, investigation fees and annual renewals and assessments.
- The real cost drivers are (i) bond collateral or premiums on several million dollars of aggregate face amount, (ii) tangible net worth and permissible-investment capital that grows with customer balances, (iii) audited financials (which take time for an entity that has not yet been formed), (iv) compliance hires (a qualifying individual, BSA Officer and CCO), and (v) legal fees. Legal fees were not found in reliable sources.
- **Timeline inference:** the entity must exist, raise capital, produce at least start-up financials (ideally audited), and write AML, cyber, business continuity, complaints and other policies *before* filing. That is plausibly 3–6 months of preparation. Approvals then arrive in waves over 6–18 months, with NY and CA likely last. 18–36 months to a near-national footprint is a reasonable planning range, but **no source gives this total**.
- **Sequencing risk:** "prior unlicensed activity" disqualifies an applicant from the MMLA and is a standard disclosure question. Launching first and licensing later would taint future applications, which strengthens the case for running under a licensee (option a) until licences are held.

### Gaps
- No official "MSB Accelerated Application" programme found in NMLS or CSBS materials. It may be a misnomer for the MMLA, or a programme I could not locate.
- No reliable (non-vendor) data on legal and consulting fees, bond premium rates, or annual exam assessments for a 49-state + DC footprint.
- Did not retrieve current NY money transmitter (Banking Law Art. 13-B) application fee or bond figures, or FL, NJ, DC or AK specifics.

---

## 3. Exemptions: authorised delegate, agent of payee, and similar; which states don't recognise them; contractual and operational conditions

### Takeaway
The MTMA (§5.01(b)) lets a person act without its own licence as an **authorised delegate of a licensee**, "acting within the scope of authority conferred by a written contract". The licensee must have written delegate policies, run a risk-based background check, and sign a contract with nine mandatory terms, including a trust over funds and consent to regulator examination. Delegates may not use subdelegates. The **agent-of-payee** exemption (§3.01(b)) covers collecting payment for a *merchant's goods or services*, "other than money transmission itself". It does not fit a P2P wallet or payments app. **New York's BitLicense expressly bans licensees from conducting virtual-currency activity through unlicensed agents**, so the delegate route does not work there for crypto activity.

### Cited Findings
- **MTMA §5.01(b)(1):** the licensing requirement does not apply to "A person that is an authorized delegate of a person licensed under this [Act] acting within the scope of authority conferred by a written contract with the licensee." — [CSBS MTMA model](https://www.csbs.org/sites/default/files/2023-02/CSBS%20Money%20Transmission%20Modernization%20Act.pdf) **[primary]**.
- **MTMA §8.01(b):** before using a delegate, the licensee must (1) adopt written policies and procedures "reasonably designed to ensure that the licensee's authorized delegates comply with applicable state and federal law"; (2) enter a compliant written contract; and (3) "conduct a reasonable risk-based background investigation" of the delegate. §8.01(c): "An authorized delegate must operate in full compliance with this [Act]." [primary]
- **MTMA §8.01(d), mandatory contract terms.** The contract must be signed by both parties and must:
  1. appoint the delegate with authority to conduct money transmission on the licensee's behalf;
  2. set out the nature and scope of the relationship and each party's rights and duties;
  3. require compliance with all state and federal money transmission law, including the BSA and USA PATRIOT Act;
  4. require remitting and handling money as the contract directs;
  5. "impose a trust on money and monetary value net of fees received for money transmission for the benefit of the licensee";
  6. require record-keeping;
  7. record the delegate's consent to examination or investigation by the Commissioner;
  8. state that the Commissioner may suspend or revoke the delegate designation or require the licensee to terminate it;
  9. acknowledge receipt of the licensee's policies. [primary]
- **MTMA §8.01(e)–(g):** if the licence is suspended, revoked, surrendered or expires, delegates "shall immediately cease"; commingled funds are deemed held in trust for the licensee; "An authorized delegate may not use a subdelegate". **§8.02:** a person conducting money transmission on behalf of an unlicensed, non-exempt person is "jointly and severally liable" with it. **§7.03:** licensees must report authorised delegates. **§5.03(a)(4),(7):** applications list proposed delegates and include a sample delegate contract. [primary]
- States enacting these terms include Iowa §533C.501 — [Iowa Code 2026](https://www.legis.iowa.gov/docs/code/2026/533C.501.pdf); Arizona A.R.S. §6-1222 — [AZ Leg](https://azleg.gov/ars/6/01222.htm); Illinois 205 ILCS 658/8-1 — [ILGA](https://witnessslips.ilga.gov/legislation/ilcs/documents/020506580K8-1.htm) [primary/search-summary].
- **Agent of payee, MTMA §3.01(b):** exempts "A person appointed as an agent of a payee to collect and process a payment from a payor to the payee for goods or services, other than money transmission itself, provided to the payor by the payee". Conditions: (1) a written agreement with the payee; (2) the payee holds the agent out to the public as accepting payments on its behalf; (3) the payment is treated as received by the payee when the agent receives it, so "there is no risk of loss to the payor if the agent fails to remit". [primary]
- **Other MTMA exemptions of note:**
  - §3.01(c): an intermediary between a *licensed* entity that has directly incurred the transmission obligation and the recipient. The licensed entity must issue the receipt naming itself as the provider and bear sole responsibility to make the sender whole.
  - §3.01(m): an agent or third-party service provider of an exempt *bank* that assumes all risk of loss.
  - §3.01(n): exemption by regulation or order. [primary]
- **States not recognising agent-of-payee:** a 2026 survey table lists FL, NJ, NM, OH, OR and WY as having no explicit exemption, and says RI and UT adopted parts of the MTMA without it. I could not confirm whether the table came from [PaymentBrief](https://paymentbrief.com/articles/us-money-transmitter-licensing-payment-models/) or [Pulse](https://pulsecrm.com/blog/payment-facilitator-money-transmitter-licensing-agent-of-payee/) [secondary/search-summary]. Texas reportedly applies a common-law version requiring written, expressly granted authority. Illinois and Florida reportedly "do not appear to have any agent-of-the-payee exemptions" — [ETA guest analysis](https://electran.org/news/guest-analysis-the-intersection-of-payments-and-money-transmission-a-look-at-the-agent-of-the-payee-exemption/) [secondary/search-summary; dated, and Illinois adopted the full MTMA from Jan 1, 2026].
- An academic review found the authorised-delegate exemption "fares no better" than agent-of-payee in the states it surveyed — [Yale JOLT, "Fatal Fragments"](https://yjolt.org/sites/default/files/lo_18yjolt111_jz2_0.pdf) [academic/search-summary].
- **New York (crypto):** 23 NYCRR §200.3(b): "Unlicensed agents prohibited. Each Licensee is prohibited from conducting any Virtual Currency Business Activity through an agent or agency arrangement when the agent is not a Licensee." — [23 NYCRR Part 200 text (2015, via Skadden)](https://www.skadden.com/-/media/files/publications/2018/10/the-distributed-ledger-october-2018/fn26_dfsp200t.pdf) **[primary]**.
- **California DFAL:** the published exemption lists include no "agent of a licensee" exemption for crypto. They cover banks and credit unions, trust companies, SEC/CFTC registrants, pure technology providers "that do not engage in DFAL activity themselves", merchants, and activity of $50,000 or less a year — [Elliptic](https://www.elliptic.co/blog/california-dfal-july-2026-licensing-deadline); [Jones Day, Feb 2026](https://www.jonesday.com/en/insights/2026/02/registration-under-california-digital-financial-assets-law-begins-march-9-law-takes-effect-july-1) [law firm/secondary].
- **NMLS operational expectation:** applicants using delegates must upload "a full description of the screening process you use to select authorized delegates, including any forms used, and the method used to screen for criminal history". Agent locations are reported quarterly through the Uniform Authorized Agent Reporting system — [NMLS MMLA checklist](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/stateresourcecenter/Shared%20Documents/Multistate%20MSB%20Licensing%20Program%20Phase%20One%20Checklist.pdf) [primary].
- A practitioner guide says a partner model can work if the licensed partner is "fully liable for customer funds and transmission", but that relying on a partner's licence is risky as the model evolves — [Brico NY MTL guide](https://brico.ai/post/new-york-money-transmitter-license) [secondary].

### Inferences
- **Fit to this product.** User-to-user book transfers and app-held keys look like the app itself performing money transmission and virtual-currency storage and transfer. The authorised-delegate route works only if, in substance:
  - (i) Dakota is the transmitter of record: its name is on receipts and terms, it owes customers the obligation, and its ledger is the book of record;
  - (ii) customer funds and USDC sit in Dakota-controlled or trust accounts, held in trust for Dakota under the contract;
  - (iii) the app follows Dakota's written policies and Dakota screens and oversees it;
  - (iv) the app has no subdelegates.

  An app that keeps its own ledger of user entitlements and the sole signing key will struggle to fit, because it would be "assuming control" in its own right. Restructuring custody, for example so that Dakota or its custodian controls keys and the app holds no unilateral power, is the key **counsel and engineering decision**.
- The §3.01(c) "intermediary" exemption can be an alternative to the delegate route in MTMA states. It requires Dakota to issue the receipt as the provider and bear sole responsibility to make senders whole.
- Agent-of-payee is not a viable basis here, because the app is not collecting payment for a merchant's goods or services.
- **State variance.** Delegate exemptions in fiat MTL statutes do not automatically cover crypto-specific regimes:
  - NY BitLicense explicitly bars unlicensed agents.
  - CA DFAL lists no agent exemption.
  - LA VCBA: I found no agent exemption.

  So in NY, CA and LA, the app likely needs either its own licence or a design in which it has no "control" and performs no covered activity. **Counsel**.
- **Dakota's ability to appoint delegates matters.** Its contract must appoint Moneta expressly. Moneta cannot sit under a Dakota partner, because subdelegation is banned. Dakota also needs a licence in every state where Moneta operates, so check Dakota's NMLS Consumer Access licence list.

### Gaps
- No authoritative state-by-state table of authorised-delegate recognition; the agent-of-payee lists come from unverified secondary sources.
- Did not verify whether Dakota (NMLS #2727274) holds NY BitLicense or MT licences, CA DFAL or MTA licences, a LA VCBA licence, or WA, TX and FL licences. This is a critical diligence item.
- Did not research state rules on whether a delegate may use its own brand, or on disclosures naming the licensee on customer receipts. MTMA §9.03 covers receipts but was not reviewed.

---

## 4. New York: BitLicense and MT licence; serving NY users under a partner; NYDFS guidance; costs and timelines

### Takeaway
New York requires a BitLicense for "storing, holding, or maintaining custody or control of Virtual Currency on behalf of others" and for "receiving Virtual Currency for Transmission". A licensee may **not** operate through unlicensed agents (§200.3(b)), and the only exemptions are NY-chartered banks and trust companies approved by DFS, plus merchants and consumers. Fiat transmission additionally needs a separate NY MT licence (Banking Law Art. 13-B), unless the firm is a limited-purpose trust company. In practice an app that controls keys cannot serve NY users "under a partner's licence". Options are (i) its own BitLicense (conditional licences exist), (ii) a design in which a NY licensee does everything and the app has no custody, control or transmission role, or (iii) geo-blocking NY. Application fee: $5,000, non-refundable; bond or trust account generally at least $500k; no published timeline (secondary estimates 12–24 months).

### Cited Findings
- **Covered activity (23 NYCRR §200.2):** "receiving Virtual Currency for Transmission or Transmitting Virtual Currency" (with a nominal-amount, non-financial exception); "storing, holding, or maintaining custody or control of Virtual Currency on behalf of others"; buying and selling as a customer business; exchange services; and controlling, administering or issuing a virtual currency — [Part 200 text](https://www.skadden.com/-/media/files/publications/2018/10/the-distributed-ledger-october-2018/fn26_dfsp200t.pdf); [NYDFS VC page](https://www.dfs.ny.gov/apps_and_licensing/virtual_currency_businesses) **[primary]**.
- **§200.3(a)–(c):** a licence is required. Licensees are prohibited from conducting VC business "through an agent or agency arrangement when the agent is not a Licensee". The exemptions are (1) persons "chartered under the New York Banking Law and … approved by the superintendent to engage in Virtual Currency Business Activity" and (2) merchants and consumers using VC "solely for the purchase or sale of goods or services or for investment purposes" [primary].
- **NYDFS FAQ exemptions** also include "writing software as a purely technical service, including self-custody wallets that don't hold others' funds" — [NYDFS VC page](https://www.dfs.ny.gov/apps_and_licensing/virtual_currency_businesses) [primary].
- **Fee:** §200.5 requires an initial application fee of $5,000, which "shall not be refunded" if the application is denied or withdrawn [primary]. **Capital** is set case by case (§200.8). **Bond or trust account** for customers is required (§200.9); the DFS page says generally at least $500,000 [primary].
- **Conditional licence (§200.4(c)):** may be issued "to an applicant that does not satisfy all of the regulatory requirements upon licensing". It brings heightened review, expires after 2 years unless renewed or made full, and can carry "any reasonable condition" [primary]. In June 2020 DFS proposed a framework for conditional BitLicenses for entrants working with an authorised BitLicensee or NY trust company. The DFS page still describes it only as a 2020 request for comment, and its finalisation is unconfirmed — [NYDFS 2020 industry letter](https://www.dfs.ny.gov/industry_guidance/industry_letters/il20200624_req_comments_proposed_framework) [primary/search-summary].
- **MT licence also needed:** a BitLicense applicant "must separately apply for a Money Transmission License" to move fiat under Banking Law Art. 13-B, except a limited-purpose trust company. Applications go through NMLS using the NY Virtual Currency New Application Checklist. DFS "won't begin substantive review until an application is informationally complete" and publishes no fixed timeframe — [NYDFS VC page](https://www.dfs.ny.gov/apps_and_licensing/virtual_currency_businesses) [primary].
- **Application contents (§200.4(a)):** affiliates and org chart; detailed biographical information on individual applicants, directors, principal officers and stakeholders; fingerprints; financial statements; policies (AML, cybersecurity, BSA, compliance); and more — [Part 200 text](https://www.skadden.com/-/media/files/publications/2018/10/the-distributed-ledger-october-2018/fn26_dfsp200t.pdf) [primary, partially read].
- **NYDFS guidance list** (from the DFS page) [primary]:
  - US Dollar-Backed Stablecoins (June 8, 2022): full backing and redeemability, reserve composition, and attestations. It applies to DFS-supervised issuers, not to coins a platform merely lists — [NatLawReview summary](https://natlawreview.com/article/new-york-financial-regulator-publishes-stablecoin-guidance) [law firm].
  - Coin listing (Nov 15, 2023) and the "Greenlist" — [NYDFS listing letter](https://www.dfs.ny.gov/industry_guidance/industry_letters/il20231115_listing_virtual_currencies). A coin not on the Greenlist needs an approved listing policy.
  - **Updated custody guidance (Sept 30, 2025)**, superseding the Jan 2023 guidance. It requires segregation and separate accounting of customer assets, both on-chain and in internal ledgers — [NYDFS IL 2025-09-30](https://www.dfs.ny.gov/industry-guidance/industry-letters/il20250930-updated-guidance-custodial-structures); [WSGR](https://www.wsgr.com/en/insights/new-york-regulator-issues-updated-guidance-for-virtual-currency-custodians.html) [primary/law firm].
  - Notice on sentiment-based virtual currencies (Jan 2025).
  - **Advertising and Marketing Guidance (Nov 12, 2026):** VCEs must update policies by **May 10, 2027**. Requirements: claims must be accurate and verifiable, including about "regulatory status"; disclosures must clearly identify "the VCE providing the product or service"; due diligence on third-party promoters; and monitoring for misuse of the VCE's brand — [NYDFS press release, Nov 12, 2026](https://dfs.ny.gov/reports_and_publications/press_releases/pr20261112) [primary].
- **Draft payment-stablecoin rules:** NYDFS reportedly published draft payment-stablecoin rules aligned with the federal GENIUS Act, keeping 100% reserves and adding caps on concentration at any single custodian — [Crypto Briefing](https://cryptobriefing.com/nydfs-draft-rules-payment-stablecoins/) [secondary, year and status unverified].
- **Timelines:** 12–24 months in practice; DFS's 90-day figure is a target, not a guarantee — [InnReg](https://www.innreg.com/blog/bitlicense-new-york); [Brico BitLicense costs](https://www.brico.ai/blog/bitlicense-crypto-license-costs-2026-guide) [secondary/search-summary].

### Inferences
- Because of §200.3(b), a BitLicensee partner cannot appoint the app as an unlicensed *agent* for VC activity. To serve NY users, the app's role must fall outside "Virtual Currency Business Activity" entirely, meaning no custody or control and no receiving VC for transmission. Alternatively the app needs its own (possibly conditional) BitLicense plus an NY MT licence, or it must exclude NY.
- An app-held key fails the "pure software / self-custody" exemption, because the app, not the user, can move funds.
- The Nov 2026 advertising guidance applies to licensees, but licensees must diligence third-party promoters. A NY-licensed partner will therefore likely impose marketing controls on any fintech front-end, including naming the licensee and avoiding claims about regulatory status.

### Gaps
- Did not confirm whether DFS finalised the 2020 conditional-BitLicense partnership framework, or how many conditional licences exist.
- Did not obtain NY MT licence fee, bond and net-worth amounts, or NY's position on fiat authorised delegates under Banking Law §648 et seq.
- Whether Dakota holds a BitLicense or NY trust charter is unknown. Its RD token is blocked in NY, but whether its USDC flows are offered to NY residents is unconfirmed.

---

## 5. California Digital Financial Assets Law (DFAL): deadline, status as of Nov 2026, scope, exemptions, stablecoins, documents

### Takeaway
DFAL licensing became mandatory on **July 1, 2026**. DFPI opened NMLS applications on March 9, 2026. Firms that filed a *complete* application by July 1, 2026 may keep operating while it is pending. Everyone else had to stop covered activity with California residents, so new entrants like this app must be licensed (or exempt) *before* serving California. Covered activity is exchanging, transferring or storing digital financial assets "with or on behalf of" a California resident, with control as the trigger. DFAL has no "acting through a licensee" exemption. The stablecoin rules (Fin. Code §§3601/3603) and the June 2026 amendments (reported as SB 97) are in flux and need verification.

### Cited Findings
- **Dates:** AB 1934 (Ch. 945, Stats. 2024) moved the licensing date from July 1, 2025 to July 1, 2026 — [Jones Day, Feb 2026](https://www.jonesday.com/en/insights/2026/02/registration-under-california-digital-financial-assets-law-begins-march-9-law-takes-effect-july-1) [law firm]. DFPI began accepting applications through NMLS on **March 9, 2026** — [Jones Day](https://www.jonesday.com/en/insights/2026/02/registration-under-california-digital-financial-assets-law-begins-march-9-law-takes-effect-july-1); [Elliptic](https://www.elliptic.co/blog/california-dfal-july-2026-licensing-deadline). One source gives March 18 — [search-summary, unverified].
- **Pending applicants:** "Entities may continue to operate while their application is pending review." Entities that do not apply and are not exempt "must cease covered activities with California residents after July 1, 2026" — [Jones Day](https://www.jonesday.com/en/insights/2026/02/registration-under-california-digital-financial-assets-law-begins-march-9-law-takes-effect-july-1) [law firm]. A firm must "submit a complete DFAL license application by July 1, 2026, to continue serving California residents" — [Goodwin, Apr 3, 2026](https://www.goodwinlaw.com/en/insights/publications/2026/04/alerts-finance-dcb-california-dfal-license-application-open) [law firm]. "A placeholder application that is completed after the deadline does not count" — [Elliptic](https://www.elliptic.co/blog/california-dfal-july-2026-licensing-deadline) [secondary].
- **Scope:**
  - Exchanging, transferring or storing digital financial assets, or digital-asset administration, "with or on behalf of a California resident". "Control is the key test. Even temporary control to execute a transfer may be licensable" — [Elliptic](https://www.elliptic.co/blog/california-dfal-july-2026-licensing-deadline) [secondary].
  - "Resident" includes anyone physically present in California for more than 183 of the last 365 days.
  - DFAL is **separate from the California Money Transmission Act**, so mixed fiat and crypto flows may need both licences.
  - Stablecoins are within "digital financial asset" — [Jones Day](https://www.jonesday.com/en/insights/2026/02/registration-under-california-digital-financial-assets-law-begins-march-9-law-takes-effect-july-1).
- **Exemptions (Fin. Code §3103)** — [Elliptic](https://www.elliptic.co/blog/california-dfal-july-2026-licensing-deadline); [Jones Day](https://www.jonesday.com/en/insights/2026/02/registration-under-california-digital-financial-assets-law-begins-march-9-law-takes-effect-july-1):
  - government;
  - FDIC-insured banks, credit unions and California trust companies;
  - SEC/CFTC registrants within their regulated capacity;
  - clearing agencies, and processors serving only exempt entities;
  - pure technology providers "that do not engage in DFAL activity themselves";
  - personal use, and merchants;
  - activity "reasonably expected to be $50,000 or less per year";
  - persons providing products or services without compensation.

  **Neither source lists an exemption for acting as agent of, or through, a licensee.**
- **Conditional licence:** DFPI "may issue conditional licenses to holders of New York virtual currency business licenses issued on or before January 1, 2023" (Fin. Code §3207) — [Jones Day](https://www.jonesday.com/en/insights/2026/02/registration-under-california-digital-financial-assets-law-begins-march-9-law-takes-effect-july-1) [law firm].
- **Application contents:**
  - written policies for information security, business continuity and disaster recovery, anti-fraud, AML/CFT and other compliance, established *before* applying;
  - disclosures of business, regulatory and litigation history, banking relationships and insurance;
  - fingerprints of executive officers and controlling persons — [Jones Day](https://www.jonesday.com/en/insights/2026/02/registration-under-california-digital-financial-assets-law-begins-march-9-law-takes-effect-july-1);
  - an independent BSA/AML review, and an infosec programme assessed against NIST CSF 2.0 — [Goodwin](https://www.goodwinlaw.com/en/insights/publications/2026/04/alerts-finance-dcb-california-dfal-license-application-open);
  - consumer disclosures (fees, liability, receipts, outages) and 5-year record retention — [Elliptic](https://www.elliptic.co/blog/california-dfal-july-2026-licensing-deadline).
- **Fees and capital:** $7,500 plus DFPI review costs; initial expectation of $100k tangible net worth and a $500k bond, with final amounts set in review — [Elliptic](https://www.elliptic.co/blog/california-dfal-july-2026-licensing-deadline) [secondary]. In June 2026 DFPI reportedly removed the bond as a prerequisite for a "substantially complete" application [search-summary, unverified].
- **Stablecoins (as enacted):**
  - Fin. Code §3601 generally bars a covered person from exchanging, transferring or storing a stablecoin unless the issuer is a licensee, applicant, bank or trust company and holds eligible securities against outstanding coins.
  - §3603 lets the Commissioner approve other stablecoins with conditions. The Commissioner must revoke approval if the coin is marketed so as to create an expectation that it carries no more risk than bank credit or a licensed stored-value product.
  - AB 1934 added a requirement for monthly reports demonstrating §3601 compliance.

  Sources: [FindLaw Fin. Code §3603](https://codes.findlaw.com/ca/financial-code/fin-sect-3603/); [California Public Law §3601](https://california.public.law/codes/financial_code_section_3601) [primary/search-summary].
- **2026 changes (unverified; sources conflict):**
  - Secondary compliance sites report that the Office of Administrative Law **disapproved** DFPI's proposed DFAL regulations on May 12, 2026, and that revised regulations were approved June 29, 2026, effective July 1, 2026.
  - The same sites report that **SB 97** was enacted June 30, 2026 as an urgency statute. They say it removed "administration" as a standalone covered activity and **repealed DFAL's standalone stablecoin chapter** — [ClearLaunch/Magist DFAL page](https://www.clearlaunch.dev/regulations/ca-dfal); [Brico DFAL guide](https://www.brico.ai/blog/california-dfal-licensing-guide-2026) [search-summary; I could not open these pages, and leginfo returned 403].
  - A Senate analysis described a bill deleting the "exchange" prong from the definition of digital financial asset activity — [Senate Judiciary analysis](https://sjud.senate.ca.gov/media/1614) [search-summary, bill number unconfirmed].
- **No public report found of the first DFAL licences issued**, as of searches on 2026-11-24.

### Inferences
- The app missed the July 1, 2026 filing window, so it **cannot rely on the "pending application" safe harbour**. It must either (a) obtain a DFAL licence before offering custody or transfer to California residents, (b) design its California offering so a DFAL-licensed or exempt entity does all covered activity and the app has no control, or (c) exclude California for crypto features. Whether Dakota holds a DFAL licence, or filed by July 1, 2026, must be confirmed.
- The fiat side (ACH in, payouts, book transfers) separately implicates the California Money Transmission Act, which *does* recognise agents and has its own exemptions (not researched here).
- If SB 97 did repeal the stablecoin chapter, the §3601/3603 issuer-status restrictions on USDC may no longer apply, possibly replaced by GENIUS-Act-aligned treatment. **Counsel must confirm against the chaptered text.**

### Gaps
- Could not access DFPI's DFAL pages or leginfo (both 403), so the status of SB 97, of the regulations, and of the current stablecoin rules is unverified.
- Unknown: DFAL processing times, number of applicants and licences, whether DFPI accepts new filings after the deadline on an "operate only after licence" basis (implied but not confirmed), and how DFAL treats a non-custodial front-end partnered with a licensee.

---

## 6. Other notable state digital-asset regimes (LA, TX, FL, WA, GA, HI, WY, PA, IL) and why a partner might geo-restrict its stablecoin in FL, GA, NY, TX, WA, LA

### Takeaway
Each of the six states where Dakota's RD is blocked has an explicit, active regime that captures stablecoin custody, transfer or issuance through its money-transmission or crypto law:
- **NY:** BitLicense plus coin-listing and Greenlist approval.
- **LA:** standalone VCBA licence; its sunset was repealed in 2026.
- **TX:** fiat-backed stablecoins treated as "monetary value" under SM 1037; issuers licensed as money transmitters.
- **FL:** Chapter 560 expressly covers VC transmission from 2023.
- **WA:** VC is "value" for money transmission, and wallet storage is licensable.
- **GA:** VC is expressly in the MT law.

Dakota's own page gives no reason for the block. The likely explanation, which is an inference, is that RD (a Treasury-backed token, possibly with rewards) needs state-specific approval, listing or licence scope in these states that Dakota has not yet obtained. USDC is offered there as the fallback.

### Cited Findings
- **Dakota's RD page:** RD is "currently unavailable" in **Florida, Georgia, Louisiana, New York, Texas, Washington**. The list "may change over time as Dakota expands state coverage". The restriction is "applied based on their address on file" and cannot be bypassed. "USDC is the recommended alternative." No reason is given — [Dakota support: Why is RD blocked](https://support-platform.dakota.xyz/articles/4271304007-why-is-rd-blocked-for-some-customers-state-restrictions) [primary, page "last updated 4 months ago"].
- **Louisiana VCBA** (La. R.S. 6:1381 et seq.):
  - Licence required from July 1, 2023 for exchanging, transferring or storing VC, or VC administration, "whether done directly or through a control services vendor"; applications through NMLS; audited financials to evidence net worth; quarterly reports — [LA OFI VCBA page](https://ofi.la.gov/non-depository/virtual-currency-business-activity) [primary].
  - **Act 923 (SB 163, 2026), effective Aug 1, 2026, repeals the VCBA's July 1, 2027 sunset.** The VCBA is now deemed preempted only to the extent of conflict with a federal VC-licensing law, effective on the last day of the calendar year in which that federal law takes effect — [LA OFI notice, July 24, 2026](https://ofi.la.gov/wp-content/uploads/2026/07/NonDep_2026VCBASunsetLegislation_SB163.pdf) [primary].
  - Kiosk rules came via HB 483 (Act 369, 2025) and reportedly Act 482 (SB 287, 2026) [primary/search-summary].
  - Persons with Louisiana volume of $35,000 or less a year may file a notice instead of a licence — [Cooley, 2022](https://www.cooley.com/news/insight/2022/2022-11-21-louisianas-virtual-currency-licensing-law-taking-effect-finally) [law firm/search-summary].
  - Louisiana also adopted the full MTMA (HB 1230, effective July 1, 2026) — [CSBS June 2026](https://www.csbs.org/sites/default/files/external-link-files/MTMA%20Legislative%20Update%20-%20June%202026.pdf) [primary].
- **Texas:**
  - The Department of Banking "currently licenses and regulates issuers of fiat-currency backed stablecoin as money transmitters, pursuant to Chapter 152 of the Texas Finance Code" — [TX DOB GENIUS Act page](https://dob.texas.gov/money-services-business/genius-act-non-depository) [primary].
  - SM 1037 was revised to treat stablecoins backed by sovereign currency as "monetary value", so money transmission involving them triggers Chapter 152 licensing — [TX DOB Commissioner testimony, Aug 2022](https://www.dob.texas.gov/sites/default/files/files/news/Testimony/2022/082522t.pdf) [primary/search-summary].
  - The current SM 1037 revision (Jan 28, 2025) supersedes the 2019 memo, applies the Money Services Modernization Act (effective Sept 1, 2023), and scrutinises stablecoin transactions more closely than BTC/ETH — [Lowenstein Sandler, Mar 4, 2025](https://www.lowenstein.com/news-insights/publications/articles/texas-banking-dept-memo-demystifies-crypto-classifications) [law firm].
- **Florida:** CS/HB 273 (signed May 12, 2022, effective **Jan 1, 2023**) added "virtual currency" to Chapter 560. A licence is required for an intermediary that can transmit VC from one person to another location or person, and the transmitter must hold like-kind VC equal to the amount owed during transmission — [FL Senate CS/HB 273](https://flsenate.gov/Session/Bill/2022/273); [Greenberg Traurig alert](https://www.gtlaw.com/he/insights/2022/5/florida-gov-signs-bill-defines-virtual-currency-eases-licensing-restrictions-virtual-currency); [FL OFR industry alert](https://flofr.gov/news/details/industry-alert--change-in-money-transmission-definition) [primary/law firm]. Florida is outside the MMLA list and reportedly lacks an agent-of-payee exemption (see section 3).
- **Washington:**
  - RCW 19.230.010 includes virtual currency as value in "money transmission" — [RCW 19.230](https://app.leg.wa.gov/rcw/default.aspx?cite=19.230) [primary/search-summary].
  - DFI: "A person providing virtual currency storage may need to obtain a money transmitter license" — [WA DFI fintech](https://dfi.wa.gov/fintech/industry). Minimum tangible net worth is $100,000 for wallet storage — [WA DFI FAQ](https://dfi.wa.gov/money-services/licensing-frequently-asked-questions).
  - Storage is exempt only where the holder "does not have the ability to use that virtual currency without the consent or permission of the actual owner" — [WA DFI 2018 newsletter](https://dfi.wa.gov/cs-newsletter/2018/issue3/virtual-currency.html) [primary/search-summary; check current WAC 208-690].
- **Georgia:** the MT law treats "virtual currency" as "a digital representation of monetary value". A licence is required under O.C.G.A. §7-1-681, and the regulator may make VC-specific rules — [Freeman Law state survey](https://freemanlaw.com/digital-currency-laws-and-regulations/); [Carlton Fields 2018](https://carltonfields.com/insights/publications/2018/is-cryptocurrency-money-depends-on-your-state) [secondary/law firm/search-summary]. NMLS lists GA as "MT" for VC — [NMLS MMLA checklist](https://mortgage.nationwidelicensingsystem.org/knowledge/Products/nmls/stateresourcecenter/Shared%20Documents/Multistate%20MSB%20Licensing%20Program%20Phase%20One%20Checklist.pdf) [primary].
- **Hawaii:** VC no longer requires a Hawaii MTL as of 2024 — [Greenberg Traurig](https://www.gtlaw.com/pl/insights/2024/2/hawaiis-money-transmitters-modernization-act-will-no-longer-apply-to-cryptocurrency-activities) [law firm/search-summary].
- **Wyoming:**
  - The MT Act exempts VC custody and transmission (see section 1).
  - Special Purpose Depository Institution (SPDI) charter: 2026 SF 0055 (Session Laws ch. 75, Mar 7, 2026) sets a **$5m minimum capital**, revises application and commencement rules, adds appeal rights and creates an SPDI resolution fund — [WY SF0055 enrolled](https://wyoleg.gov/2026/Enroll/SF0055.pdf) [primary/search-summary].
  - SPDIs perform bank functions except lending — [Chambers Fintech 2026: Wyoming](https://chambers.com/practice-guides/guides/fintech-2026/usa-wyoming/trends-and-developments) [secondary].
- **Pennsylvania** (Act 7, Aug 26, 2025) and **Illinois** (DACPA registration by July 1, 2027) are covered in section 1.
- **Pattern in other providers' state exclusions:** NY is most often excluded from stablecoin rewards products. RockWallet does not support stablecoins in Texas and limits functionality in Louisiana. Robinhood Earn is reportedly unavailable in NY and TX — [NerdWallet stablecoin yield](https://www.nerdwallet.com/investing/best/stablecoin-yield-programs); [RockWallet availability](https://help.rockwallet.com/where-is-rockwallet-available) [secondary].

### Inferences
- **Why RD is blocked in exactly these six states (inference only; Dakota gives no reason):**
  - **NY** requires coin-specific listing or Greenlist approval, and DFS-supervised issuer standards for USD-backed coins.
  - **TX** licenses fiat-backed stablecoin issuers as money transmitters, so an RD issuer or distributor may need specific Texas authorisation.
  - **LA** requires a VCBA licence that covers transfer and storage. Its sunset was just repealed, so the regime is not going away.
  - **WA, FL and GA** expressly include VC in money transmission, with like-kind reserve rules in FL, and may need licence scope or approval for a new token.
  - If RD carries "rewards", some of these states may also treat it as an investment or deposit-like product. That is a federal/securities question outside this scope.

  USDC (issued by a federally or NY-supervised issuer) is the fallback, which suggests issuer-status or listing approvals rather than general crypto bans.
- **Practical implication for the app:** state-level product gating by residence address must be built into onboarding and transfers. RD-specific blocks in the six states are already required by Dakota, and broader blocks may be needed in NY and CA (and possibly LA, IL from 2027, and PA) if neither Dakota nor the app holds the needed crypto licences.

### Gaps
- Dakota's actual licence footprint, and the real reason for the RD blocks, are unknown. Ask Dakota directly and check NMLS Consumer Access for #2727274.
- Texas HB 1666 (2023, reported customer-asset protection for crypto exchanges) was not verified.
- Current Washington WAC 208-690 text and Georgia's DBF VC rules were not retrieved.

---

## 7. Restrictions on non-banks using the word "bank" (name, domain, marketing) and recent enforcement against fintechs

### Takeaway
Many states bar non-banks from using "bank", "banker" or "banking" in names or marketing in a way that may mislead. Regulators have enforced this against fintechs:
- **California DFPI and Illinois IDFPR against Chime (2021):** Chime agreed to stop calling itself a bank or using a "bank" URL without disclaimers.
- **California DFPI against Dora Financial (consent order, Nov 2024):** the order requires distancing from "bank"/"banco" and an adjacent "not a bank" disclosure.

For a "neobank" with no bank partner (stablecoin custody via a money transmitter), the risk is higher. It has no "banking services provided by X Bank" disclosure to fall back on, and terms like "bank account" could be treated as misleading.

### Cited Findings
- **Illinois, 205 ILCS 5/46:**
  - Non-banks may not use "bank", "banker" or "banking" in their business, or market in ways that imply they are a bank, where there is a substantial risk of misleading the public.
  - No one may use an existing bank's name without consent, or names confusingly similar to it.
  - The Commissioner may order the use to stop and impose civil penalties of up to $10,000 per violation if it continues, and may permit use where there is no substantial likelihood of misleading the public.

  Source: [205 ILCS 5/46](https://my.ilga.gov/legislation/ilcs/fulltext?DocName=020500050K46) [primary/search-summary].
- **Illinois Chime consent order (Mar 25, 2021):** where "banking" terms are used, Chime must disclose it "is not a bank" and that banking services are provided by its partner bank, "in bold and/or increased font placed clearly next to the use of the term" — [IDFPR Chime consent order](https://idfpr.illinois.gov/content/dam/soi/en/web/idfpr/banks/cbt/enforcement/2021/2021-03-25-chime-il-settlement-agreement-and-consent-order.pdf) [primary/search-summary].
- **California Chime settlement (2021):** DFPI said Chime "was not licensed to operate as a bank in California or in any other jurisdiction, nor was it exempt". Chime agreed to stop using "bank" (including in a URL) unless accompanied by disclosures that it is not a bank and that services are provided by bank partners — [TechCrunch, May 5, 2021](https://techcrunch.com/2021/05/05/chime-has-agreed-to-stop-using-the-word-bank-after-a-california-regulator-pushed-back/); [American Banker](https://www.americanbanker.com/news/chime-forced-to-scrub-use-of-word-bank-after-regulators-pushback) [news].
- **California DFPI, Dora Financial LLC consent order (Nov 2024):** the company must distance itself from "bank", "banco" and derivatives; place a disclosure that it is not a bank and that banking products and services come from its credit-union partner(s); and not represent itself as a bank — [DFPI Consent Order – Dora Financial](https://dfpi.ca.gov/wp-content/uploads/2024/11/Consent-Order-Dora-Financial-LLC.pdf) [primary/search-summary]. The specific California Financial Code section (often cited as Fin. Code §1563 or nearby) was **not confirmed**.
- **New York:** a DFS interpretation describes the operative restriction as Banking Law **§132**, whose purpose "is to restrict the use of the words bank or trust company by corporations that are not duly authorized to act as such". Commentary elsewhere cites "Banking Law 131" — [NYDFS interpretation letter](https://www.dfs.ny.gov/legal/interpret/lo070514.htm); [DWT Fintech 2023](https://www.dwt.com/-/media/files/blogs/financial-services-law-advisor/2023/09/gli-fintech-2023.pdf?rev=215b59ebf1744452b53154237745453f&hash=E8FC3E88098082672EFCA7CBB6F51A4C) [primary/law firm/search-summary]. **The citation conflicts and must be confirmed.** The brief's reference to "§9-b" was not verified.
- **General rule:** "many states prohibit the use of the term 'bank' and related terms by nonbanks, including by Fintech entities" — [DWT Fintech Laws and Regulations 2021](https://www.dwt.com/-/media/files/blogs/financial-services-law-advisor/2021/09/fintech-laws-and-regulations-2021--usa.pdf) [law firm].
- **NYDFS Nov 12, 2026 advertising guidance:** licensed VC entities must avoid "false claims about … regulatory status" and must clearly identify the entity providing the product — [NYDFS press release](https://dfs.ny.gov/reports_and_publications/press_releases/pr20261112) [primary].
- **DFAL §3603 (as enacted):** the Commissioner must revoke a stablecoin approval if the coin is marketed so as to create an expectation that it carries no more risk than bank credit — [FindLaw §3603](https://codes.findlaw.com/ca/financial-code/fin-sect-3603/) [primary/search-summary].

### Inferences
- Branding as a "neobank", using "bank" in a domain or app name, or calling the product a "bank account" creates exposure in at least CA, IL and NY, and probably many other states.
- The Chime and Dora remedies rely on a partner *bank or credit union* disclosure. A stablecoin wallet run through a money transmitter has no such partner, so the safer copy is "not a bank; not FDIC-insured; USDC held via [licensed money transmitter]". This matches the "not FDIC-insured" guardrail already in the project's marketing-site notes.
- Dakota, as licensee, will likely need to approve marketing under authorised-delegate contracts and the Nov 2026 NY guidance on third-party promoters. Counsel should review the name, domain and all copy before launch.

### Gaps
- No 2025–2026 state enforcement on "bank" terminology found beyond the Dora order (Nov 2024).
- No comprehensive state-by-state list of "bank" name statutes was retrieved; only IL was confirmed directly, with NY's citation conflicting and CA's section unconfirmed.
- Federal restrictions (e.g., 18 U.S.C. §709, FDIC Part 328) are out of scope and belong to the federal researcher.

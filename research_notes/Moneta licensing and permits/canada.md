# Canada: registrations and licences for a custodial USDC wallet / payments app (current as of 2026-11-24)

Scope note: Canada only. Research notes, not legal advice. Product facts assumed from the brief: a custodial USDC wallet on Base where the app holds the only signing key and signs every send; US ACH deposits, withdrawals to the user's bank, and user-to-user transfers as book entries; the US partner is a FinCEN-registered, state-licensed money transmitter. Scenario A = company and/or staff in Canada, customers in the US only. Scenario B = the app serves Canadian residents.

Reliability flags used below: "(fetched)" means I read the page itself. "(search summary)" means the claim came from a search-engine summary of the page, not from reading it, so it should be checked before anyone relies on it. Several official sites (Revenu Québec, LégisQuébec, csa-acvm, Fasken) blocked automated fetching (HTTP 403/429/502), so some Quebec and CSA points are search-summary only.

---

## 0. Scenario matrix: what each scenario triggers (summary of sections 1–7)

### Takeaway
In Scenario A, Canadian incorporation or Canadian employees create a "place of business in Canada". That alone makes the operator a FINTRAC money services business (MSB) and puts it in scope of the RPAA wherever its customers are. Securities and Quebec licensing are mostly a Scenario B issue, with one Scenario A securities risk noted in section 4. In Scenario B, expect all of the following: FINTRAC MSB or foreign MSB registration, RPAA PSP registration (fiat legs now; stablecoin legs once stablecoins are prescribed, targeted for fall 2027), securities-law registration or exemptive relief for custodial USDC, a Quebec MSB licence if Quebec residents are served, the Bank Act "bank" word ban, and the Stablecoin Act's effect on whether USDC can be offered at all.

### Cited Findings
- FINTRAC: an MSB is a person or entity with a "place of business in Canada", which means incorporated in Canada, a physical location there, or employees, agents or branches there. "Client location does not determine MSB status." — [FINTRAC, MSBs: FINTRAC's requirements (modified 2025-10-01)](https://fintrac-canafe.canada.ca/msb-esm/msb-eng) (fetched)
- FINTRAC: a foreign MSB (FMSB) has no Canadian place of business but both directs services at persons or entities in Canada and provides services to clients in Canada. — [FINTRAC MSB page](https://fintrac-canafe.canada.ca/msb-esm/msb-eng) (fetched)
- RPAA applies to PSPs that "have a place of business in Canada regardless of where their end users are or where they direct their services". — [Bank of Canada, Supervisory framework](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/supervisory-framework/) (search summary); the same test appears on [the Registration framework page](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/supervisory-framework-registration/) (fetched)
- The Bank of Canada treats a home office, Canadian incorporation, or "employees, agents or mandataries in Canada" as a place of business. — [Bank of Canada, Criteria for registering PSPs (updated 2026-06-29)](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/retail-payments-supervision-supervisory-policies-and-guidelines/criteria-for-registering-payment-service-providers/) (fetched)
- RPAA currently covers EFTs "in Canadian or foreign currencies (excluding digital currencies)". — [Bank of Canada, Registration framework](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/supervisory-framework-registration/) (fetched)
- Proposed regulations would prescribe stablecoins as an RPAA "unit", bringing custodial wallets into Bank of Canada supervision, with a target of fall 2027. — [Canada Gazette Part I, Vol. 160, No. 43 (2026-10-24)](https://gazette.gc.ca/rp-pr/p1/2026/2026-10-24/html/reg1-eng.html) (fetched)

### Inferences
- **Scenario A, US customers only, entity or staff in Canada:**
  - FINTRAC MSB registration is likely required. "Transferring virtual currency at the request of a client" describes the app signing every send, and client location is irrelevant.
  - RPAA registration is likely required for the fiat (USD/ACH) payment functions the Canadian entity itself performs. That depends on whether the app, or only the US partner, performs those functions. The USDC legs are outside the RPAA until stablecoins are prescribed and the private-key payment function comes into force.
  - No Quebec licence and no CTP registration are needed for US-only customers, subject to the Ontario/securities caveat in section 4.
  - CBCA or provincial incorporation, PIPEDA, and the Bank Act s.983 restriction on describing "a business in Canada" all apply.
- **A US entity with remote employees in Canada:** both FINTRAC's and the Bank of Canada's definitions count "employees" in Canada as a place of business. Counsel must decide whether remote staff alone trigger MSB/PSP status, and whether structuring (for example, contractors employed by a US entity, or a Canadian services subsidiary that performs no payment functions) avoids it. This is the single most important structuring decision for Scenario A.
- **Scenario B, Canadian users:**
  - FINTRAC MSB (if a Canadian entity) or FMSB registration.
  - RPAA PSP registration as a domestic or foreign PSP.
  - Securities: dealer/CTP registration, a pre-registration undertaking, or exemptive relief for offering custodial USDC.
  - Quebec MSBA licence(s) if Quebec residents are served.
  - Stablecoin Act issuer-side constraints on USDC from about fall 2027.
  - Bank Act s.983 marketing restrictions; Law 25 if Quebec residents are served.
  - The US partner would separately need FMSB registration (and probably RPAA registration) to serve Canadians. US ACH does not serve Canadian bank accounts, so a Canadian fiat rail partner would be needed. That last point is an inference; Canadian rails were not researched.

### Gaps
- No official source squarely says whether remote employees of a foreign company create an MSB or PSP "place of business"; the guidance only lists "employees" generically.
- Cost and timeline for CTP registration were not found (see section 4).

---

## 1. FINTRAC MSB registration and AML compliance programme

### Takeaway
Anyone with a Canadian place of business that transfers virtual currency or remits funds as a business is an MSB and must register with FINTRAC before operating, even if every client is outside Canada. Registration is free and takes about 3 months. A foreign firm serving Canadians registers as an FMSB with a Canadian-resident agent for service. Registration brings a five-part compliance programme, KYC, the travel rule, LVCTR/EFTR/STR reporting, and ministerial directives. Penalties rose about 40-fold on 2026-03-26 (Bill C-12).

### Cited Findings
**Who must register**
- An MSB has a place of business in Canada (incorporation, physical location, or employees/agents/branches) and offers at least one MSB service. "Client location does not determine MSB status." — [FINTRAC MSB page](https://fintrac-canafe.canada.ca/msb-esm/msb-eng) (fetched)
- Dealing in virtual currency (VC) covers two things. VC exchange: funds to VC, VC to funds, or VC to VC. VC transfer: moving VC at a client's request, or receiving VC for remittance to a beneficiary. — [FINTRAC MSB page](https://fintrac-canafe.canada.ca/msb-esm/msb-eng) (fetched)
- Payment services count. FINTRAC treats invoice-payment services and payment services for goods or services as remitting/transmitting funds or dealing in VC, with narrow exceptions: receiving payments for a payee to settle a debt without forwarding instructions, accepting payment for one's own goods, or providing hardware only. — [FINTRAC MSB page](https://fintrac-canafe.canada.ca/msb-esm/msb-eng) (fetched)
- FMSB = no Canadian place of business, plus services directed at, and provided to, clients in Canada.
  - "Directing" includes marketing aimed at Canada, a ".ca" domain, or a Canadian business-directory listing.
  - A client is "in Canada" if their address is in Canada, their ID is Canadian government-issued, or their banking, card or payment service is Canada-based.
  - Source: [FINTRAC MSB page](https://fintrac-canafe.canada.ca/msb-esm/msb-eng); [FINTRAC registration page](https://fintrac-canafe.canada.ca/msb-esm/register-inscrire/reg-ins-eng) (both fetched)
- Register before operating. A provincial licence (for example, Quebec) does not replace FINTRAC registration. — [FINTRAC registration page](https://fintrac-canafe.canada.ca/msb-esm/register-inscrire/reg-ins-eng) (fetched)
- FINTRAC issues no licence or certificate; status appears on the public MSB Registry, updated monthly. — [FINTRAC MSB Registry](https://fintrac-canafe.canada.ca/msb-esm/reg-eng) (search summary)

**What the application needs**
- Information:
  - bank account information
  - compliance officer details
  - number of employees
  - incorporation information
  - names and dates of birth of owners and senior management
  - estimated annual transaction value per service
  - details of every location
  - for MSBs, every agent or mandatary
  - for FMSBs, a representative for service who resides in Canada
  - Source: [FINTRAC registration page](https://fintrac-canafe.canada.ca/msb-esm/register-inscrire/reg-ins-eng) (fetched)
- Supporting documents:
  - Criminal record checks for the CEO, president, directors, and anyone owning or controlling 20% or more. Each must come from a competent authority in the person's country of residence, be no more than 6 months old, and have a certified translation if not in English or French.
  - Certificate of incorporation and an ownership/control/structure document.
  - Source: [FINTRAC registration page](https://fintrac-canafe.canada.ca/msb-esm/register-inscrire/reg-ins-eng) (fetched)
- Process: submit a pre-registration request form; a FINTRAC officer sends the registration form; submit through the Secure Document Transfer link, which expires after 15 days. — [FINTRAC registration page](https://fintrac-canafe.canada.ca/msb-esm/register-inscrire/reg-ins-eng) (fetched)

**Cost, timeline and renewal**
- Cost: "FINTRAC does not charge registration fees." — [FINTRAC registration page](https://fintrac-canafe.canada.ca/msb-esm/register-inscrire/reg-ins-eng) (fetched)
- Timeline: most complete applications are processed within 3 months; complex ones take longer; incomplete ones are closed. — [FINTRAC registration page](https://fintrac-canafe.canada.ca/msb-esm/register-inscrire/reg-ins-eng) (fetched)
- FINTRAC can deny or revoke registration if a business is ineligible or does not answer a clarification request within 30 days. — [FINTRAC MSB Registry / revoked list](https://fintrac-canafe.canada.ca/msb-esm/revoked-revoquee-eng) (search summary)
- Renewal: FINTRAC registration renews every two years. — [Norton Rose Fulbright, "MSBs: Don't forget Québec's specific requirements"](https://www.nortonrosefulbright.com/en/knowledge/publications/f99b4747/money-services-businesses-don-t-forget-quebec-s-specific-requirements) (fetched). FINTRAC's own page only says "renew as required".

**Mandatory compliance programme** (source: [FINTRAC, Compliance program requirements (modified 2024-10-11)](https://fintrac-canafe.canada.ca/guidance-directives/compliance-conformite/Guide4/4-eng), fetched)
1. A compliance officer with the authority and resources to run the programme.
2. Written, up-to-date policies and procedures approved by a senior officer. They must cover KYC, business relationships and ongoing monitoring, record keeping, reporting, the **travel rule** (including when to suspend or reject transfers that lack required information), and **ministerial directives**.
3. A documented ML/TF/sanctions-evasion **risk assessment**. It covers clients, products and delivery channels, geography, affiliates, new technologies (assessed before adoption), and the National Risk Assessment. High risk requires enhanced measures.
4. A written, ongoing **training programme and training plan**, with records.
5. A **two-year effectiveness review**: started no later than 24 months after the previous one began, with a documented plan, done by an internal or external auditor (or by the entity itself if it has none), and findings reported in writing to a senior officer within 30 days.

**Reporting and other obligations**
- MSB/FMSB obligations: KYC (identity verification, beneficial ownership, third-party determination, PEP/HIO determination), STRs, Listed Person or Entity Property Reports, Large Cash Transaction Reports, **Large Virtual Currency Transaction Reports (LVCTR)**, Electronic Funds Transfer Reports, the 24-hour aggregation rule for LCTR/LVCTR/EFTR, record keeping, the **travel rule** for EFTs and VC transfers, and ministerial directives. — [FINTRAC MSB page](https://fintrac-canafe.canada.ca/msb-esm/msb-eng) (fetched)
- LVCTR threshold: receipt of VC worth C$10,000 or more (single transaction, or aggregated under the 24-hour rule). — [FINTRAC MSB page](https://fintrac-canafe.canada.ca/msb-esm/msb-eng) (fetched); [FINTRAC LVCTR guidance](https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/lvctr/lvctr-eng) (search summary)
- An FMSB must keep an LVCT record when it receives C$10,000 or more in VC from a person or entity in Canada. — [FINTRAC (search summary)](https://fintrac-canafe.canada.ca/msb-esm/intro-eng11)
- The C$1,000 threshold applies to VC exchange-ticket records. — [FINTRAC MSB page](https://fintrac-canafe.canada.ca/msb-esm/msb-eng) (fetched)
- Travel-rule records for VC transfers are tied to C$1,000 or more. This is a secondary source; confirm against FINTRAC's travel-rule guidance. — [CryptoSlate profile](https://cryptoslate.com/crypto-laws/fintrac-virtual-currency-travel-rule/) (search summary)
- Ministerial directives (Minister of Finance):
  - **Russia**: issued 2024-02-24, updated 2025-03-22.
  - **Iran**: issued 2020-07-25, updated 2025-11-17.
  - **DPRK**: issued 2017-12-09, updated 2025-03-22.
  - Under the Russia directive, EFT and VC transfer information must be kept for transfers **of any amount** to or from Russia, even below C$1,000.
  - All Iran-linked transactions must be treated as high risk.
  - Source: [FINTRAC, Ministerial directives](https://fintrac-canafe.canada.ca/obligations/directives-eng); [Russia directive](https://fintrac-canafe.canada.ca/obligations/dir-rus-eng); [Iran directive](https://fintrac-canafe.canada.ca/obligations/dir-iri-eng) (search summary)
- Agents and mandataries: an MSB must verify eligibility and obtain criminal record checks before engaging one, and again within 30 days after the second anniversary of the most recent review. — [FINTRAC MSB page](https://fintrac-canafe.canada.ca/msb-esm/msb-eng) (fetched)

**Penalties and 2026 legislative changes**
- **Bill C-12** (Strengthening Canada's Immigration System and Borders Act) received Royal Assent and came into force on **2026-03-26**. Source for all points in this list: [DLA Piper, 30 Mar 2026](https://www.dlapiper.com/en-us/insights/publications/2026/03/canada-aml-update-three-bills-make-major-amendments-to-the-pcmltfa) (fetched)
  - AMP maximum: **C$4M per violation for a person, C$20M for an entity**.
  - Per-notice cap: the greater of C$4M/C$20M or **3% of prior-year gross global revenue**, measured across the affiliated group.
  - **Compliance agreements are mandatory** after a violation.
  - Breaching a compliance order carries at least C$5M (person) or C$30M (entity), or 3% of global revenue.
  - New "very serious" violation: a compliance programme that is not "reasonably designed, risk-based and effective".
  - Criminal fines go up to C$20M on indictment for reporting offences, plus a new offence for misleading FINTRAC.
- About a 40-fold AMP increase; violations that occurred entirely before 2026-03-26 stay under the old penalty policy. — [Blakes](https://www.blakes.com/insights/canada-s-new-anti-money-laundering-legislation-significantly-raises-penalties-and-adds-new-violation/); [BLG, Apr 2026](https://www.blg.com/en/insights/2026/04/preparing-for-universal-enrolment-higher-penalties-and-fintrac-enforcement) (search summary)
- New **FINTRAC enrolment** duty for PCMLTFA s.5 entities: renew periodically and report changes within 30 days. Paragraphs 5(h), 5(h.1) and 5(m) are excepted. — [DLA Piper](https://www.dlapiper.com/en-us/insights/publications/2026/03/canada-aml-update-three-bills-make-major-amendments-to-the-pcmltfa) (fetched)
- **Bill C-2** (Strong Borders Act) was still pending at second reading as of March 2026. It would add a cash-acceptance ban at C$10,000 or more and strengthen the anonymous-account ban. — [DLA Piper](https://www.dlapiper.com/en-us/insights/publications/2026/03/canada-aml-update-three-bills-make-major-amendments-to-the-pcmltfa) (fetched)
- The Stablecoin Act s.5 deems stablecoin **issuers** to be dealers in virtual currency under the PCMLTFA. — [Torys, May 2026](https://www.torys.com/our-latest-thinking/publications/2026/05/canadas-stablecoin-act) (fetched)

### Inferences
- **Scenario A:** a Canadian-incorporated operator, or one with Canadian employees, that signs USDC sends on client instruction is very likely an MSB "dealing in virtual currency (transfer)" even with only US clients. It would carry the full compliance programme in parallel with US BSA obligations.
  - The "agent of a registered MSB" route does not obviously help. The US partner is not FINTRAC-registered when no Canadian clients are served.
  - Counsel should decide who is the MSB when the app holds the keys but a US licensed money transmitter moves the fiat.
- **Enrolment:** paragraphs 5(h) and 5(h.1) are, I believe, MSBs and FMSBs (which already register), so the new enrolment duty likely does not add a separate filing. Confirm against the PCMLTFA text.
- **Budget:** registration costs nothing, but realistic costs are the compliance officer, written programme, risk assessment, training, effectiveness review (internal or external), blockchain analytics for travel rule/LVCTR, and criminal record checks for directors and 20%+ owners. No authoritative cost figures were found.

### Gaps
- FINTRAC's list of ineligibility criteria (on a separate page) was not retrieved.
- The exact paragraph references in PCMLTFA s.5 for the enrolment exceptions were not verified.
- The official FINTRAC travel-rule page (threshold and data fields for VC transfers) was not fetched. The C$1,000 figure is from a secondary source.
- The current status of Bill C-2 (as of Nov 2026) is unknown.
- When the enrolment provisions apply in practice depends on regulations, which were not verified.

---

## 2. Retail Payment Activities Act (RPAA): PSP registration with the Bank of Canada

### Takeaway
The RPAA has been fully in force since **2025-09-08**. A PSP with any Canadian place of business must register before performing retail payment activities, wherever its end users are. A foreign PSP registers only if it both serves end users in Canada and directs activities at Canada. Today the Act covers fiat EFTs only ("excluding digital currencies"). Bill C-15 (2026) added a sixth payment function (holding an end user's private key or tokenized payment instrument), not yet in force. Draft regulations (Oct 2026) would prescribe stablecoins as a covered "unit", targeting **fall 2027**, which would capture custodial USDC wallets squarely.

### Cited Findings
**Who is caught**
- s.4 applies to PSPs with a place of business in Canada. s.5 applies to PSPs without one that perform retail payment activities for end users in Canada **and** direct them at individuals or entities in Canada. — [RPAA (current to 2026-10-29)](https://laws-lois.justice.gc.ca/eng/acts/R-7.36/FullText.html) (fetched)
- "Place of business in Canada regardless of where their end users are or where they direct their services." — [Bank of Canada, Registration framework](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/supervisory-framework-registration/) (fetched)
- Place of business includes a home office, Canadian incorporation, or "employees, agents or mandataries in Canada". — [BoC Criteria (updated 2026-06-29)](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/retail-payments-supervision-supervisory-policies-and-guidelines/criteria-for-registering-payment-service-providers/) (fetched)
- Location of end users:
  - Canadians temporarily abroad are not "in Canada".
  - Location indicators: IP address, service address, Canadian localization.
  - "Directing" indicators: Canada-targeted marketing, a .ca domain, Canadian directory listings, Canadian agreements or representatives, CAD offerings, Canadian support.
  - Source: [BoC Criteria](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/retail-payments-supervision-supervisory-policies-and-guidelines/criteria-for-registering-payment-service-providers/) (fetched)
- Foreign PSPs must register even if they are not incorporated in Canada and not registered with FINTRAC as an FMSB. — [BoC Registration framework](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/supervisory-framework-registration/) (fetched)

**Definitions**
- PSP: performs payment functions "as a service or business activity that is not incidental to another service or business activity". — [RPAA s.2](https://laws-lois.justice.gc.ca/eng/acts/R-7.36/FullText.html) (fetched)
- Payment functions (s.2):
  - (a) providing or maintaining an account
  - (b) holding funds for an end user
  - (c) initiating an EFT at an end user's request
  - (d) authorizing, transmitting, receiving or facilitating an EFT instruction
  - (e) clearing and settlement
  - (f) **new, not in force:** maintaining an end user's "encrypted or tokenized payment instrument" or **private key**, added by 2026, c.3, s.604 (Bill C-15), no commencement date.
  - Source: [RPAA](https://laws-lois.justice.gc.ca/eng/acts/R-7.36/FullText.html) (fetched)
- Retail payment activity: a payment function for an EFT in Canadian dollars or another country's currency, "or using a unit meeting prescribed criteria". The Act does not define "funds". — [RPAA s.2](https://laws-lois.justice.gc.ca/eng/acts/R-7.36/FullText.html) (fetched)
- The Bank describes in-scope EFTs as "in Canadian or foreign currencies (excluding digital currencies)". — [BoC Registration framework](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/supervisory-framework-registration/) (fetched)

**Exclusions**
- s.6: single-merchant and group-of-merchant instruments; eligible financial contracts and prescribed securities transactions; ATM withdrawals; prescribed activities.
- s.7: payment functions performed through systems designated under the Payment Clearing and Settlement Act.
- s.8: transfers between affiliates where no other PSP is involved.
- s.9: banks, authorized foreign banks, certain credit unions, insurers, trust and loan companies, Payments Canada, and the Bank of Canada.
- **s.10:** agents or mandataries of a **registered** PSP acting within their authority and listed in its registration.
- "Incidental" is not an exclusion but part of the PSP definition.
- Source for all of the above: [RPAA](https://laws-lois.justice.gc.ca/eng/acts/R-7.36/FullText.html) (fetched)
- The registered PSP is liable for its agents. Third-party service providers, which are not agents, are **not** excluded. — [BoC Criteria](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/retail-payments-supervision-supervisory-policies-and-guidelines/criteria-for-registering-payment-service-providers/) (fetched)
- No crypto-specific exclusion exists. Stablecoins come in through the "prescribed unit" route (below), not through an exclusion.

**Dates**
- Registration fee effective 2024-11-01. — [BoC registration fee page](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/retail-payments-supervision-supervisory-policies-and-guidelines/registration-application-fee/) (fetched)
- Firms "planning to operate after September 8, 2025 should apply as soon as possible". Operating without an application may violate s.104 and lead to an AMP. — [BoC Registration framework](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/supervisory-framework-registration/) (fetched)
- PSPs have had to comply with obligations "as of fall 2025". — [FCAC Business Plan 2026–27](https://www.canada.ca/en/financial-consumer-agency/corporate/planning/business-plans/business-plan-2026-2027.html) (search summary)
- Registration must happen **before** performing any retail payment activity (s.23). Acquiring control of a registered PSP needs a new application (s.24). — [RPAA](https://laws-lois.justice.gc.ca/eng/acts/R-7.36/FullText.html) (fetched)

**Application contents**
- contacts, including third parties, agents, mandataries and affiliates
- business structure, ownership, debtholders and key staff
- payment functions performed or planned
- actual or projected values and volumes of end-user funds, and end-user counts **inside and outside Canada**
- safeguarding method
- whether a risk management and incident response framework exists or is planned
- existing FINTRAC and provincial registrations
- for foreign PSPs, agents in Canada
- Source: [BoC Registration framework](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/supervisory-framework-registration/) (fetched)

**Review process**
- **National security review** by the Minister of Finance: the Bank cannot register while a review is pending. The Minister can direct refusal, require undertakings, or impose conditions (ss.34–43). — [RPAA](https://laws-lois.justice.gc.ca/eng/acts/R-7.36/FullText.html) (fetched)
- Refusals can be challenged within 30 days; Bank review within 90 days; then the Federal Court. — [BoC Registration framework](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/supervisory-framework-registration/) (fetched)

**Fees**
- Registration application fee: **C$2,500** (2024), non-refundable, card payment through PSP Connect. Indexed annually to September CPI, and never decreasing. The Bank publishes a Fee Bulletin every December 1. — [BoC registration fee page (updated 2024-10-31)](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/retail-payments-supervision-supervisory-policies-and-guidelines/registration-application-fee/) (fetched)
- Plus an **annual assessment fee** scaled to each PSP's share of value and volume. — [BoC Registration framework](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/supervisory-framework-registration/) (fetched); [BoC fee approach](https://bankofcanada.ca/wp-content/uploads/2021/10/approach-fees.pdf) (search summary)

**Ongoing obligations**
- **Operational risk management and incident response framework** (s.17).
- Notify affected end users, PSPs and clearing houses "without delay" of incidents with a material impact (s.18).
- **Safeguarding** (s.20), using one of:
  - a trust account used for no other purpose
  - a prescribed account or method
  - a dedicated account backed by insurance or a guarantee at least equal to the funds held
  - no set-off is allowed against these funds
- **Annual report** (s.21), due by **March 31** of the following year.
- **Significant change or new activity notice** (s.22), at least **5 business days** in advance.
- Source: [RPAA](https://laws-lois.justice.gc.ca/eng/acts/R-7.36/FullText.html); [BoC Registration framework](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/supervisory-framework-registration/) (fetched); regulations at [SOR/2023-229](https://laws-lois.justice.gc.ca/eng/regulations/SOR-2023-229/page-4.html)

**Penalties**
- AMPs up to **C$10,000,000 per violation**, tiered minor/serious/very serious by regulation. Violations are not offences. — [RPAA s.101(1)(k), s.85](https://laws-lois.justice.gc.ca/eng/acts/R-7.36/FullText.html) (fetched)
- An AMP is halved if the party enters a compliance agreement. — [BoC Registration framework](https://www.bankofcanada.ca/core-functions/retail-payments-supervision/supervisory-framework-registration/) (fetched)

**Stablecoin expansion (pending)**
- Proposed amendments to the Retail Payment Activities Regulations would prescribe stablecoins as an RPAA unit, "bringing PSPs such as custodial wallets and crypto payment processors into Bank of Canada supervision".
- The private-key function (f) needs a separate Governor in Council order.
- The government estimates about **30 new PSPs** in scope, at about **C$152,127 per PSP per year** in compliance cost.
- Source: [Canada Gazette I, 2026-10-24](https://gazette.gc.ca/rp-pr/p1/2026/2026-10-24/html/reg1-eng.html) (fetched)
- "Prescribed stablecoins" would be those from issuers on the Bank of Canada registry, plus certain financial institutions under federal, provincial or **foreign regimes "substantially similar"** to the Stablecoin Act. Other provisions:
  - PSPs holding stablecoins must keep written safeguarding frameworks, independently reviewed every 3 years and reported annually.
  - New option: hold through a separate sole-purpose, insolvency-protected entity.
  - PSPs must notify issuers of material incidents and report stablecoin EFT value and volume.
  - Expanded ownership and governance disclosures for **all** PSP applicants.
  - Businesses whose only Canadian payment activity is in stablecoins "may be captured for the first time".
  - Source: [BLG, 2026-11-04](https://www.blg.com/en/insights/2026/11/stablecoin-era-canada-proposes-stablecoin-regulations-and-expands-the-payment-regulatory-framework) (fetched)
- Consultation closes **2026-12-23**; the regime targets **fall 2027**. — [BLG](https://www.blg.com/en/insights/2026/11/stablecoin-era-canada-proposes-stablecoin-regulations-and-expands-the-payment-regulatory-framework) (fetched)

### Inferences
- **Scenario A:** the RPAA reaches a Canada-based PSP even if every end user is in the US. Today only payment functions on fiat EFTs count: USD is "another country's currency", so the ACH deposit and withdrawal legs count; USDC legs do not.
  - If the Canadian entity maintains user accounts (function a) or initiates EFTs on user request through the US partner (function c), it is probably in scope.
  - The s.10 agent exclusion is available only if the principal is itself RPAA-registered. A US partner serving only US users would not be.
  - From about fall 2027, with stablecoins prescribed and function (f) in force, a Canadian-based operator holding users' USDC keys would almost certainly be a PSP even with US-only users. That would bring a safeguarding framework for USDC, an operational-risk framework, and annual reporting.
  - Counsel must decide whether internal book-entry transfers of USDC (not fiat) and the fiat legs run by the US partner are "performed by" the Canadian entity.
- **Scenario B:** the same analysis applies as a foreign PSP if there is no Canadian presence. CAD fiat legs are in scope now and stablecoin legs from about 2027.
- **Budget (inference):** the C$2,500-plus-CPI application fee, an annual assessment fee (amount not found), and the Gazette's roughly C$152k per year compliance-cost estimate for newly captured stablecoin PSPs. Safeguarding requires a Canadian-acceptable trust or insured account arrangement, or the new sole-purpose entity.

### Gaps
- I could not confirm the original Nov 1–15, 2024 registration window from a fetched source. Only the 2024-11-01 fee date and the 2025-09-08 operating date were confirmed.
- The 2025/2026/2027 CPI-indexed registration fee amounts and the annual assessment fee formula and amounts were not found.
- AMP amounts per tier (minor/serious/very serious) were not retrieved.
- The prescribed national-security review periods under the RPAA were not retrieved.
- The number of PSPs registered, refused or revoked since 2025 was not found.

---

## 3. Quebec: Money-Services Businesses Act (MSBA) licence

### Takeaway
Quebec requires a provincial MSB licence on top of FINTRAC registration for anyone carrying on money-services business in Quebec, which can include online service to Quebec customers without a Quebec office. Since 2021 the licence has been administered by **Revenu Québec**, not the AMF; the move went **from** the AMF **to** Revenu Québec. A platform that takes CAD and lets users buy, sell or exchange crypto is treated as needing both the currency-exchange and funds-transfer classes. Each covered person needs a Sûreté du Québec security clearance. The licence runs on an annual April-to-March cycle, with a target of about 50 days to process.

### Cited Findings
**Administration**
- Revenu Québec administers the MSBA; administration moved from the AMF to Revenu Québec in **2021**. — [Norton Rose Fulbright](https://www.nortonrosefulbright.com/en/knowledge/publications/f99b4747/money-services-businesses-don-t-forget-quebec-s-specific-requirements) (fetched)
- A secondary source dates the handover to **2021-09-13**. — [Coincub](https://coincub.com/blog/quebec-msb-license-revenu-quebec-and-amf-requirements-and-costs/) (search summary)
- The consolidated Act (updated to 2025-10-24) says licences "are issued by the **Minister**" (of Revenue); older consolidations said the AMF. — [CQLR c. E-12.000001](https://www.legisquebec.gouv.qc.ca/en/pdf/cs/E-12.000001.pdf) (search summary; direct fetch blocked)

**Who needs a licence**
- No Quebec employees or establishment is generally required: "simply carrying on business there, such as having customers or carrying out transactions in Quebec, may trigger the licence requirement". — [NRF](https://www.nortonrosefulbright.com/en/knowledge/publications/f99b4747/money-services-businesses-don-t-forget-quebec-s-specific-requirements) (fetched)
- Licence classes:
  - currency exchange
  - funds transfer
  - traveller's cheques and money orders
  - cheque cashing
  - ATMs
  - **cryptoasset ATMs**, the sixth class, added from **2025-04-01**
  - Source: [Coincub](https://coincub.com/blog/quebec-msb-license-revenu-quebec-and-amf-requirements-and-costs/); [Gazette officielle 2024 fee-regulation amendment](https://www.publicationsduquebec.gouv.qc.ca/fileadmin/gazette/pdf_encrypte/lois_reglements/2024A/107032.pdf) (search summary)
- Revenu Québec says a service to buy, sell or exchange cryptoassets is not, by itself, a money service (cryptoassets are not legal tender). But a platform that lets users deposit CAD, buy cryptoassets and resell them for another currency offers currency exchange **and** funds transfer and needs a licence for both. — [Revenu Québec, Cryptoasset Services](https://www.revenuquebec.ca/en/businesses/sector-specific-measures/money-services-businesses-msbs/cryptoasset-services/) (search summary; direct fetch blocked)

**Security clearance**
- Done by the Sûreté du Québec and local police; covers criminal record and "moral standards".
- Applies to shareholders, directors, officers, and employees whose duties relate directly to money services, including some staff living outside Quebec.
- The licence's "respondent" must be a director, officer or partner (with an exception for certain non-Quebec MSBs).
- Source: [NRF](https://www.nortonrosefulbright.com/en/knowledge/publications/f99b4747/money-services-businesses-don-t-forget-quebec-s-specific-requirements) (fetched)

**Term, timeline and ongoing duties**
- Licences are renewed annually (licence year April 1 to March 31).
- Target processing time about 50 days, with about 90% decided in that window. Security clearance takes about 30 days per a secondary source.
- Changes must be reported within 15 days after the end of the month in which they happen; non-money-services employee information by March 31 each year.
- Source: [NRF](https://www.nortonrosefulbright.com/en/knowledge/publications/f99b4747/money-services-businesses-don-t-forget-quebec-s-specific-requirements) (fetched); [Coincub](https://coincub.com/blog/quebec-msb-license-revenu-quebec-and-amf-requirements-and-costs/) (search summary)

**Fees**
- C$788 per licence class for currency exchange, and C$147 per person for security clearance, in an older regulation version. — [CQLR c. E-12.000001, r. 2](https://www.legisquebec.gouv.qc.ca/en/document/cr/E-12.000001,%20r.%202) (search summary)
- Revenu Québec's current schedule lists a clearance report fee of **C$149 (2025–26)** and **C$163 (2026–27)** per person. — [Revenu Québec, List of fees and tariffs](https://www.revenuquebec.ca/en/businesses/sector-specific-measures/money-services-businesses-msbs/list-of-fees-and-tariffs/) (search summary)

**Penalties**
- Operating without a licence, or failing to report changes, is an offence with significant fines, and respondents may be personally liable. Amounts were not stated. — [NRF](https://www.nortonrosefulbright.com/en/knowledge/publications/f99b4747/money-services-businesses-don-t-forget-quebec-s-specific-requirements) (fetched)

**The AMF's separate securities role**
- The AMF still regulates crypto trading platforms under Quebec securities law. It obtained a C$2M penalty against CoinEx in 2023 for unregistered dealing with Quebec residents. — [Coincub](https://coincub.com/blog/quebec-msb-license-revenu-quebec-and-amf-requirements-and-costs/) (search summary)

### Inferences
- **Scenario A** (no Quebec customers): no Quebec licence, unless staff are in Quebec and counsel reads the MSBA as reaching a Quebec-based business serving foreign clients. NRF does not address that case.
- **Scenario B:** if Quebec residents can deposit CAD or fiat that becomes USDC and send it on, expect both the **currency exchange and funds transfer** classes. Every shareholder, director, officer and money-services employee goes through SQ clearance. This adds roughly 2 months, plus annual renewal, on top of FINTRAC.
- Geo-blocking Quebec at launch is a common way to defer this licence and Law 25 (an inference, not a sourced industry statistic).

### Gaps
- The current official per-class licence fees for 2026–27 were not confirmed; the C$788 figure may be stale.
- Fine amounts for unlicensed operation were not found.
- Whether the MSBA reaches a Quebec-based firm serving only non-Quebec clients was not addressed by any source.
- The Revenu Québec and LégisQuébec pages could not be fetched directly (HTTP 403/502), so verify all Quebec specifics there.

---

## 4. Securities law: CSA rules for crypto trading platforms (CTPs) and value-referenced crypto assets (VRCAs, i.e. stablecoins)

### Takeaway
CSA staff treat a custodial platform as dealing in securities or derivatives ("crypto contracts") when users get only a contractual claim rather than immediate delivery. They also treat fiat-backed stablecoins themselves (VRCAs) as potentially securities or derivatives. Offering Canadians custodial USDC therefore points to dealer registration as a CTP, a pre-registration undertaking, or case-specific exemptive relief. USDC remains on the CSA's VRCA list (Circle undertaking dated 2024-12-03; list refreshed 2026-11-02). The federal Stablecoin Act does **not** displace provincial securities law.

### Cited Findings
**The custody analysis**
- CSA Staff Notice 21-327 (2020-01-16) says a custodial platform that gives users only a contractual right or claim to a crypto asset, instead of immediate delivery, is generally trading securities or derivatives.
  - Immediate delivery means ownership, possession and control move to the user with no retained platform interest.
  - **A book entry alone is not delivery.**
  - There is no bright-line test.
  - Source: [CSA SN 21-327 (ASC copy)](https://asc.ca/-/media/ASC-Documents-part-1/Regulatory-Instruments/2020/01/5795238-_-CSA-Staff-Notice-21-327.pdf); [CSA news release](https://www.securities-administrators.ca/aboutcsa.aspx?id=1862) (search summary)
- SN 21-332 says VRCAs may be securities and/or derivatives. Under SN 21-333, registered CTPs (and those with pre-registration undertakings) may, with regulatory consent, let clients buy or deposit specified stablecoins whose issuer has filed an acceptable undertaking. Outside that framework, a firm trading stablecoins generally must register as a dealer or not trade. — [Cassels](https://cassels.com/our-insights/stablecoins-different-route-osc-grants-exemptive-relief-from-registration-for-stablecoin-trading/); [BLG, 2026-11-04](https://www.blg.com/en/insights/2026/11/stablecoin-era-canada-proposes-stablecoin-regulations-and-expands-the-payment-regulatory-framework) (fetched)

**The current VRCA list**
- Three issuer undertakings are listed: **Circle Internet Financial (USDC)**, QCAD Digital Trust (QCAD) and CADC Reserve Trust (CADC). The list was refreshed **2026-11-02**. — [CSA, Crypto undertakings](https://www.securities-administrators.ca/crypto-platforms-regulation-and-enforcement-actions/crypto-undertakings/#VRCA) (search summary; direct fetch blocked)
- Circle's undertaking is dated 2024-12-03. Circle acknowledges the CSA staff position but does not consider USDC a security or derivative. — [OSC, Circle undertaking](https://www.osc.ca/sites/default/files/2024-12/vrca_20241203_circle-internet-financial_0.pdf) (search summary)
- An undertaking is not CSA approval or endorsement. The CTP remains responsible for know-your-product. — [OSC, Crypto businesses](https://www.osc.ca/en/industry/registration-and-compliance/crypto-businesses) (search summary)
- Stablecoins without compliant undertakings had to be delisted from Canadian CTPs by the CSA's **2025-12-31** deadline. — [Cointelegraph, Dec 2025](https://cointelegraph.com/news/circles-usdc-becomes-first-compliant-stablecoin-under-new-canada-rules) (search summary)
- Commentators say the regime left USDC as the only fiat-backed stablecoin listed on Canadian CTPs, with heavy burden on CAD tokens. — [McCarthy Tétrault](https://www.mccarthy.ca/en/insights/blogs/techlex/canadian-crypto-outlook-progress-or-standstill) (search summary)

**Exemptive-relief precedents**
- The OSC granted **zerohash LLC** (US-based) relief on **2026-07-30** to run an immediate-delivery stablecoin trading platform for Canadians without dealer registration.
  - No credit or margin.
  - Quarterly reporting on trading, complaints, fraud and cyber events.
  - Pays fees as if registered.
  - Relief **expires after 4 years**.
  - Described as case-specific, not a general exemption.
  - Source: [Cassels](https://cassels.com/our-insights/stablecoins-different-route-osc-grants-exemptive-relief-from-registration-for-stablecoin-trading/) (fetched); [OSC decision](https://www.osc.ca/en/securities-law/orders-rulings-decisions/zerohash-llc)
- **Paytrie AB Inc.** also received immediate-delivery dealer relief for "Specified VRCAs". Immediate delivery "does not resolve the underlying securities treatment". — [BLG](https://www.blg.com/en/insights/2026/11/stablecoin-era-canada-proposes-stablecoin-regulations-and-expands-the-payment-regulatory-framework) (fetched)

**Federal–provincial split**
- The Department of Finance policy paper says securities regulators will oversee stablecoin **trading**, and the Bank of Canada will supervise **payment functions** under the RPAA once amended. — [Cassels](https://cassels.com/our-insights/stablecoins-different-route-osc-grants-exemptive-relief-from-registration-for-stablecoin-trading/) (fetched)
- BLG: "Issuers and intermediaries should not assume Bank of Canada registration satisfies distribution or trading requirements". The CSA has given no sign it will stop treating stablecoins as securities. — [BLG](https://www.blg.com/en/insights/2026/11/stablecoin-era-canada-proposes-stablecoin-regulations-and-expands-the-payment-regulatory-framework) (fetched)
- The Gazette notes the RPAA exempts payment functions that give effect to securities transactions, and that "substantially similar" provincial frameworks may qualify for exemption under Stablecoin Act s.14. — [Canada Gazette I](https://gazette.gc.ca/rp-pr/p1/2026/2026-10-24/html/reg1-eng.html) (fetched)

**Firms located in Canada serving foreign clients**
- OSC Rule 32-505 gives a conditional exemption for **US-registered** broker-dealers and advisers "servicing U.S. clients from Ontario". Its existence implies that serving foreign clients from Ontario can otherwise trigger Ontario registration. — [OSC Rule 32-505 Companion Policy](https://www.osc.ca/sites/default/files/pdfs/irps/rule_20150528_32-505_cp-broker-dealers-advisers.pdf) (search summary)

### Inferences
- **Scenario B:** the app holds the only signing key and users hold balances by book entry. That is the custodial "contractual claim" model, not immediate delivery. Facilitating fiat-to-USDC conversion and holding USDC for Canadians therefore likely engages provincial securities law as trading in crypto contracts, on top of USDC's own VRCA status.
  - Realistic paths: (i) register as a CTP (restricted or investment dealer, with CIRO membership for marketplace models) or sign a pre-registration undertaking; (ii) partner with an already-registered Canadian CTP and white-label it; (iii) seek case-specific relief. The zerohash and Paytrie precedents are immediate-delivery models, which a custodial design would not fit.
  - Counsel must decide whether a payments-only wallet (no trading or price exposure, USDC used as a payment medium) still "trades".
- **Scenario A:** if Canadian staff in Ontario (or another province) operate a custodial crypto-contract business for US clients, there is a residual risk of "trading from" the province. Rule 32-505 covers only US-registered broker-dealers or advisers, which this product is not. Counsel should assess this; it is often overlooked.
- USDC is presently the most "Canada-ready" stablecoin from the securities side, but its post-2027 status also depends on the Stablecoin Act (section 5).

### Gaps
- The time and cost to register as a CTP, or to sign a pre-registration undertaking, were not found.
- Whether any CSA guidance specifically addresses custodial payment wallets (as opposed to trading platforms) holding VRCAs was not found.
- The current CSA undertakings page and the full SN 21-333 terms could not be fetched directly (HTTP 403).
- Whether CSA staff view a Canada-based operator serving only US clients as requiring registration in the home province was not confirmed beyond the Rule 32-505 inference.

---

## 5. Federal Stablecoin Act (Budget 2025): status at Nov 2026 and effect on distributors and wallets

### Takeaway
The Stablecoin Act was enacted through Bill C-15 (Budget 2025 Implementation Act, No. 1), with **Royal Assent on 2026-03-26**. It is **not in force**. Draft Stablecoin Regulations were prepublished on **2026-10-24**; comments close **2026-12-23**; the target is **fall 2027**. The Act regulates **issuers**, not wallets: wallets and payment apps are caught through the RPAA amendments (section 2), and issuers are deemed VC dealers for AML. For a USDC wallet, the key risks are (a) whether Circle registers with the Bank of Canada or obtains an exemption, so that USDC remains offerable and is a "prescribed" RPAA unit, and (b) the ban on yield, including yield paid "through intermediaries".

### Cited Findings
**Status**
- Enacted when Bill C-15 received Royal Assent on **2026-03-26**. — [DLA Piper, Apr 2026](https://www.dlapiper.com/en/insights/publications/2026/04/canada-enacts-framework-to-regulate-stablecoin-in-bill-c15); [Torys, May 2026](https://www.torys.com/our-latest-thinking/publications/2026/05/canadas-stablecoin-act) (Torys fetched)
- The regulations and the Act take effect on dates set by Governor in Council order, with the stated intention of **fall 2027**. — [Canada Gazette I, 2026-10-24](https://gazette.gc.ca/rp-pr/p1/2026/2026-10-24/html/reg1-eng.html) (fetched)
- Consultation closes **2026-12-23**. — [BLG](https://www.blg.com/en/insights/2026/11/stablecoin-era-canada-proposes-stablecoin-regulations-and-expands-the-payment-regulatory-framework) (fetched)

**Scope and issuer obligations**
- Covers fiat-backed payment stablecoins. Excludes CBDCs, tokenized deposits, yield-bearing and deposit-insured coins, closed-loop coins, and issuers that are federal financial institutions or central banks. — [Torys](https://www.torys.com/our-latest-thinking/publications/2026/05/canadas-stablecoin-act) (fetched)
- "Issue" means creating a stablecoin and making it available for purchase, directly or indirectly, by a person in Canada. Foreign issuers are covered. — [Canada Gazette I](https://gazette.gc.ca/rp-pr/p1/2026/2026-10-24/html/reg1-eng.html) (fetched)
- Issuer duties (source: [Canada Gazette I](https://gazette.gc.ca/rp-pr/p1/2026/2026-10-24/html/reg1-eng.html), fetched):
  - Register with the Bank of Canada, including a national-security review.
  - Hold 1:1 daily reserves in demand deposits, government debt with 3 months or less to maturity, one-day reverse repos, or eligible money market funds.
  - Use a **Canadian-incorporated qualified custodian** with segregated, bankruptcy-remote accounts.
  - Redeem at par with no minimum, within 3 business days, with fees capped at **1%**.
  - Publish English and French policy summaries; acknowledge complaints within 7 days and resolve within 30.
  - File monthly reports with an accountant's opinion.
  - Penalties up to **C$1M (serious) / C$10M (very serious)**.
- Annual issuer fees: C$750k base (≥C$1B outstanding), C$350k (≥C$500M), C$25k (<C$500M). — [Canada Gazette I](https://gazette.gc.ca/rp-pr/p1/2026/2026-10-24/html/reg1-eng.html) (fetched)
- Foreign issuers can be exempted under **s.14** where a "substantially similar" foreign framework applies. Transition: existing issuers keep issuing if they apply within **30 days** of coming into force. — [Canada Gazette I](https://gazette.gc.ca/rp-pr/p1/2026/2026-10-24/html/reg1-eng.html); [BLG](https://www.blg.com/en/insights/2026/11/stablecoin-era-canada-proposes-stablecoin-regulations-and-expands-the-payment-regulatory-framework) (fetched)

**What reaches distributors, platforms and wallets**
- Issuers must report their distributors, CTPs and peer-to-peer exchanges monthly. "The SCA itself does not impose the issuer obligations on them." Wallets and payment providers fall under the RPAA. — [Canada Gazette I](https://gazette.gc.ca/rp-pr/p1/2026/2026-10-24/html/reg1-eng.html) (fetched)
- **Yield ban:** issuers may not pay interest or yield tied to *holding* a stablecoin, "directly or through intermediaries". Rewards tied to *using* a stablecoin are permitted. Nobody may represent a stablecoin as legal tender, a deposit, insured, or government-guaranteed. — [BLG](https://www.blg.com/en/insights/2026/11/stablecoin-era-canada-proposes-stablecoin-regulations-and-expands-the-payment-regulatory-framework); [Canada Gazette I](https://gazette.gc.ca/rp-pr/p1/2026/2026-10-24/html/reg1-eng.html) (fetched)
- Stablecoin Act s.5 deems issuers to be dealers in virtual currency under the PCMLTFA. Bill C-15's RPAA amendments add the private-key payment function, likely capturing custodial wallet providers. — [Torys](https://www.torys.com/our-latest-thinking/publications/2026/05/canadas-stablecoin-act) (fetched)
- The Gazette's cost analysis lists USDC among assumed market participants, but no text confirms USDC's post-2027 status. — [Canada Gazette I](https://gazette.gc.ca/rp-pr/p1/2026/2026-10-24/html/reg1-eng.html) (fetched)

### Inferences
- From about fall 2027, USDC's availability to Canadians depends on Circle (i) registering and using a Canadian-incorporated custodian, (ii) getting a s.14 "substantially similar" exemption (the US GENIUS Act regime is the obvious candidate, but no source confirms it), or (iii) qualifying as a prescribed stablecoin through a financial-institution route. A Canadian-user rollout should be timed against this.
- Any "rewards on balance" feature for Canadian users risks being treated as yield paid through an intermediary. Use-based rewards (for example, per transaction) are explicitly allowed.
- Canadian marketing must not call USDC a "deposit", "insured" or "legal tender" (this aligns with the not-FDIC-insured copy guardrail).

### Gaps
- Whether Circle has applied, or intends to apply, for registration or a s.14 exemption is unknown.
- Whether the US GENIUS Act regime will be deemed "substantially similar" is unknown.
- The final regulations are pending; content may change after the 2026-12-23 comment deadline.
- The Budget 2025 announcement details (for example, Bank of Canada funding) were not separately verified.

---

## 6. Use of "bank" (Bank Act s.983), and FCAC/OSFI consumer-protection expectations

### Takeaway
Bank Act s.983 makes it an offence for a non-bank to use "bank", "banker" or "banking" in a name, **domain name** or identifying mark, or to describe its business, products or services (or how they are obtained) "in Canada". Any language and "substantially similar" forms are covered. OSFI's advisory specifically lists "Mobile Banking" and "For all your banking needs" as off-limits. There is no FCAC market-conduct regime for non-bank payment apps; FCAC supervises federally regulated FIs.

### Cited Findings
**The rule**
- s.983(2): a non-bank entity may not take, adopt or keep a name, **domain name** or identifying mark containing "bank", "banker" or "banking" to describe a business in Canada. — [Bank Act s.983 (current to 2026-10-29; last amended 2026-10-16)](https://laws-lois.justice.gc.ca/eng/acts/B-1.01/section-983.html) (fetched)
- s.983(2.1)/(2.11): non-bank persons may not use these words to describe their business, its products or services, or how they are obtained, nor cause or authorize others to do so.
- s.983(2.3): stating an unauthorized connection, association or affiliation with a bank is prohibited.
- Words in **any language** and identifying marks (including trademarks) are covered (ss.13–15).
- Source for the three points above: [Bank Act s.983](https://laws-lois.justice.gc.ca/eng/acts/B-1.01/section-983.html) (fetched)

**Exceptions**
- (5.1) businesses not engaged in financial activities.
- (4.2)–(4.3) specified institutions (trust and loan companies, credit unions, ATB and others), subject to disclosure of entity type, regulator and deposit-insurance status.
- (5)–(11) bank subsidiaries and affiliates and foreign-bank names.
- (12) **Superintendent (OSFI) approval**, possibly with conditions.
- Source: [Bank Act s.983](https://laws-lois.justice.gc.ca/eng/acts/B-1.01/section-983.html) (fetched)

**OSFI interpretation and enforcement**
- OSFI Ruling 2004-08 reads "business" broadly (not limited to profit-making). Its purpose is to stop the public wrongly assuming they are dealing with a Canadian bank. It refused "merchant banking" for a financial-services firm. — [OSFI ruling](https://www.osfi-bsif.gc.ca/en/supervision/rulings/unauthorized-use-word-bank) (fetched)
- The 2017 OSFI advisory lists prohibited phrases including "Mobile Banking", "For all your banking needs" and "Own your own bank". An entity could face fines **up to C$5,000,000**. — [Mondaq summary of OSFI advisory](https://www.mondaq.com/canada/financial-services/609252/osfi-issues-advisory-on-use-of-words-bank-banker-banking); [Bennett Jones, 2017](https://www.bennettjones.com/insights/blogs/2017/07/if-youre-not-a-bank-stop-using-bank-words-to-describe-your-business-says-canadas-banking-regulator) (search summary)
- The 2017 enforcement push against credit unions led a 2019 Senate committee to recommend a practical solution rather than strict enforcement. — [Senate BANC Report 17](https://sencanada.ca/en/committees/BANC/Report/46766/42-1) (search summary)

**FCAC**
- FCAC supervises federally regulated financial entities, such as banks, for compliance with consumer-protection measures. — [FCAC, How FCAC protects consumers](https://www.canada.ca/en/financial-consumer-agency/corporate/about/protect.html) (search summary)
- FCAC's 2026–27 plan names "products that fall outside existing consumer protection frameworks" and a complex payments landscape as challenges. Oversight of the Consumer-Driven Banking Act (open banking) was slated to move to the Bank of Canada from **2026-04-01**. — [FCAC Business Plan 2026–27](https://www.canada.ca/en/financial-consumer-agency/corporate/planning/business-plans/business-plan-2026-2027.html) (search summary)

### Inferences
- In either scenario, the words "neobank", "banking", "mobile banking" or "bank" in the site, app, domain or marketing would be risky for a Canadian-based operator ("describe a business in Canada"), and plainly risky when marketing to Canadians.
  - "Neobank" likely counts as a word containing "bank". Counsel should confirm this.
  - In Scenario A, counsel must decide whether a Canadian-based company describing itself to US customers as a "neobank" is describing "a business in Canada". The conservative reading is yes.
  - Safer wording: "money app", "wallet", "account" (with care), "payments".
- A non-bank payment app does not fall under FCAC's federal consumer-protection framework. Consumer protection would come from provincial consumer-protection law, RPAA safeguarding and incident notification, the Stablecoin Act's marketing restrictions, and (for securities-regulated activity) the CSA and CIRO.

### Gaps
- No enforcement examples against fintechs or neobanks after 2017 were found.
- The penalty section of Bank Act Part XVII (s.980 and following) was not read directly; the C$5M figure comes from 2017 summaries.
- No FCAC guidance specific to non-bank payment apps was found.
- Provincial consumer-protection requirements for payment apps were not researched.

---

## 7. Corporate basics: federal (CBCA) vs provincial incorporation, ISC register, privacy (PIPEDA, Quebec Law 25)

### Takeaway
A federal CBCA corporation still needs at least **25% resident-Canadian directors** (at least one if there are fewer than four directors). It must keep a register of individuals with significant control (ISC) and, since **2024-01-22**, file it with Corporations Canada, which is now actively querying "no-ISC" filings. Law 25 adds privacy-officer, privacy-impact-assessment and cross-border-transfer duties if Quebec residents' data is handled. PIPEDA applies federally.

### Cited Findings
**CBCA**
- s.105(3): at least 25% of directors must be resident Canadians; if fewer than four directors, at least one. A majority is required in prescribed sectors with Canadian-ownership rules. Not repealed (Act current to 2026-10-29; last amended 2026-03-26). — [CBCA s.105](https://laws-lois.justice.gc.ca/eng/acts/C-44/section-105.html) (fetched)
- Since **2024-01-22**, all CBCA corporations must file ISC register information (or their exempt status) with Corporations Canada, and some of it is public. The ISC test is 25% of shares or "control in fact". — [Corporations Canada, ISC](https://www.ised-isde.canada.ca/site/corporations-canada/en/individuals-significant-control) (search summary)
- Corporations Canada began issuing official inquiries in **September 2026** about ISC filings, especially "no ISC" filings. — [Fasken, Sept 2026](https://www.fasken.com/en/knowledge/2026/09/corporations-canada-increases-scrutiny-of-isc-register-filings-by-federal-corporations) (search summary)
- The s.21.1 register provision changed in 2026 (one version ran 2024-06-20 to 2026-05-26). — [CBCA s.21.1](https://laws-lois.justice.gc.ca/eng/acts/c-44/section-21.1.html) (search summary)

**Quebec Law 25**
- Required:
  - a person in charge of personal-information protection, whose details must be published if not the CEO
  - privacy impact assessments for new or overhauled information systems involving personal information
  - a PIA **before communicating personal information outside Quebec**, assessing adequacy of protection, and notice to individuals
  - Source: [Clyde & Co](https://www.clydeco.com/en/insights/2023/09/law-25-quebec-s-second-wave-of-new-privacy-amendme); [TrustArc](https://trustarc.com/regulations/quebec-law-25/) (search summary)
- Penalties are reported as up to **C$25M or 4%** of worldwide turnover (penal) and up to **C$10M or 2%** (administrative monetary penalties). — [TrustArc](https://trustarc.com/regulations/quebec-law-25/); [BLG Law 25 guide](https://www.blg.com/-/media/insights/documents/blg-quebec-bill-64-guide-en-upd.pdf) (search summary)

### Inferences
- If the team is partly Canadian, a CBCA corporation's residency rule is easy to meet. If the operating entity is US (Delaware) with a Canadian subsidiary only for staff, the subsidiary's activities determine FINTRAC and RPAA status (section 1). Incorporating in Canada makes "place of business in Canada" automatic for both regimes.
- The ISC filing is a recurring obligation and overlaps with FINTRAC's beneficial-ownership and 20%-owner criminal record checks.
- Hosting user data in US clouds triggers Law 25 transfer PIAs for Quebec users (Scenario B). PIPEDA governs other provinces' commercial data, except Alberta and BC, which have their own private-sector acts (background knowledge, not verified here).

### Gaps
- Provincial incorporation alternatives were not researched: Ontario and BC director-residency rules, provincial ISC registers, and fees.
- The CBCA incorporation fee was not verified.
- PIPEDA specifics (breach reporting, penalties) and the status of federal privacy reform after Bill C-27 were not researched.
- What changed in CBCA s.21.1 in 2026 was not verified.
- Law 25 penalty tiers come from secondary summaries; confirm with counsel or the statute.

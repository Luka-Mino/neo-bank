# The complete guide to building a neobank in 2026

**The neobank industry has reached an inflection point: after a decade of growth-at-all-costs, the winners are separating from the losers.** Of the 400+ neobanks operating globally, fewer than 5% are profitable — but those that are profitable (Nubank, Revolut, Starling, Monzo, SoFi, Dave) are generating billions in revenue and reshaping retail banking permanently. The global market reached roughly **$200–260 billion in 2025**, growing at 45–55% CAGR, with projections to surpass $2 trillion by 2030. Yet the path to building a successful neobank has grown considerably more complex since the Synapse collapse of 2024 exposed critical fragilities in the Banking-as-a-Service model, triggering a wave of regulatory enforcement that has reshaped the infrastructure landscape. For anyone building a neobank today, this report covers every dimension you need to understand — from definitions and revenue models to technology decisions, consumer dynamics, and the regulatory minefield.

---

## 1. What a neobank actually is — and isn't

A **neobank** is a digital-only financial institution that delivers banking services exclusively through mobile apps and online platforms, without maintaining physical branches. The critical legal distinction: most neobanks do not hold their own banking licenses and instead rely on partnerships with chartered banks to offer regulated services like FDIC-insured deposits. The term "neo" reflects their position as a fundamentally new model of banking — one built on software rather than real estate.

The terminology matters because the industry frequently conflates several distinct categories. A **challenger bank** holds its own banking license and is subject to full prudential regulation — Starling Bank and Monzo in the UK are challenger banks, not neobanks in the strict sense, though the market uses the terms interchangeably. A **digital bank** is typically the digital arm of an existing traditional bank (Marcus by Goldman Sachs, Ally Bank). **Fintech** is the broadest umbrella, encompassing everything from payment processors to insurtech to lending platforms — neobanks are a specialized sub-segment focused specifically on core banking services.

| Feature | Neobank | Challenger Bank | Digital Bank | Traditional Bank |
|---------|---------|-----------------|--------------|------------------|
| Banking license | Typically none; relies on partner bank | Holds its own license | Usually arm of licensed bank | Full license |
| Physical branches | None | Few or none | May have parent's branches | Extensive network |
| Core model | Tech startup; mobile-first | Modern bank with digital focus | Digital extension of legacy bank | Branch-based |
| Regulatory burden | Lighter (EMI license or partner bank) | Heavy (full prudential regulation) | Governed by parent bank | Heavy |
| Examples | Chime, early Revolut | Starling, Monzo (licensed) | Marcus, Ally | JPMorgan, HSBC |

The distinction is converging. Revolut operated as an Electronic Money Institution for years before securing a UK banking license with restrictions in July 2024 and obtaining its **full UK banking license on March 11, 2026** — after a 20-month mobilization period. In the US, SoFi acquired a bank charter in January 2022 via Golden Pacific Bancorp, and Varo became the first consumer fintech to receive a de novo national bank charter in July 2020. The trend is clear: the most ambitious neobanks are pursuing full banking licenses to unlock lending, control their destiny, and reduce counterparty risk.

### How the neobank model evolved

The financial crisis of 2007–2009 was the decisive catalyst. Consumer trust in traditional banking collapsed, and the smartphone revolution created a new delivery channel. **Simple**, founded in 2009 in Brooklyn, is widely recognized as the first neobank — offering FDIC-insured checking through The Bancorp Bank with built-in budgeting tools. It was acquired by BBVA for ~$117 million in 2014 and shut down in 2021. **Moven**, launched in 2011 by Brett King, was the first to offer a purely app-based account opening process. Both proved the model but neither survived independently.

The growth phase (2013–2019) saw the founding of today's giants: **Nubank** (2013, Brazil), **N26** (2013, Germany), **Starling** (2014, UK), **Monzo** (2015, UK), **Revolut** (2015, UK), and **Chime** (2013, US). Europe's PSD2 regulation in 2018 mandated open banking APIs, supercharging competition. COVID-19 then accelerated digital banking adoption by years — branch visits collapsed, and neobank user growth surged.

By 2023–2025, the industry entered its maturation phase. BCG found that only **23 out of 453 global digital challenger banks were operationally profitable in 2023**. The venture capital environment tightened, forcing a shift from user growth to sustainable unit economics. The Synapse bankruptcy in April 2024 — which froze $265 million in customer deposits — served as the industry's watershed moment, exposing the risks of the BaaS middleware model and triggering sweeping regulatory action.

### Revenue models that actually work

Neobanks generate revenue through several mechanisms, and the most sustainable ones combine multiple streams.

**Interchange fees** remain the foundation for most US neobanks. When a customer swipes their debit card, the merchant's bank pays an interchange fee — typically **1–3% of the transaction** in the US. This is split between the card network and the issuing bank/neobank. Critically, neobanks that partner with banks under $10 billion in assets are **Durbin Amendment-exempt**, earning significantly higher interchange per transaction than large banks. Chime derives roughly **80% of its revenue** from interchange. However, in the EU, interchange is capped at **0.2% for debit and 0.3% for credit**, which forced European neobanks to diversify much earlier.

**Subscription/premium tiers** provide recurring, predictable revenue. Revolut offers four paid tiers ranging from £3.99 to £45/month, and paid subscriptions account for over **30% of Revolut's revenue**. Monzo's subscription revenue reached over £11 million across 360,000 subscribers. The freemium-to-premium conversion funnel has proven one of the most reliable revenue engines.

**Lending and net interest income** is the profit engine for neobanks with banking licenses. Nubank generates a net interest margin of **19.5%+** by cross-selling credit cards and personal loans across its 114 million customers. Starling Bank built sustained profitability on a **£6.5 billion loan book** with a 4.34% NIM. The consensus from BCG, Bain, and McKinsey is unanimous: "You cannot survive on payments alone; you must become a lender."

**Other revenue streams** include FX and international transfer fees (a core source for Revolut and Wise), crypto trading commissions (volatile but growing — crypto-linked accounts surged 56% in 2025), B2B/BaaS technology licensing (Starling's Engine platform), and marketplace/referral fees from integrating third-party insurance, investment, and lending products. **Business accounts** now contribute roughly **67% of total neobank revenues globally**, commanding higher interchange rates and opening cross-selling opportunities.

---

## 2. The competitive landscape: who's winning, who's struggling, and why

### The global leaderboard

The neobank market follows a stark power law. The **top 3 neobanks** (Nubank, WeBank, Revolut) generated over **$21 billion in combined revenue and $5.1 billion in combined pre-tax profit in 2024** — more than all other neobanks combined.

**Nubank** is the world's largest independent neobank by revenue and customers. It serves **114.2 million customers** across Brazil, Mexico, and Colombia, generated **$11.5 billion in revenue** (+44% YoY) and **$2.0 billion in net income** in 2024. Its secret: penetrating Latin America's massive underbanked population with an ultra-low customer acquisition cost of less than $1 per customer (80–90% word-of-mouth growth). It dethroned Banco do Brasil — founded in 1808 — as Brazil's number-one main bank by market share in November 2024. Nubank applied for a US OCC bank charter in October 2025.

**Revolut** is the world's most valuable neobank, reaching a **$75 billion valuation** in a September 2025 employee share sale. With **52.5 million customers** across ~50 countries, it generated **£3.1 billion (~$4.0 billion) in revenue** in 2024 and £1.1 billion in pre-tax profit. Its super-app model — spanning FX, crypto, stocks, travel, insurance, and business accounts — is the industry's best example of revenue diversification, with **no single product or region exceeding 30% of revenue**. Revolut secured its full UK banking license in March 2026.

**Chime** is the largest US neobank, with **22 million+ customers** and **$1.7 billion in revenue** in 2024. It IPO'd on June 12, 2025, at an **$11.6 billion valuation** — well below its $25 billion peak in 2021. Chime's revenue remains roughly 80% interchange-dependent, which investors view as a risk. It reduced losses from $203 million (2023) to just $25 million (2024) and launched lending products (Instant Loans, March 2025) and a premium tier (Chime+, 3.75% APY) to diversify.

**Other major players and their status:**

| Neobank | Customers | 2024 Revenue | Profitability Status |
|---------|-----------|-------------|---------------------|
| WeBank (China/Tencent) | ~399M | $5.4B | Profitable since 2015 |
| Monzo (UK) | 12.2M | £1.23B | Second consecutive profitable year (FY2025) |
| SoFi (US, chartered) | ~10M | ~$2.5B+ | GAAP-profitable since Q4 2023 |
| Dave (US) | 12.1M | $347M | Net income $57.9M (2024), $196M (2025) |
| Wise (UK/global) | 12.8M active | £1.05B | Profitable since 2017 |
| Starling (UK) | ~5M | £714M | Four consecutive profitable years |
| N26 (Germany) | ~8M registered | €440M | Recently profitable but under heavy BaFin sanctions |
| Varo (US, chartered) | ~7M | Undisclosed | Struggling — losses deepening, equity capital at $54M |
| KakaoBank (South Korea) | ~24M | ~$2.1B | Profitable |

### What separates winners from losers

Three models have proven viable for neobank profitability. The **lending-led model** (Nubank, Starling, WeBank) generates high net interest margins by cross-selling credit products to a massive deposit base. The **diversified super-app model** (Revolut) spreads revenue across cards, FX, wealth, subscriptions, and business segments. The **interchange-heavy spending model** (Chime) works at massive scale, particularly when leveraging Durbin-exempt partner banks in the US, though it faces pressure from regulatory changes and EU caps.

Common traits among winners include **extreme cost discipline** (Nubank's cost-to-serve is under $1/month per customer), **organic customer acquisition** (Revolut is 70% organic, N26 73% word-of-mouth), **AI-driven operations** (WeBank processes 750+ million monthly transactions with AI-powered credit scoring), and increasingly, **holding a banking license** to unlock direct lending and deposit capture.

The losers share patterns too: sole reliance on interchange, overexpansion into markets without product-market fit (N26 withdrew from the US, UK, and Brazil), excessive burn without a profitability path, and fatal dependency on BaaS middleware. **Varo Bank** serves as a cautionary tale — it obtained the first consumer fintech national bank charter in 2020, but has struggled to generate sufficient revenue, with quarterly losses of $71 million, deposits halved to $160 million, and equity capital at historic lows.

### Recent failures and pivots

The **Synapse collapse** (April 2024) is the defining failure of this era — $265 million in frozen customer funds, a $65–95 million shortfall, 100,000+ affected accounts, criminal DOJ investigation, and the effective death of the opaque BaaS middleware model. Other notable exits include Volt Bank and Xinja (both Australian neobanks that surrendered their licenses), Daylight (LGBTQ-focused, ceased operations June 2023), Copper (shut down after Synapse), and Simple (closed by BBVA in 2021). Goldman Sachs's **Marcus retreat** — losing $4 billion+ over four years — demonstrated that even unlimited capital cannot guarantee success in consumer digital banking without deep product-market understanding. N26 lost both co-founders from operational roles in H2 2025 and won't have a new CEO (from UBS) until April 2026.

### Threats from Big Tech and incumbents

Traditional banks view Big Tech as a larger threat than neobanks — only 25% of bankers see neobanks as their biggest competitor. **Apple** expanded Apple Card and Apple Pay into quasi-banking, though the Goldman partnership is being unwound. JPMorgan Chase launched a UK digital bank (Chase UK) leveraging 10x Banking's infrastructure. UK banks increased tech spending **22% from 2020 to 2024** specifically to match neobank features. The embedded finance trend — where any company can add banking features through BaaS APIs — creates competition from non-financial companies. McKinsey estimates digital challengers hold roughly **8% of retail banking revenues** in developed markets, up from under 2% in 2018.

---

## 3. Technology infrastructure: the decisions that define your neobank

### Choosing a core banking system

The core banking platform is the single most consequential technology decision. Modern neobanks overwhelmingly choose **cloud-native, API-first core banking systems** over legacy platforms, reducing time-to-market from years to months.

**Thought Machine (Vault Core)** has emerged as the prestige choice. Founded in 2014 by a former Google engineer, it was named a Leader in the 2025 Gartner Magic Quadrant for Retail Core Banking. Its client list reads like a who's-who: **JPMorgan Chase** (selected to replace its US retail core), Lloyds Banking Group, Standard Chartered, Intesa Sanpaolo, SEB, and Atom Bank. It uses configurable "Smart Contracts" (not blockchain) that encapsulate all financial product behavior in code, enabling rapid product creation. It's cloud-agnostic (AWS, GCP, Azure), offers 200+ preconfigured financial products, and carries a premium price via subscription-based licensing over 3–5 year terms.

**Mambu** is the cost-effective alternative, particularly popular among mid-market challengers and neobanks. It's cloud-native SaaS, modular, and API-driven, with ~159 banking customers and a reputation for fast deployment. **10x Banking**, founded by former Barclays CEO Antony Jenkins, powers Chase UK (JPMorgan's UK digital bank) and Westpac's BaaS platform. Its deep banking heritage gives it credibility with large institutions. **Finxact**, acquired by Fiserv for ~$650 million in 2022, provides a cloud-native option within Fiserv's massive ecosystem. The legacy "Big 3" — **FIS, Fiserv, and Jack Henry** — are all racing to modernize, with FIS claiming 90%+ of workloads migrated to cloud.

For most neobank builders, the recommendation is clear: **license an existing modern core** (Thought Machine, Mambu, or 10x) rather than build from scratch. Building your own core is viable only at massive scale with deep domain expertise — Revolut and Monzo eventually built some components in-house, but both started on third-party platforms.

### Banking-as-a-Service: the model, the providers, and the risks

The BaaS model enables neobanks to offer regulated banking products without holding a charter. It operates in three tiers: a **licensed bank** (bottom) holds deposits and bears regulatory responsibility; a **BaaS middleware platform** (middle) provides APIs and integration; and a **customer-facing fintech** (top) owns the user experience.

Three distinct BaaS architectures exist, and the choice matters enormously:

- **Bank-direct model**: The bank builds and maintains its own APIs. Secure and compliant but slow to iterate. Used by banks like Cross River that serve fintechs directly.
- **Bank-vendor partnership model**: A technology vendor (Treasury Prime, FIS) connects fintechs to banks via APIs while the bank retains compliance oversight. Considered the safest model at scale.
- **API dealer/middleware model**: A company intercepts communications between fintechs and banks, maintaining its own ledgers of customer funds. **This is the model that failed catastrophically with Synapse.**

**Column** represents the most innovative BaaS approach: a nationally chartered bank built specifically as developer infrastructure, **eliminating the middleware layer entirely**. It is both the bank and the tech platform — a single counterparty for infrastructure and funding. Revenue surged to **$55.1 million in 2024** (+126% YoY). Its clients include Brex, Bilt Rewards, and Best Egg. Column is founder/employee-owned with no VC pressure, and its vertically integrated model directly addresses the Synapse-style middleware risk.

**Unit** serves US startups building embedded banking, operating through FDIC-insured bank partnerships with developer-friendly APIs. **Treasury Prime** offers a marketplace of multiple bank partners, emphasizing that it doesn't hold risk or handle compliance. **Bond** was acquired by FIS, integrating into the traditional infrastructure giant's ecosystem.

### The Synapse collapse: what happened and what it means

**Synapse Financial Technologies** was a BaaS middleware provider connecting ~100 fintech companies to ~20 banks, serving approximately 10 million end users. Backed by Andreessen Horowitz ($33 million Series B), it maintained internal ledgers tracking individual customer balances across multiple partner banks in pooled "For Benefit Of" (FBO) accounts.

The crisis unfolded rapidly. In October 2023, Mercury and Evolve Bank ended their relationships with Synapse. In **April 2024**, Synapse filed Chapter 11 bankruptcy. A planned $9.7 million fire sale to TabaPay fell apart in May. Synapse then **cut off access to its technology systems**, preventing partner banks from processing transactions. All employees were terminated May 24, and former FDIC Chair Jelena McWilliams was appointed as bankruptcy trustee.

The damage was severe: **over 100,000 people lost access to $265 million in deposits**. A forensic investigation revealed a **$65–95 million shortfall** between what banks held and what was owed to customers. The root cause: Synapse's internal ledgers had become hopelessly out of sync with actual bank-held funds. The FBO/omnibus account structure meant FDIC insurance couldn't be directly paid because individual beneficial owners could not be identified. The DOJ convened a grand jury investigating potential criminal fraud in January 2025. As of late 2025, only $11.8 million of the $64.9 million+ owed had been refunded, with many consumers receiving pennies on the dollar.

The lessons for anyone building a neobank are existential: **never rely on a single middleware provider** without independent recordkeeping; sub-ledger reconciliation must be daily and independently verifiable; FDIC insurance does not protect against fintech/middleware bankruptcy, only bank failure; and the era of opaque BaaS middleware is effectively over.

### Card issuing and payment rails

The card issuing stack flows from the card network (Visa/Mastercard) through the issuing bank (holds BIN), to the issuer processor (authorization and processing), and finally to the neobank (customer-facing). **Marqeta** dominates enterprise card issuing, processing **$84 billion+ quarterly** with its Just-In-Time funding innovation — though it faces customer concentration risk (Square/Block accounts for 73% of revenue). **Galileo** (owned by SoFi since a $1.2 billion acquisition in 2020) serves 130 million+ accounts across 13 countries. **Lithic** targets earlier-stage startups with modular, bank-agnostic card issuing at $0.10 per virtual card — the most startup-friendly option.

For payment rails, **ACH** remains the backbone of US neobank money movement (31.5 billion+ payments processed in 2023). Neobanks exploit ACH timing for "early direct deposit" by fronting funds before official settlement. **FedNow**, launched July 2023, has grown to **1,500+ participating institutions** processing nearly 30,000 daily transactions with a $10 million per-transaction limit, though it remains modest versus total US payment volume. **SEPA** serves European neobanks, **UPI** powers India's fintech explosion (18.3 billion transactions in March 2025 alone), and **Faster Payments** has underpinned UK neobanking since 2008.

### What to build versus what to buy

For a neobank launching from scratch, the strategic framework is straightforward but the execution is demanding. The **BaaS path** (using Column, Unit, or Treasury Prime with a sponsor bank) is fastest — an MVP in **3–4 months** — but carries counterparty risk and limits product flexibility. The **licensed core path** (Thought Machine, Mambu, or 10x) with a bank charter offers full control but takes **2–5 years** and costs **$50–100 million+**. Most builders should start with the BaaS path, prove product-market fit, then pursue a charter at scale.

The reference tech stack for a modern neobank comprises: a cloud-native core banking platform (licensed); a microservices backend (Go, Java/Kotlin, or Python); containerized deployment on **AWS** (most proven for financial services) with Kubernetes; an API gateway with OAuth 2.0 authentication; **Flutter** or React Native for cross-platform mobile; **Alloy** for KYC/identity orchestration (integrating 250+ data sources); **Socure** or Persona for primary identity verification; **Sardine** for behavioral fraud detection; and a modern card issuing processor (Lithic for early stage, Marqeta at scale). BaaS infrastructure can reduce total costs by **60–75%** versus building proprietary, according to Forrester.

---

## 4. Who uses neobanks and what they actually want

### Demographics and adoption patterns

The neobank user base skews young and digital-native. **78% of global neobank users in 2025 are millennials or Gen Z**, with over 62% aged 18–35. But older demographics are growing — the 45–60 age group now comprises 21% of new European account holders. Women represent 48% of neobank users globally, signaling a closing gender gap.

Global adoption has reached approximately **350 million users in 2025**, up from 301.7 million in 2024. In the US, **53.7 million** people hold digital-only bank accounts. Cornerstone Advisors found that **44% of all new checking account openings in 2024 went to neobanks** — a figure that has held for four consecutive years. In the UK, over 35 million customers use the 110+ operating neobanks, with one in five British adults using Monzo. Brazil leads in penetration: **43% of the population uses neobanks**, with Nubank serving as the primary bank for roughly 60% of its Brazilian customers.

Asia-Pacific is the fastest-growing region, with **projected 51.8% CAGR through 2031**. India has 65+ million users on digital-only platforms, and WeBank in China serves nearly **500 million users**. Latin American neobank adoption grew **54% year-over-year** in 2025, led by Nubank's penetration of the underbanked. Africa posted 34% user base growth, with 40+ million new accounts since 2022.

The underbanked represent the largest untapped market: **1.5 billion adults globally remain unbanked** (World Bank), with over 250 million in Sub-Saharan Africa alone. Neobanks have been transformative — Nubank brought 5.7 million people into the credit card market in a single 12-month period. Southeast Asian government partnerships with neobanks created 45 million new accounts for previously excluded citizens.

### Features that drive acquisition and retention

The primary motivation for switching to a neobank is **lower or zero fees**: no monthly maintenance fees, no minimum balance requirements, no overdraft charges. **Early direct deposit** (paychecks up to 2 days early) is a critical acquisition tool, especially for paycheck-to-paycheck workers — Chime, Varo, SoFi, and Current all offer it.

**High-yield savings accounts** are a powerful differentiator. As of early 2026, Varo offers up to **5.00% APY** (on qualifying balances), SoFi offers 3.30–4.00%, and Current offers up to 4.00% — versus a national average of just **0.39%**. Credit-building tools (Chime's Credit Builder secured card, MoneyLion's credit lines) target thin-file consumers and the underbanked. Real-time transaction tracking, AI-powered spending insights, and budgeting tools are now table stakes — 79% of neobank app users rely on real-time transaction tracking.

**Gig workers** represent 35% of neobank users in 2025. With nearly 80 million Americans doing gig work, this segment values instant payouts, invoicing tools, tax management, and income-smoothing features. **Immigrants and expats** save **€30–€134 annually** on remittances by using neobanks like Revolut and Wise over traditional providers.

### The trust gap is real but narrowing

Consumer trust remains the biggest barrier. A Plaid/YouGov survey in August 2024 found that only **30% of US respondents trust neobanks** — though this is more than double the 13% who currently use one, signaling room for growth. By a 6:1 margin, consumers chose traditional banks over fintechs as the entity they trust most to protect them from fraud (ABA/Morning Consult, October 2025). **54% of consumers cite data security concerns** with neobanks.

The Synapse crisis made the trust problem tangible. FDIC insurance confusion is widespread — many consumers do not understand that if the *neobank* fails (not the partner bank), FDIC insurance does not automatically protect them. Neobanks address trust through biometric security (**94% use facial recognition or fingerprint scanning**), two-factor authentication, transparent fee structures, and extended FDIC coverage through sweep networks (Mercury Vault offers up to $5 million, Brex up to $6 million).

### SMB neobanking: the biggest growth opportunity

Business neobanking has emerged as potentially the most lucrative segment. **Business accounts contributed ~67% of total neobank revenues in 2025**, with over 180 million SME accounts opened globally. SMBs transact an average of $15,000 monthly through neobanks, and 52% of new neobank entrants now focus on SME banking.

**Mercury** leads the US startup banking market with 300,000+ customers, $20 billion+ in deposits, **$248 billion in transaction volume in 2025** (+59% YoY), and an estimated $650 million annualized revenue — three consecutive years of GAAP profitability. It confidentially filed for an IPO in December 2024 and applied for an OCC bank charter in December 2025. **Brex** targets enterprise and startup corporate cards with dynamic credit limits 10–20x higher than traditional cards and up to $6 million FDIC coverage. **Novo** serves grassroots SMBs with Shopify/Etsy/Stripe integrations, while **Found** targets self-employed workers with automatic tax set-asides. These platforms are evolving beyond banking into full finance workflow platforms — competing with Bill.com, Navan, and Airbase, not just other neobanks.

---

## 5. Navigating the regulatory landscape

### How neobanks are legally structured in the US

The foundational choice for any US neobank is whether to operate **with or without a bank charter**. Without a charter, a neobank is legally a technology company that partners with a chartered bank for deposit-holding, FDIC insurance, and regulatory compliance. It cannot legally call itself a "bank" — Chime was forced by California regulators in 2021 to stop marketing as "Chime Bank." With a charter, the neobank controls the full stack: it directly holds deposits, provides FDIC insurance in its own name, offers a full range of banking products, and is subject to direct federal supervision.

Four charter types exist. A **national bank charter** from the OCC provides the most comprehensive framework with federal preemption of state licensing requirements. A **state bank charter** is issued by state banking departments with FDIC insurance. An **Industrial Loan Company (ILC) charter** — primarily available through Utah — allows commercial firms to own banks without becoming bank holding companies; Square/Block and Nelnet use ILCs, and PayPal applied for one in December 2025. The OCC's **special purpose fintech charter**, proposed in 2016–2018, never became fully operational after court challenges.

Only a handful of neobanks have obtained their own charter. **Varo Bank** (July 2020) was first — the process took 3+ years and cost approximately **$100 million** in legal, advisory, and capital expenses. **SoFi** (January 2022) acquired Golden Pacific Bancorp rather than pursuing de novo, a faster but still complex path. **LendingClub** acquired Radius Bank in 2020. More recently, **Mercury** (December 2025), **Nubank** (October 2025), and European neobank **bunq** (January 2026) have all filed de novo OCC applications — reflecting a clear trend toward charter-seeking among scaled neobanks.

The de novo charter process typically takes **12–18 months minimum** (Varo's took 3+ years) and requires detailed business plans, demonstrated capital adequacy (FDIC minimums often exceed **$20 million**, Varo's was $104.4 million), sound governance, CRA plans, and passing pre-opening OCC examinations. The OCC reported a spike in applications, with **14 filed as of mid-December 2025**.

### The partner bank model and its risks

Most US neobanks operate through **sponsor/partner banks**. The neobank builds the customer-facing app; the partner bank holds deposits in **FBO (For Benefit Of) omnibus accounts**, provides FDIC insurance, and bears primary regulatory responsibility. Revenue is shared — partner banks earn deposits and a portion of interchange income.

Key sponsor banks include **The Bancorp Bank** and **Stride Bank** (Chime's partners), **Cross River Bank** (major BaaS provider), **Evolve Bank & Trust** (Synapse's primary partner), **Sutton Bank**, and **Choice Financial Group**. The model's advantage is speed and capital efficiency — a neobank can launch in **3–6 months** versus years for a charter.

But the risks have been laid bare. Since 2022, **virtually every major BaaS sponsor bank has faced regulatory enforcement action**. Blue Ridge Bank received OCC consent orders in 2022 and 2024, was deemed in "troubled condition," posted $51 million in losses (2023), and ultimately "threw BaaS out the door" — exiting the model entirely. Evolve Bank received a Federal Reserve cease-and-desist in June 2024. Sutton Bank, Piermont Bank, Lineage Bank, and Thread Bank all received FDIC consent orders in early-to-mid 2024. Piermont Bank's CEO stated bluntly: "Every bank that touches BaaS is getting an enforcement action."

### FDIC insurance: what's real and what's theater

FDIC **pass-through insurance** can cover individual neobank customers' deposits up to $250,000, but only if three conditions are met: the bank's records indicate a custodial relationship exists, the custodian's records identify actual owners and their individual shares, and the relationship is consistent with state law. When the Synapse collapse demonstrated that reconciling individual beneficial owners from commingled FBO accounts could be impossible, the FDIC's limitations became painfully clear.

The FDIC responded with a **proposed "Synapse Rule" in September 2024** requiring banks holding custodial accounts with transactional features to: reconcile individual beneficial owner balances daily, maintain "direct, continuous and unrestricted" access to beneficial owner records, obtain annual compliance certification from an executive officer, and file annual reports with the FDIC listing account holders and total balances. The comment period closed January 2025, and finalization is pending. Additionally, the FDIC proposed revising **brokered deposit rules** in July 2024, potentially classifying many fintech-sourced deposits as "brokered" — which would impose additional regulatory burden on partner banks.

### European, UK, and Canadian frameworks

In Europe, neobanks typically start with an **Electronic Money Institution (EMI) license**, which allows holding customer funds and processing payments but not lending from deposits. Lithuania is the fastest EU jurisdiction for EMI licenses (~6 months). A full banking license unlocks lending and deposit guarantee scheme coverage (€100,000 in the EU, **£120,000 in the UK** as of December 2025). PSD2 mandated open banking APIs since 2018, and the replacement framework — **PSD3 and PSR** — reached provisional political agreement in November 2025, integrating EMIs as a sub-category of payment institutions, enhancing fraud liability for payment service providers, requiring verification-of-payee, and strengthening open banking. Full enforcement is expected around 2027–2028.

In the UK, the PRA/FCA operates a **two-stage licensing approach**: Stage 1 (mobilization) grants authorization with restrictions and minimum capital of £1 million, while Stage 2 lifts restrictions after demonstrating operational readiness. Revolut's journey from EMI to full UK banking license took over 20 months of mobilization.

In Canada, neobanks must register as **Money Services Businesses** with **FINTRAC** (financial intelligence unit) and typically partner with CDIC-member banks for deposit insurance (C$100,000 per insured category). Major Canadian neobanks include **Wealthsimple** (3 million clients, $30 billion AUM), **KOHO** (partnered with Peoples Trust, pursuing a Schedule 1 banking license), **Neo Financial** (partnered with Peoples Bank of Canada), and **EQ Bank** (itself a licensed, OSFI-regulated bank).

### What licenses you actually need to launch in the US

Without a bank charter, launching a neobank in the US requires: **FinCEN MSB registration** (mandatory federal registration, free to file); **state money transmitter licenses** in 46+ states (filed through NMLS, with surety bonds ranging from $25,000 to $2,000,000+, minimum tangible net worth of $100,000–$500,000+, FBI fingerprinting, and timelines of 3–9 months per state); **state lending licenses** if offering credit products; a **partner bank agreement** with an FDIC-insured institution; and potentially **broker-dealer registration** with FINRA/SEC if offering investment products.

With a national bank charter, federal preemption eliminates the need for state money transmitter and lending licenses — one of the charter's most compelling advantages for neobanks operating nationwide.

### Compliance requirements are non-negotiable

The compliance stack spans multiple federal frameworks. **KYC** (Know Your Customer) requires a Customer Identification Program, Customer Due Diligence, and enhanced due diligence for high-risk accounts. **BSA/AML** compliance demands a five-pillar program: internal controls, independent testing, a designated BSA officer, training, and risk-based customer due diligence — plus Currency Transaction Reports for cash over $10,000 and Suspicious Activity Reports. This is the area where most enforcement actions have occurred. **Reg E** governs electronic fund transfers and requires error resolution procedures and provisional credits. **UDAAP** prohibits unfair, deceptive, or abusive practices — neobanks must clearly disclose they are not banks and that FDIC coverage applies through partner institutions. **Fair lending** requirements (ECOA, Fair Housing Act) apply to any credit products, including AI/algorithmic underwriting that must avoid disparate impact.

The CFPB's **Section 1033 open banking rule**, finalized October 2024, would have required financial institutions to provide consumers access to transfer their data to authorized third parties — but is now in legal limbo. The CFPB itself stated in May 2025 that the rule "exceeds its statutory authority," and a court granted a stay in July 2025. An Advanced Notice of Proposed Rulemaking was issued in August 2025, receiving ~14,000 comments. The rule's future remains uncertain.

### Charter versus partner bank: the strategic calculus

| Factor | Bank Charter | Partner Bank Model |
|--------|-------------|-------------------|
| Time to market | 2–5+ years | 3–6 months |
| Cost | $50–100M+ | Partnership fees + compliance |
| Capital requirements | $20–104M+ regulatory minimum | No direct bank capital |
| Products | Full range | Limited to partner's appetite |
| State licensing | Federal preemption | 46+ state MTLs required |
| Control | Full operational control | Dependent on partner |
| Revenue | Keep 100% | Must share interchange + revenue |
| Risk | Capital at risk; must achieve profitability | Partner can terminate; platform risk |

Most neobanks start with the partner bank model for speed, cost, and focus. The charter becomes worth pursuing when deposits exceed **$10–20 billion** (Mercury's threshold), when the product roadmap requires full banking capabilities, when operating nationwide makes federal preemption valuable, or when the long-term economics of owning deposits and funding loans directly outweigh the regulatory burden. In the post-Synapse environment, where sponsor bank relationships carry heightened counterparty and regulatory risk, the case for pursuing a charter earlier has strengthened considerably.

---

## Conclusion: building a neobank in 2026

The neobank opportunity remains enormous — a $200+ billion market growing at 45%+ annually toward multi-trillion-dollar scale — but the playbook has fundamentally changed from the 2015–2021 era. Three strategic realities now define the landscape.

**First, interchange-only business models are dead.** The most successful neobanks — Nubank, Revolut, Starling — have proven that sustainable profitability requires lending, subscription revenue, and diversification across multiple product lines and geographies. Chime's IPO valuation haircut (from $25 billion to $11.6 billion) reflects the market's clear verdict on interchange dependency.

**Second, the BaaS middleware layer is being eliminated or rebuilt.** The Synapse collapse didn't just freeze $265 million — it destroyed trust in the entire concept of opaque financial middleware. The industry is moving toward either bank-direct models (Column, Cross River) where the bank IS the technology, or strict bank-vendor partnerships with mandated daily reconciliation and direct regulatory oversight. Any neobank builder who relies on a middleware provider without independent ledger verification and contingency planning is accepting existential risk.

**Third, regulatory pressure is a permanent feature, not a temporary obstacle.** Every major BaaS sponsor bank has faced enforcement action. The FDIC's proposed custodial account rules, the CFPB's expanding supervisory authority over large nonbanks, and state regulators' $80 million Cash App settlement signal an environment where compliance is not a cost center but a survival requirement — and potentially a competitive moat. Neobanks that invest early in compliance infrastructure, maintain direct relationships with regulated entities, and pursue their own banking licenses at scale will have structural advantages over those that defer these investments.

The power-law dynamics of the market are also worth internalizing: the top three neobanks generate more revenue and profit than the other 400+ combined. For a new entrant, this means success likely requires either deep **geographic specialization** (serving an underbanked market like Nubank did in Brazil), sharp **vertical focus** (SMB banking like Mercury, gig workers, immigrants), or a genuinely differentiated **technology capability** (AI-native credit scoring, embedded finance for a specific industry). The era of launching a general-purpose neobank with a slick app and interchange revenue is over. What remains is a harder, more capital-intensive, more regulated — but ultimately more defensible — opportunity to build the future of banking.
> DRAFT – for counsel review. Not legal advice.
> Date: 2026-11-24 · Status: DRAFT – for counsel · Owner: [QUALIFIED INDIVIDUAL] · Version 0.1

# F8: Vendor register and checks

**Entity:** [ENTITY NAME] ("Moneta"). **Next review:** [DATE], then yearly and whenever a vendor is added or removed.

## 1. Why we keep this

- The Safeguards Rule requires Moneta to pick service providers that can protect customer data, require that protection by contract, and re-check them from time to time (16 CFR 314.4(f); [FTC guide](https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know)).
- Dakota and its bank will ask for this list during due diligence. Their framework is the 2023 interagency third-party guidance: planning, due diligence, contract, monitoring, exit ([research notes Q4](<../research_notes/Moneta licensing and permits/federal_and_dakota_model.md>)).
- Partners will also ask Moneta for a SOC 2 report, or a plan to get one `[DECIDE: SOC 2 Type I target date]`.

## 2. Who does what

Moneta chooses, contracts with and oversees its own vendors. Dakota oversees its own vendors (the fourth parties in §4). Moneta relies on Dakota's oversight but should ask Dakota for its subcontractor list and SOC 2 report.

## 3. Register

**Criticality:**
- **Critical:** service stops, or all customer data or funds are exposed.
- **High:** sensitive data, or sign-in depends on it.
- **Medium:** limited data, or a degraded service.

**Assurance:** nothing in this column has been checked unless stated. "Request" means getting the vendor's current SOC 2 Type II report (or equivalent) and recording its type and period.

| Vendor | What it does for us | Customer data it holds | Criticality | Assurance | Contract and DPA | Owner |
|---|---|---|---|---|---|---|
| **Dakota Platform, Inc.** (parent Dakota Ridge, Inc.). FinCEN-registered, state-licensed money transmitter, NMLS #2727274 | KYC/KYB, wallets, ACH in and out, sanctions screening, transaction monitoring, cards | All identity data (name, date of birth, SSN, address, ID, proof of address, source of wealth). Wallets, transactions, linked banks, card data | Critical | Trust page says "SOC 2 Type II audit underway", with a Type I report available under NDA ([Dakota Trust](https://www.dakota.xyz/trust)). Request it (A1 Q9) | Private platform agreement: not yet seen. Public Terms say commercial use only, which is a go/no-go for consumers ([report](<../reports/Moneta licensing and permits.md>)) | [CEO] |
| **Vercel** | Hosting, server functions, crons, secret storage | Everything passing through the app. Runtime logs (redacted). All production secrets, including the signing key. Visitor IP addresses | Critical | Request | Standard terms; Pro plan pending (D15). DPA: [check] | [ENGINEERING LEAD] |
| **Supabase** | Postgres database and backups | All customer data Moneta holds ([F2](F2-information-security-program.md) §4) | Critical | Request. Region: [check] | DPA: [check] | [ENGINEERING LEAD] |
| **GitHub** | Source code, CI, Dependabot | None. Must never hold secrets (gitleaks in CI) | High: a malicious code change could misuse the signing key | Request | Standard terms | [ENGINEERING LEAD] |
| **Resend** | Email: sign-in links, codes, notifications, support copies | Email addresses and message content. Includes one-time codes, magic links and the full text of each support request with the customer's name, email and IDs | High | Request | DPA: [check] | [ENGINEERING LEAD] |
| **Support mailbox host** [TBD, decision D14] | Receives `SUPPORT_EMAIL` copies | Complaint and support text | High | Request | [TBD] | [SUPPORT LEAD] |
| **Domain registrar and DNS** [TBD] | Our domain and email records | None, but a hijack enables phishing | High | — | [TBD] | [CEO] |
| **Sentry** (not live yet; DSN unset) | Error monitoring | Error events, stack traces, request metadata. `sendDefaultPii: false`; the browser masks long digit runs. Gap: the Cards.js `session` parameter (plan 4.5) | Medium | Request | DPA: [check] | [ENGINEERING LEAD] |
| **Upstash** (planned, plan C2) | Shared store for rate limits | IP address plus route, in rate-limit keys | Medium: an outage weakens brute-force protection | Request | DPA: [check] | [ENGINEERING LEAD] |
| **Password manager** [TBD] | Staff credentials and recovery codes | None directly. Holds the keys to every console | High | Request | [TBD] | [ENGINEERING LEAD] |

**In the code but not in use:**
- Stripe Issuing (`ISSUING_PROVIDER=stripe`, `/api/webhooks/stripe-issuing`);
- an SMTP fallback through nodemailer (`EMAIL_PROVIDER=smtp`).

Before enabling either, add it to this register and check it. Otherwise remove it.

## 4. Fourth parties (Dakota's partners)

Moneta has no contract with these. Track them through Dakota.

| Party | Role | Note |
|---|---|---|
| Lead Bank (Dakota also names BMO and Erebor) | Holds the funding account behind ACH | Dakota's documents disagree on its banks. Ask which bank serves this programme |
| Card processor (frames that show card details) | Shows card numbers without them touching our server | Our code comments name Lithic `[DAKOTA: confirm]` |
| Visa | Card network | Network and bank approvals are needed for the card programme |
| Circle | Issues USDC | Issuer risk: reserves, redemption, address freezes. Moneta makes no promises about it ([F9](F9-marketing-review-checklist.md)) |
| Base | The blockchain network the wallets run on | An outage stops on-chain sends and withdrawals |

## 5. How we check vendors

**Before signing,** for Critical and High vendors, [QUALIFIED INDIVIDUAL] approves:
- what data the vendor will hold, and where;
- its security report (SOC 2 Type II or ISO 27001);
- its subprocessors;
- its breach-notice terms;
- its data deletion at exit.

**The contract must include:**
- security safeguards;
- breach notice to Moneta within [72] hours `[COUNSEL]`;
- the right to receive audit reports;
- notice of subprocessor changes;
- return or deletion of data at the end.

**Every year** for Critical and High vendors, and every two years for Medium:
- get a fresh report and read its exceptions;
- review the vendor's incidents;
- check who at Moneta can reach the vendor's console, with MFA and named accounts.

**Ongoing:** follow each vendor's status page and security notices. A vendor incident follows [F7](F7-incident-response-plan.md) playbook G.

**At exit:**
- export our data;
- revoke keys and tokens ([F5](F5-key-management-policy.md));
- get written confirmation that the vendor deleted our data;
- update this register.

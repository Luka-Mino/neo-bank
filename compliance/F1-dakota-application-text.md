> DRAFT – for counsel review. Not legal advice. 2026-11-24.

# F1: Text for Dakota's platform application

These are drafts for the written fields in Dakota's platform onboarding (KYB) and enhanced due diligence (EDD) forms. The field list comes from Dakota's support article "Onboarding to Dakota Platform" (summarised in `research_notes/Moneta licensing and permits/federal_and_dakota_model.md`). The documents and personal details Dakota asks for are in `PRE-DAKOTA-PLAN.md` B5.

Character counts were checked against Dakota's limits. Re-check after any edit.

## Rules for this form

- **Every statement must be true on the day we submit.** Several depend on decisions not yet made. Those are marked `[DEPENDS: …]`.
- **The "Regulated?" answer is the lawyer's call** (`PRE-DAKOTA-PLAN.md` A2). Don't submit the draft below without it.
- Fill `[N]`, `[X]` and the bracketed fields from the business plan. Don't guess volumes; Dakota sets limits from them.

---

## Business description (200–1,024 characters)

Pick the version that matches decision D9 (first customers).

**If consumers first** (610 characters):

> Moneta is a financial technology company building a web app that lets people in the United States hold, send and receive US dollars as USDC, a fully reserved dollar stablecoin. Customers add money by ACH or wire, keep a USDC balance, pay saved recipients, withdraw to their own bank account and, once available, spend with a virtual debit card. Moneta is not a bank. Accounts, wallets, transfers, cards, identity verification and compliance screening are provided through Dakota Platform. Moneta provides the app, the customer experience and customer support. We offer no lending, investment or yield products.

`[DEPENDS: Dakota confirming a consumer programme (A1 Q1). Its public Terms are commercial-only.]`

**If businesses first** (633 characters):

> Moneta is a financial technology company building a web app that lets US businesses hold, send and receive US dollars as USDC, a fully reserved dollar stablecoin. Teams add money by ACH or wire, keep USDC balances across named accounts, pay saved vendors and recipients with optional multi-person approvals, withdraw to their own bank account and, once available, spend with virtual debit cards. Moneta is not a bank. Accounts, wallets, transfers, cards, KYB and compliance screening are provided through Dakota Platform. Moneta provides the app, team controls and customer support. We offer no lending, investment or yield products.

## Account-usage description (400–1,024 characters, EDD)

848 characters:

> We will use the Dakota account to serve our customers through Dakota's platform. For each customer we create a Dakota customer record and send them to Dakota's hosted onboarding form, so Dakota performs KYC/KYB and collects its own agreements. After approval we create one wallet per customer on Base holding USDC, and an onramp account that gives the customer virtual ACH and wire details: incoming USD converts to USDC in that customer's own wallet. Customers withdraw to bank accounts they have linked, through Dakota one-off transfers, and can send USDC to saved recipients, which Dakota screens. Once Cards is enabled, customers can hold virtual debit cards that spend from their wallet. Moneta does not pool customer funds or hold balances in its own accounts. We expect [N] customers and about $[X] in monthly volume in the first six months.

Checked against the code on 2026-11-24:
- One wallet per customer, deposits into the customer's own wallet, no pooled wallet: true (`DAKOTA-PLAN.md`, `src/lib/dakota/provisioning.ts`). Moneta's "accounts" are labels within one customer's wallet.
- **Product gap:** linked bank accounts aren't checked to be in the customer's own name. Partners often require own-name withdrawals, and the research flags third-party payouts. Decide whether to add a name match before submitting. Until then, the text says "bank accounts they have linked", not "their own".

## Other EDD answers

| Field | Draft answer | Notes |
|---|---|---|
| Does the business issue tokens? | No | We hold and move USDC; we issue nothing |
| Top 5 customer countries | United States | `[DEPENDS: D9/D10]` Add others only if a non-US entity is planned |
| Purpose(s) of account | Sending and receiving payments; storage of funds or digital assets; making online payments | Choose from Dakota's list. Not "investing" |
| Source(s) of funds | `[Founder capital / SAFE / priced round]` | Must match the proof uploaded in B5 |
| Average monthly revenue | `[$0 – pre-launch]` | Be literal |
| Expected monthly deposits and volume | `[$X]` / `[N transactions]` | From the business plan |
| Verify customer identity? | Yes, through Dakota's hosted KYC/KYB | Say plainly that we rely on Dakota's programme |
| Monitor transactions? | Yes. Dakota screens and monitors every customer and payment. Moneta escalates unusual activity it sees in support to Dakota | Matches F3 and F4 |
| On-chain monitoring? | Yes, through Dakota's wallet-address screening | Blocked sends return `compliance-blocked` |
| Transacts on behalf of third parties? | Yes | This is what triggers EDD. Answer honestly |

## "Regulated?" and the unregulated justification (200–1,024 characters)

**Do not submit without the lawyer's sign-off.** Which answer applies depends on the custody redesign (`PRE-DAKOTA-PLAN.md` Section 8) and counsel's memo.

**Path A, if counsel concludes Moneta is not regulated** (only after the redesign; 345 characters):

> Moneta provides software and customer support only. Customer onboarding, identity verification, wallets, money transmission, card issuing and compliance screening are performed by Dakota Platform under its licenses. Moneta does not take possession of customer funds, does not pool them, and cannot move them without the customer's authorization.

Not true today: Moneta's server holds the only signing key for customer wallets, so the last sentence is false until the redesign ships.

**Path B, if Moneta registers** (as an MSB, or as Dakota's agent or authorised delegate): answer "Regulated: yes" with the country and licence type, e.g. "United States – FinCEN MSB registration [number]", plus any state licences or the agency agreement.

## Before submitting

- [ ] D9 decided and the matching description chosen
- [ ] Dakota answered A1 Q1 (consumer programme) and Q2/Q3 (custody and our role)
- [ ] Lawyer approved the "Regulated?" answer
- [ ] Volumes and source of funds filled from the business plan
- [ ] Own-name withdrawal decision made
- [ ] Every statement re-checked against the code on the day of submission

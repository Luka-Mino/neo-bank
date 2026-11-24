> DRAFT – for counsel review. Not legal advice.
> Date: 2026-11-24 · Status: DRAFT – for counsel · Owner: [CEO] · Version 0.1

# F6: Wind-down plan

**Entity:** [ENTITY NAME] ("Moneta"). **Approved by:** [BOARD] on [DATE]. **Next review:** [DATE], then yearly. Revise after the custody decision ([F5](F5-key-management-policy.md)).

## 1. Purpose

This plan says how Moneta would stop operating in an orderly way, so every customer gets their money and their records. Bank regulators expect "risk-based contingency plans" for a fintech partner's failure, including moving accounts and data to another party ([2024 Joint Statement](https://fdic.gov/joint-statement-third-party-deposit-products.pdf)). Partners will ask for this plan ([research notes Q4, item 11](<../research_notes/Moneta licensing and permits/federal_and_dakota_model.md>)).

## 2. Who does what

| Area | Dakota and its banks | Moneta |
|---|---|---|
| Customer funds | USDC sits in each customer's own Dakota wallet on Base. ACH runs through Dakota and Lead Bank | Holds no customer funds in its own accounts. No pooled wallet |
| Signing sends | Enforces wallet policies | Design A (today): signs every send. Nothing moves without Moneta's server |
| Identity and transaction records | Keeps its own under its programme | Keeps the app's records (§9) |
| Customer contact | Can contact users directly where law requires `[DAKOTA: confirm]` | Runs all notices and support |

## 3. The constraint that shapes this plan

**Under Design A, customers cannot withdraw without Moneta.** Moneta's server holds the only key, so the app, the database, the signing key and Dakota access must all keep working until the last balance is out. That is the main reason this plan needs funding (§5).

- **Design B** (the user's passkey must sign): customers can still sign, but they need some interface to Dakota if Moneta's app is gone. `[DAKOTA: can end users reach their wallets directly, or through another platform?]`
- **Design C** (Dakota hosts the wallet): Dakota could release funds without Moneta.

The report names this as a reason to redesign: users could then withdraw through Dakota if Moneta failed ([report](<../reports/Moneta licensing and permits.md>)).

## 4. Triggers and early warnings

**Triggers.** The board decides to stop. Dakota gives notice to end the relationship. A regulator orders it. Funding runs out. An unrecoverable security incident happens.

**Early warnings,** reviewed monthly by [CEO]:
- cash runway under [6] months;
- a Dakota breach notice or contract dispute;
- a regulator inquiry;
- a sustained loss of key staff;
- a Dakota outage longer than [X] days.

Each warning prompts a board discussion. A trigger starts this plan.

## 5. Funding the wind-down

- Keep a reserve that covers the whole wind-down: hosting (Vercel, Supabase), Dakota fees, email, staff or contractors to run support and signing, legal fees, and record storage. [Amount: finance to size; proposal at least [4] months of running costs.]
- Benchmark: a national trust charter requires capital for 180 days of wind-down costs ([report, path 6](<../reports/Moneta licensing and permits.md>)). This is not a requirement for Moneta.
- `[COUNSEL: should the reserve be ring-fenced, for example in a separate account or by board resolution?]`

## 6. Timeline

T = the day customers are notified. Periods are proposals. `[COUNSEL: minimum notice under state law and the Terms. The Terms (clause 15) cover closing one account but not ending the service; add a clause.]`

| When | Step | Owner |
|---|---|---|
| Before T | Board resolution. Tell counsel, Dakota (as the contract requires) and insurers. Freeze sign-ups and new products. Reconcile every customer: Moneta's account balances against the on-chain wallet and Dakota's records (`/api/dakota/reconcile`; ledger-drift check) | [CEO], [ENGINEERING LEAD] |
| T | Send the notice (§7) by email, in-app banner and website. Stop issuing cards. Cancel recurring transfers. Expire pending team invites and approvals | [CEO], [SUPPORT LEAD] |
| T to T+30 days | Withdrawals stay open. Weekly reminders. Extra support hours. Ask Dakota to close deposit details (virtual ACH and wire) at T+30. Return deposits that arrive later | [SUPPORT LEAD] |
| T+30 to T+[60] days | Contact everyone with a balance one by one. Close cards after the final settlement and dispute window `[COUNSEL + DAKOTA: window]` | [SUPPORT LEAD] |
| End date (T+[60]) | No new activity except withdrawals and data export. Remaining balances follow §8 | [CEO] |
| After | Keep records (§9). Destroy keys only after Dakota confirms every wallet is empty or transferred ([F5](F5-key-management-policy.md)). Delete other data on schedule ([F2](F2-information-security-program.md) disposal) | [ENGINEERING LEAD] |

## 7. What the customer notice says

- The date the service ends, and the last day to withdraw.
- How to withdraw (§8), step by step. Moneta charges no wind-down fees `[DECIDE]`. State any Dakota or network fees.
- That 2FA and a verified email are needed to move money (`assertMfaEnabled`, `assertEmailVerified`), with a link to set them up.
- The card's end date. Recurring transfers stop at T.
- How to download their data (§9).
- What happens to money not withdrawn (§8).
- Support contact, and how to complain ([F3](F3-complaints-policy.md)).
- Business accounts: send the notice to every owner and admin.
- `[COUNSEL: required content and any regulator notice.]`

## 8. How customers get their money out

1. **To their bank:** the normal withdrawal (`POST /api/transactions`). It sends USDC from the customer's wallet to a Dakota one-off transfer, which pays out by ACH to a linked bank.
2. **To an outside wallet:** an on-chain USDC send, screened by Dakota.

**Things that can block a withdrawal:**
- **Proof-of-address limit.** Dakota freezes customers who move over $3,000 in a rolling 7 days without approved proof of address. Tell customers to upload it early.
- **Compliance holds.** Dakota decides these. Don't explain why a customer is held ([F4](F4-aml-sanctions-policy.md) §6).
- **Deceased customers.** Use an estate process `[COUNSEL]`.
- **Transfers still in flight.** Let them settle. Watch for ACH returns after closure.

**Balances nobody claims by the end date:**
- Never move them into a Moneta-controlled wallet.
- Options: Dakota takes over the customer relationship, or a successor platform does, with the customer's consent. Otherwise the balance goes to the state as unclaimed property.
- `[COUNSEL: unclaimed-property rules for USDC, and who holds the duty: Moneta or Dakota.]`
- `[DAKOTA: can customers be moved to another platform or straight to Dakota?]`
- Under Design A, Moneta keeps the signing service running until this is settled.

## 9. Data export and records

- **Export:** customers download a JSON file from `/api/users/data`. Gap: it does not include support requests. Add them before relying on it. Keep the export open for [12] months after the end date `[COUNSEL]`.
- **Records to keep after closing:**
  - transactions and the audit log: at least 5 years;
  - sanctions records: 10 years ([F4](F4-aml-sanctions-policy.md) §8);
  - complaints ([F3](F3-complaints-policy.md) §9).
- Move records to low-cost encrypted storage. Name a custodian, [RECORDS CUSTODIAN], who can answer regulators and law enforcement after Moneta closes.

## 10. Testing

Every year, run a tabletop exercise on this plan with [ENGINEERING LEAD], [SUPPORT LEAD] and [CEO]:
- Check that a withdrawal works end to end in the sandbox.
- Check that the reserve still covers the wind-down.
- Check that Dakota's contacts are current.

Record the findings.

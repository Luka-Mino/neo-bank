> DRAFT – for counsel review. Not legal advice.
> Date: 2026-11-24 · Status: DRAFT – for counsel · Owner: [COMPLIANCE CONTACT] · Version 0.1

# F9: Marketing review checklist

**Entity:** [ENTITY NAME] ("Moneta"). **Approved by:** [CEO] on [DATE]. **Next review:** [DATE], then yearly.

## 1. Scope

Anything a customer or the public can see that describes Moneta, its money or its security. That includes:
- the website and in-app copy;
- app store listings;
- emails and push notifications;
- social posts and ads;
- press releases;
- card art;
- support macros.

Bank regulators list "potentially misleading statements and marketing … particularly when they refer to FDIC deposit insurance" as a key fintech risk ([2024 Joint Statement](https://fdic.gov/joint-statement-third-party-deposit-products.pdf)). State attorneys general and the FTC can act on unfair or deceptive claims whatever the CFPB is doing ([research notes §2](<../research_notes/Moneta licensing and permits/us_consumer_privacy_operational.md>)).

## 2. Who does what

| Step | Moneta | Dakota, bank, network |
|---|---|---|
| Draft and review | Author, then [COMPLIANCE CONTACT]. Counsel for new claims | — |
| Pre-approval | Sends the material and keeps the approval | Expected under the private platform agreement `[DAKOTA: confirm scope]`. Peers require it: Bridge's agreement says materials must be "approved by Bridge in advance" ([Bridge](https://bridge.xyz/legal/developer-agreement)) |
| Card material and card art | Sends it | Dakota, the issuing bank and Visa each approve. Visa's approval does not replace our own legal review ([research notes §5](<../research_notes/Moneta licensing and permits/us_consumer_privacy_operational.md>)) |

## 3. Sign-off workflow

1. The author fills in the checklist (§8) and attaches the exact final copy or a screenshot.
2. **Every security claim:** [ENGINEERING LEAD] confirms it against the code and names the file. The `/security` page already does this in a code comment.
3. [COMPLIANCE CONTACT] reviews. Anything new about custody, safety, backing, fees, rewards or regulation goes to counsel, and [CEO] signs.
4. Get Dakota's approval, and the bank's or network's for card material, where required.
5. Publish only the approved version. Log it (§9).
6. Re-review live copy every year, and whenever the product, the custody design or the law changes.

## 4. Words and claims we don't use

| Don't say | Why | Say instead |
|---|---|---|
| "bank", "banking", "banker", "neobank" (except "not a bank", or "your bank" for the customer's own outside bank) | State laws restrict these words for non-banks, for example Illinois 205 ILCS 5/46 with up to $10,000 per violation. California made Chime stop and required a "not a bank" disclosure from Dora. Canada bans them outright (Bank Act s.983) ([report](<../reports/Moneta licensing and permits.md>)) | "money app", "wallet", "financial technology company" |
| "FDIC-insured", "insured", "FDIC" outside the disclaimer | Any person implying FDIC insurance breaks 12 CFR 328.102, and leaving out key facts counts. The GENIUS Act treats implying federal insurance as a violation of 18 U.S.C. 709 (12 U.S.C. 5903(e)(2)) | "not FDIC-insured" |
| "guaranteed", "government-backed", "risk-free", "safe", "as safe as a bank", "protected" (about funds) | 12 U.S.C. 5903(e)(2)(A); unfair or deceptive practices | Describe the specific control, for example "Two-step sign-in" |
| "backed 1:1", "fully backed", "fully reserved", "dollar-backed", "always worth $1" | These are claims about Circle's reserves, which Moneta cannot check or guarantee. `[COUNSEL: may we repeat Circle's own statement with attribution and a link?]` | "USDC, a stablecoin issued by Circle and designed to track the US dollar" `[COUNSEL]` |
| "legal tender", "digital dollar(s)" | USDC is not legal tender. "Digital dollar" may suggest a government currency. Permitted issuers may not market a stablecoin as legal tender (5903(a)(9)(A)) `[COUNSEL: is "digital dollar" acceptable for us?]` | "USDC" or "stablecoin" |
| "payment stablecoin" | Unlawful to market a product as a payment stablecoin unless it is issued under the GENIUS Act. Up to $500,000 per knowing violation (5903(e)(3)); effective 18 January 2027 | "stablecoin" |
| "interest", "yield", "APY", "earn on your balance", "savings account" | GENIUS Act yield ban and the OCC's October 2026 rule. Rewards are on hold (plan 1c.4) | Nothing. No rewards copy without counsel |
| "non-custodial", "self-custody", "you control your funds", "only you can move your money" | False while Moneta's server holds the only key. That is deceptive ([research notes Q5](<../research_notes/Moneta licensing and permits/federal_and_dakota_model.md>)) | Nothing, until Design B ships and counsel signs off ([F5](F5-key-management-policy.md)) |
| "licensed", "regulated" about Moneta | Moneta holds no licence | "Regulated services are provided by Dakota Platform, Inc." |
| "Checking", "Savings" | Bank deposit-account names. `[COUNSEL: allowed for a non-bank in our states?]` (plan 1c.1 follow-up) | e.g. "Everyday", "Set-aside" |
| "free", "instant", "no fees", "anytime" | Must be true in every case, or carry the condition right next to it | State the condition |

## 5. Required disclosures

| Disclosure | Where | Source |
|---|---|---|
| "Moneta is a financial technology company, not a bank." | Footer of every page, the app's About screen, app store listing | Practice; DFPI Dora order; 12 CFR 328.102(b)(5)(ii) when FDIC is mentioned |
| Who provides regulated services: Dakota Platform, Inc., NMLS #2727274, with links to Dakota's licences page and NMLS Consumer Access | Footer, Terms | Peer practice (Bridge, Plasma). `[COUNSEL + DAKOTA: final wording, which also depends on the custody design]` |
| "USDC is not a bank deposit, is not FDIC-insured, and may lose value." | Next to every balance, and on deposit screens | 12 CFR 328.102(b)(5)(iii). `[COUNSEL: is "may lose value" required for USDC? The research says keep it]` |
| State virtual-currency notice, for example: "Virtual currency is not legal tender, is not backed by the United States government, and accounts and value balances are not subject to FDIC or SIPC protections." | Sign-up, Terms, and wherever each state requires it | State rules, as shown on [Dakota's licences page](https://www.dakota.xyz/licenses) |
| Card issuer and network wording | Card pages, card art, footer (placeholder exists) | Dakota's card programme, once live |
| State complaint and regulator contacts | Terms, Help | [Dakota's licences page](https://www.dakota.xyz/licenses); [F3](F3-complaints-policy.md) |
| A fee schedule link wherever a price or "free" appears | Same place as the claim | Unfair or deceptive practices |

If FDIC is ever mentioned beyond the disclaimer, the 328.102(b)(5) items are also required: name the insured bank, say FDIC insurance covers only that bank's failure, and state the conditions for pass-through cover. The simpler rule: don't mention it.

## 6. Live copy to fix before launch (found 2026-11-24)

| Where | Current text | Problem |
|---|---|---|
| Site footer (`src/components/bank-site/site-footer.tsx`) | "a dollar-backed digital currency fully reserved by its issuer with cash and short-term US government securities" | Backing claim (§4) |
| Site footer | "Accounts, deposits and transfers are powered by Dakota's regulated infrastructure and its banking partners" | Doesn't name the licensed entity or its NMLS number (§5) |
| `/security` (`src/app/(marketing)/security/page.tsx`) | Title "Your money, protected by default". The "Fully reserved" card. "fully reserved digital dollars" in the lead and the meta description | "protected"; backing claim; "digital dollars" |
| `/security` | "Sign-in attempts are rate-limited, so repeated password guesses get locked out." | Overstated: limits are kept in each server's memory until plan C2 ships |
| `/security` | "you can withdraw to your bank whenever you like" | Dakota's proof-of-address freeze, compliance holds and ACH timing |
| `/how-it-works` | "fully-backed digital dollars", "fully reserved" | Backing claim |
| `/app/move/deposit` | "a dollar-backed digital currency fully reserved by its issuer" | Backing claim |
| App home (`src/app/app/page.tsx`) | "held as USDC and isn't FDIC-insured" | Add "not a deposit" and "may lose value" |
| Homepage, account types | "Checking", "Savings" | Waiting on counsel |

## 7. Emails and texts

- **Keep transactional messages and marketing apart.** Transactional messages are sign-in links, codes, receipts and alerts.
- **Marketing email (CAN-SPAM):** include an unsubscribe link and a postal address, and honour opt-outs. Up to $53,088 per violating email ([FTC](https://www.ftc.gov/business-guidance/resources/CAN-SPAM-act-compliance-guide-business)).
- **Marketing texts:** need prior express written consent. From 31 January 2027, "STOP" must stop every message type (FCC revoke-all rule) ([research notes §4](<../research_notes/Moneta licensing and permits/us_consumer_privacy_operational.md>)).

## 8. Reviewer checklist

- [ ] No word or claim from §4, or counsel has approved the exception in writing.
- [ ] Every disclosure from §5 that applies is present and close to the claim it qualifies.
- [ ] Every security or product claim matches the code today. File named: ______.
- [ ] Fees, limits and timings are stated with their conditions.
- [ ] Nothing suggests Moneta holds a licence, is a bank, or that funds are insured or guaranteed.
- [ ] Nothing about rewards, yield or "earning".
- [ ] Custody wording matches the current design ([F5](F5-key-management-policy.md)).
- [ ] For card material: Dakota, bank and Visa approvals attached.
- [ ] Dakota pre-approval attached where the contract requires it.
- [ ] For email or text: correctly classed as transactional or marketing, with consent and opt-out in place.

## 9. Records

Keep a marketing review log for [5] years after the material is withdrawn `[COUNSEL]`. For each item, record:
- the item and channel;
- the final copy or a screenshot;
- the reviewer and date;
- counsel's, Dakota's and the bank's approvals, with their references;
- the publish date and withdrawal date.

Complaints that point to confusing copy come back here through the [F3](F3-complaints-policy.md) monthly review.

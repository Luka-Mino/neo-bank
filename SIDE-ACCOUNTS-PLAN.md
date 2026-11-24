# Side Accounts Plan (main account + Rain-style side accounts)

> Decided 2026-11-24 (D18 in `PRE-DAKOTA-PLAN.md`). Everyone starts with one
> **main account** and one card. Customers can open **side accounts**, each
> with its own balance and its own **virtual card** (digital only). Each
> account is its own Dakota wallet, so a card can only spend its own
> account's money. To pay from a different pot, pick that account's card in
> Apple Pay / Google Pay.

## How it maps onto Dakota

| Moneta | Dakota | Notes |
|---|---|---|
| Main account | The customer's first wallet (created at onboarding, as today) | Holds the deposit details (onramp → this wallet). Fixed: it can't be swapped for another account |
| Side account | A new wallet for the same customer | Same signer group and policy as the main wallet (changes with the custody redesign) |
| Card | A card funded by one wallet | A side account's card is created on its wallet. Each wallet needs a one-time card permission signed by the customer |
| Move money between your accounts | Wallet-to-wallet send | Seconds and a small network fee. Replaces today's database book entry when the wallets differ |
| Deposits | Onramp to the main wallet | Per-account deposit details only if Dakota supports one onramp per wallet (asked) |

Facts from Dakota's docs (2026-11-24): several wallets per customer; "a card is funded by one wallet"; many cards per person (unpublished maximum, `limit-reached`); card permission is "a one-time grant, signed by the customer for each wallet"; cards are virtual only and still sandbox-only.

## Phase 1: build now (no Dakota sandbox needed) ✅ in progress

Everything is tested with Dakota stubbed out and fully clickable in demo mode.
A setting keeps today's behaviour until Phase 2 switches it on:
`SIDE_ACCOUNT_WALLETS=shared` (default: side accounts share the main wallet,
as today) or `dakota` (each side account gets its own Dakota wallet).

1. **Data model (migration 0022):** `accounts.wallet_id` (which wallet holds this account's money; null = the main wallet), with a same-org composite FK and one account per wallet. New account status `opening` while its wallet is being created.
2. **Open a side account** (`src/lib/side-accounts.ts`): insert the account as `opening` → create its Dakota wallet (idempotent per account) → store the wallet and mark the account `active`. If Dakota fails mid-way, the account stays `opening` and the same call resumes it. In `shared` mode the account is simply created on the main wallet.
3. **Cards follow their account:** card issuing resolves the wallet from the card's account, not "the customer's wallet".
4. **Transfers between accounts:** route by wallet. Same wallet → today's instant book entry. Different wallets → refused with a clear message until Phase 2 builds the on-chain transfer, so money can't be moved the wrong way.
5. **Screens:**
   - "Open a side account": name it; it comes with its own virtual card.
   - Accounts show their card.
   - The card screen labels each card with its account, and the "Pays from" switch is removed.
   - The main account can't be swapped ("Make this my primary account" is removed).
   - Demo: every account has its own virtual card.
6. **Copy:** money moves between your accounts "in seconds" (no longer "instantly … never cost anything").

## Phase 2: with Dakota's sandbox

1. **On-chain transfers between accounts:** hold the amount on the source, send wallet-to-wallet (signed like other wallet sends, idempotent per transfer), credit the destination when `wallet.transaction.updated` confirms, and refund the source if it fails. The same route serves approvals and recurring transfers.
2. **Card permission per wallet:** the customer signs the one-time grant when a side account opens (part of the custody redesign: platform key or the customer's passkey), then its card is issued automatically.
3. **Close a side account:** move the balance to the main account, close its cards, mark it closed (the Dakota wallet stays for records).
4. **Balances:** reconcile each side account against its wallet's on-chain balance (`card.available` for spending).
5. **Drill:** open a side account → card → move money in → spend → move money back → close it, then switch `SIDE_ACCOUNT_WALLETS=dakota` on.

## Open questions for Dakota (in `PRE-DAKOTA-PLAN.md` A1 Q6)

- Maximum active cards per person?
- Any per-wallet fees?
- Can each wallet have its own deposit details (onramp)?
- Can a card move to another wallet?
- May the platform signer sign the card permission, or must the customer?

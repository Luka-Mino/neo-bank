# Dakota webhook fixtures

Realistic Dakota event envelopes (shapes taken from docs.dakota.xyz webhook and
API-reference examples) for driving the webhook pipeline locally via:

```
npx tsx scripts/dakota-simulate-webhook.ts --fixture deposit-completed
```

Before running against your dev database, replace the `REPLACE_WITH_*`
placeholders with real ids from your local rows:

- `REPLACE_WITH_DAKOTA_CUSTOMER_ID` → `dakota_customers.dakota_customer_id`
- `REPLACE_WITH_DAKOTA_ACCOUNT_ID` → `dakota_rails.dakota_account_id`
- `REPLACE_WITH_DAKOTA_WALLET_ID` → `wallets.dakota_wallet_id`

The simulator refreshes `id`/`created` on every run (so the inbox doesn't
dedupe repeats); pass `--keep-id` to test dedup behavior. The deposit
lifecycle is meant to be replayed in order: `deposit-pending` →
`deposit-completed` (credits the primary account once — rerunning it must NOT
double-credit) → `deposit-returned` (claws the credit back).

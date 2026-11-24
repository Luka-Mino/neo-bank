# Moneta

Moneta is an everyday money app: named accounts, each with its own Visa debit
card, and transfers in and out of US bank accounts. Balances are held as USDC
in wallets on [Dakota](https://docs.dakota.xyz)'s platform, which handles
identity checks (KYC), wallets, bank rails and cards.

**Wording rules for anything a customer reads:** never call Moneta a bank or
say "banking"; balances are USDC and are **not FDIC-insured**; accounts are
just named accounts (no "Checking" or "Savings"). Details:
`docs/plans/LAUNCH-READINESS-PLAN.md` §1b–1c.

## Quick start (demo mode, about 2 minutes)

Demo mode runs every screen on sample data (`src/lib/demo-data.ts`) and skips
sign-in. No database or Dakota keys are needed.

```bash
npm install
cp .env.example .env.local      # then set AUTH_SECRET: openssl rand -base64 32
npm run dev
```

Open <http://localhost:3000> for the public site and
<http://localhost:3000/app> for the signed-in app.

Requires Node 22+. CI installs with the npm that ships with Node 22 (npm 10).
When you add or remove packages, use npm 10 too (`npx npm@10 install …`) so
`package-lock.json` stays readable by CI's `npm ci`.

## Running against a real database

1. Install Postgres 16 and create a database, e.g. `moneta`.
2. Apply migrations **as the database owner**:
   `DATABASE_URL=postgresql://<owner>@localhost:5432/moneta npm run db:migrate`
3. Create the two app roles: copy `scripts/sql/db-roles.sql`, replace both
   passwords, and run it as the owner (`psql <owner url> -f <your copy>`).
4. In `.env.local`:
   - `DATABASE_URL` → the `moneta_app` role (row-level security applies);
   - `SYSTEM_DATABASE_URL` → the `moneta_system` role (background jobs);
   - `NEXT_PUBLIC_DEMO_MODE=false`;
   - `BYPASS_KYC=true` to skip identity verification locally (ignored in
     production).
5. `npm run dev`, register an account at `/register`.

Deposits, withdrawals, wallets and cards need a Dakota sandbox API key, then
`npm run dakota:bootstrap` once. Until then, use demo mode or the webhook
simulator (`npm run dakota:webhook`, payloads in `fixtures/dakota/`).

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` / `npm start` | Production build / serve it |
| `npm test` | Unit tests (Vitest) |
| `npm run test:integration` | Integration tests against Postgres (see Testing) |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run check:db` | Row-level security guard (see Conventions) |
| `npm run db:migrate` | Apply `drizzle/` migrations (run as the DB owner) |
| `npm run dakota:bootstrap` | One-time Dakota setup: signer key, signer group, policy |
| `npm run dakota:webhook` | Send a signed test webhook to a local server |
| `npm run dakota:reconcile` | Replay missed Dakota events |
| `npm run keys:reencrypt` | Re-encrypt stored fields after a key rotation |

## Testing

- **Unit:** `npm test`. Integration tests are skipped unless `INTEGRATION=1`.
- **Integration:** need a migrated database with the roles from step 3, and run
  as the restricted role so row-level security is really enforced:

  ```bash
  INTEGRATION=1 RLS_REQUIRED=1 \
  DATABASE_URL=postgresql://moneta_app:…@localhost:5432/moneta \
  SYSTEM_DATABASE_URL=postgresql://moneta_system:…@localhost:5432/moneta \
  npm run test:integration
  ```

- **CI** (`.github/workflows/ci.yml`) runs on every push and pull request:
  - secret scan (gitleaks) and `npm audit`;
  - typecheck, lint and `check:db`;
  - unit tests and a production build;
  - integration tests against Postgres 16, as `moneta_app`.

## Project layout

```
src/
  app/                      Next.js App Router
    page.tsx                Public homepage
    (marketing)/, (public)/ How it works, Security, Terms, Privacy
    (auth)/                 Sign in, register, magic link, password reset
    app/                    The signed-in app (/app): accounts, move money, card, more
    api/                    API routes (one folder per resource)
    design/                 Internal pages for making the share image and app icon
  components/
    app/                    Building blocks of the signed-in app (sheets, pickers, flows)
    brand/                  Design system: Button, Icon, card artwork
    bank-site/              Public-site header, footer and page parts
    account/                Account and card data hooks, add-bank dialog
    layout/, shared/, dev/  Providers, session timeouts, logo, dev-only banner
    ui/                     Generated shadcn kit, used only by the sign-in pages
  lib/
    api-handler.ts          Wrapper every API route uses (see Conventions)
    db/                     Drizzle schema, connections, withOrg (row-level security)
    dakota/                 Dakota API client, signing, webhooks, reconcile
    auth/                   NextAuth config, 2FA, passwords, sessions, ownership checks
    crypto/                 Field encryption and keyed hashes (versioned keyrings)
    validators/             Zod schemas for API input
    side-accounts.ts, transfers.ts, card-issuer.ts, …   Domain logic
    demo-data.ts            Sample data for demo mode
  proxy.ts                  Next 16 "middleware": CSP and sign-in redirects
drizzle/                    SQL migrations (+ meta/_journal.json)
scripts/                    Dakota setup, webhook simulator, reconcile, DB guard, SQL roles
fixtures/dakota/            Sample Dakota webhook payloads
compliance/                 Policy drafts for counsel (F1–F9)
reports/, research_notes/   Licensing research
docs/                       Plans, references, runbooks: see docs/README.md
```

## Conventions

**This is Next.js 16.** APIs differ from older versions (for example
`proxy.ts` replaces `middleware.ts`). Check `node_modules/next/dist/docs/`
before using a Next API you haven't used here (see `AGENTS.md`).

**API routes** go through `apiHandler` (`src/lib/api-handler.ts`). It handles:
- sign-in, rate limits, and Zod validation (`schema`);
- with `orgScoped: true`, the active org and role or capability checks, and the
  handler runs inside a row-level-security transaction (`ctx.db`).

Responses use `ok(data)` and `err(message, status, { reason })`, which give
`{ success, data }` or `{ success: false, error: { message, reason } }`.

**Data isolation (row-level security).** Customer data is scoped by
`org_id`, and Postgres only shows the current org's rows.
- In an `orgScoped` route, use `ctx.db`, never the global `db`.
- A route that calls Dakota is not `orgScoped`, so no transaction is held open
  during the HTTP call. Wrap each database step in
  `withOrg(orgId, (tx) => …)` instead.
- `systemDb` bypasses row-level security. Only the files allowlisted in
  `scripts/check-db-access.mjs` may use it; `npm run check:db` enforces this
  in CI.
- Background: `docs/reference/ORG-FOUNDATION-SPEC.md`.

**Migrations** are hand-written SQL in `drizzle/NNNN_name.sql`. For each one:
- add an entry to `drizzle/meta/_journal.json`;
- make the same change in `src/lib/db/schema.ts`;
- don't use `drizzle-kit generate`: its snapshots stop at 0013, so it would
  produce a wrong diff.

**Dakota.** All calls go through `src/lib/dakota/client.ts`.
- Writes carry an idempotency key; use `deterministicIdempotencyKey(scope)`
  when a retry must not repeat the action.
- Webhooks arrive at `/api/webhooks/dakota` and are verified with Ed25519.
- A daily cron reconciles missed events (`vercel.json`).
- Check what Dakota already does before building KYC, consent, disputes or
  custody yourself.
- Reference: `docs/reference/DAKOTA-PLAN.md`.

**Accounts and cards.** Every org has one main account (deposits land there)
and up to 10 side accounts. Each account has one card that spends only that
account's money. See `docs/plans/SIDE-ACCOUNTS-PLAN.md`.

**Demo mode.** Client hooks check `DEMO_MODE` and return sample data. When you
add a screen, make it work in demo mode too.

**Pages are private by default.** `src/proxy.ts` sends signed-out visitors to
`/login` unless the path is listed in `src/lib/route-access.ts`. Sessions end
after 30 minutes idle or 2 hours total (`src/lib/auth/session-policy.ts`).
Old URLs redirect via `src/lib/legacy-routes.ts`.

**Secrets** are read through `src/lib/secrets.ts` and checked at startup.
Every variable is listed in `.env.example`; real values go in `.env.local`,
which is never committed.

## Feature switches

| Variable | Values | Effect |
|---|---|---|
| `NEXT_PUBLIC_DEMO_MODE` | `true` / `false` | Sample data, no sign-in |
| `ISSUING_PROVIDER` | `mock` / `dakota` | Fake card numbers, or real Dakota Cards (sandbox only) |
| `SIDE_ACCOUNT_WALLETS` | `shared` / `dakota` | Side accounts share the main wallet, or get their own Dakota wallet |
| `BYPASS_KYC` | `true` / `false` | Dev only: treat every user as identity-verified |

## Where to read next

- `docs/README.md`: index of plans, references and runbooks.
- `docs/plans/PRE-DAKOTA-PLAN.md`: what is being worked on now.
- `docs/plans/BACKLOG.md`: ideas and known gaps, good first tasks.
- `SECURITY.md`: reporting a vulnerability.

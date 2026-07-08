# Moneta — Session Handoff

Read this on day one of a new session. It captures where we left off, what's
been built, what's intentionally deferred, and the gotchas.

> **Update 2026-07-08**: current work queue lives in `ROADMAP.md`; the Dakota
> integration reference (API sequences, module designs, gotchas) is
> `DAKOTA-PLAN.md`. The real Dakota integration is now built (signing,
> webhooks, provisioning, bootstrap — commits c88c185/6a6afe2/ffb5ed7) and
> waiting on sandbox credentials. Two corrections to the paragraph below:
> Dakota wallets are **non-custodial** (we hold a platform signer key that
> authorizes sends — see `src/lib/dakota/signing.ts`), and cards are
> **mocked**, not on Visa (needs a separate issuing partner; see ROADMAP).

## What is Moneta

A stablecoin neobank built on top of Dakota's infrastructure APIs. The user
holds USDC in a custodial wallet (Dakota), but the UX is per-account
banking: Checking, Savings, Vacation fund, etc. Internal transfers between
accounts are atomic book entries (no on-chain footprint); send/deposit/
withdraw move funds through Dakota's rails. Cards run on Visa.

## Stack

- **Next.js 16** (Turbopack), App Router. **NOT** the old Next you may know
  — `AGENTS.md` notes breaking changes; check `node_modules/next/dist/docs`
  before reaching for old patterns.
- **Drizzle ORM** + Postgres (Supabase pooler).
- **NextAuth** (JWT credentials).
- **Tailwind v4** + shadcn-style components in `src/components/ui/*`.
- **Base UI** (`@base-ui/react`) for Dialog, DropdownMenu, etc. — these are
  primitive-driven, not Radix.
- **TanStack Query** for client cache.
- **react-hook-form** + zod for forms.

## How to run

```sh
cd "/Users/lucasmac/Desktop/neo bank"
PORT=3001 npm run dev
```

Lawzy uses :3000 — Moneta is always on :3001 to avoid the collision.

Default landing page: <http://localhost:3001/dashboard>. The demo user lands
on Checking ($8,250.18) automatically.

## Environment flags (.env.local)

| Flag | Effect |
|---|---|
| `NEXT_PUBLIC_DEMO_MODE=true` | Read seed data from `src/lib/demo-data.ts` instead of hitting the DB. Mutations use `queryClient.setQueryData` so the UI updates as if the API responded. |
| `BYPASS_KYC=true` | Treats every authenticated user as KYC-active. The amber dev banner at the top of every page shows this is on. Hard-gated by `NODE_ENV !== "production"`. |

Currently both are on. To test against the real DB, flip `NEXT_PUBLIC_DEMO_MODE=false`
— but you'll need a real session in the browser, since the API requires auth.

## Architecture invariants

- **One Dakota wallet per user.** Per-account balances live at the Moneta
  layer (book-keeping) — see `src/lib/db/schema.ts` (`accounts.balance`).
- **Internal transfers are atomic.** `POST /api/transfers/internal` runs
  inside a single DB transaction with optimistic-lock `WHERE balance >= amount`.
  See `src/app/api/transfers/internal/route.ts`.
- **One primary account per user, enforced by partial unique index**
  `WHERE is_primary=true AND status<>'closed'`. PATCH-setPrimary demotes
  the previous one atomically.
- **Ownership checks at the service layer.** `assertAccountOwnership` /
  `assertCardOwnership` in `src/lib/auth/ownership.ts` — every API handler
  that touches a specific row goes through these.

## Multi-account UI model

URL-driven scope. The query param `?account=<id>` (or `?account=all`)
controls what the page shows.

- **Source of truth:** `useSelectedAccountUrl` in
  `src/components/account/use-selected-account-url.ts`. Re-exported as
  `useSelectedAccount` from `use-accounts.ts`.
- **No `?account=` present** → resolves to the user's primary account.
- **Bad id** → silently `router.replace`s to primary (cleans the URL so
  shareable links don't 404).
- **Cross-page nav preserves scope** via `withAccountParam(href, searchParams)`
  in `src/components/account/with-account-param.ts`. Sidebar links and
  dashboard quick actions both use it.

The **AccountSwitcher** at the top of the sidebar is the primary control
for changing scope. The **NewAccountDialog** is mounted once at the root
(via `NewAccountDialogProvider` in `providers.tsx`) so its state survives
navigation. Open it from anywhere via `useNewAccountDialog().open()`.

## Pages — what's multi-account aware

| Page | Scope behavior |
|---|---|
| `/dashboard` | Hero balance, transactions feed, currency strip all scope to `?account=`. Aggregate mode shows merged feed with per-row account chips. |
| `/accounts` | Always shows all accounts (it's the management page). |
| `/transactions` | Feed filters by account. Aggregate mode adds a per-row chip ("Checking" / "Savings"). |
| `/card` | Cards filter by linked account. Reassign menu lets you move a card between accounts. Empty state ("Issue your first card") when account has zero cards. |
| `/send`, `/deposit`, `/transfer-out` | `SourceAccountPicker` defaults to scoped account (or primary). |
| `/transfer-internal` | Two pickers, From defaults to scoped, To defaults to first non-From. |
| `/insights` | Period + account filter; period-aware eyebrow ("April spending in Savings", "Last month's spending across all accounts", etc). |
| `/loans` | Coming-soon page; doesn't read scope (no flow to scope yet). |
| `/settings` | User-scoped (name, email, password). No account scope. |

## Recent feature work (in order, most recent first)

1. **Lane 2 — `/insights` rewrite, `/loans` copy fix** (this session)
   - `/insights` reads `?account=`, period-aware eyebrow, fixed pre-existing
     date-range bug (Last Month was leaking into This Month), added
     `internal_in`/`internal_out` to income/outflow buckets.
   - Hero number no longer mixes real `stats.outflows` with the fake
     `totalSpent` fallback.
   - "Spending by category $X total" picks option (a): both the breakdown
     and its total are placeholder, internally consistent. Will become real
     together when categorization ships.
   - `/loans` step 3 copy: "your Moneta account" → "the account you choose".
   - `/settings` left alone — user-scoped.
2. **Demo-mode mutation handling**
   - `NewAccountDialog` and `transfer-internal/page.tsx` now use
     `queryClient.setQueryData` instead of API calls when `DEMO_MODE` is on,
     and skip the invalidate (which would clobber the cache by re-running
     the static `DEMO_ACCOUNTS` queryFn).
   - This makes all account/transfer flows verifiable end-to-end in demo
     mode without a real DB.
3. **#52 Transactions multi-account propagation**
   - `/transactions` page filters by `?account=`, adds per-row chips in
     aggregate mode.
4. **#51 Cards multi-account propagation**
   - `/card` is fully DB-backed via `useCardsQuery`. Multi-card chip rail at
     top, `?card=<id>` selection. Reassign menu, real freeze/unfreeze, real
     "Issue virtual" via `POST /api/cards`.
5. **Lane 1 — full multi-account UI** (AccountSwitcher, NewAccountDialog,
   `/accounts`, `SourceAccountPicker`, `/transfer-internal`, dashboard
   reactivity).
6. **Cleanup** — removed the dead `account-selection-provider.tsx`
   (localStorage-era; replaced by URL-param hook).
7. **`outline-ring/50` scoped to `:focus-visible`** in `globals.css` — was
   showing brand-green outlines on every clicked element. Now keyboard-only.
8. **Card visual overhaul** — `<MonetaCard />` is the single source of truth
   for card rendering (replaced 3 inline JSX duplicates). Uses the FULL
   Moneta lockup (icon + wordmark), no account name on the card front (a
   card isn't 1:1 with an account), concentric arcs as the brand motif.

## What's deliberately deferred

- **Card polish round 2** — make the card visual feel more Rain.xyz-distinctive
  (bolder typography, brand pattern, etc.). The user explicitly said wait
  until multi-account lands. It has, but they pushed it again to focus on
  multi-account propagation.
- **Marketing / landing polish** — Hero, FeaturesGrid, CardShowcase haven't
  been touched in a while. Copy is stale.
- **Real category data on /insights** — currently `sampleCategories` and
  `aiInsights` are hardcoded placeholders. Categorization is a separate
  feature.
- **Loans product flow** — currently a coming-soon page.
- **Real KYC integration** — bypass is on; real provider is the missing piece.
- **2FA, notification preferences, KYC docs** in `/settings`.

## Known dev gotchas

- **Turbopack file watcher occasionally stalls.** Symptom: edits to
  `moneta-card.tsx` (or other deeply imported files) don't reflect in the
  browser. Workaround: touch `src/lib/demo-data.ts` (any change) to trigger
  a Fast Refresh full reload, which flushes the SSR cache.
- **Two `next dev` processes will be running** if both Lawzy and Moneta are
  up. The "1 shell still running" indicator is the Moneta dev server
  (intentional, do not kill).
- **Base UI Menu's `DropdownMenuLabel`** must be inside `DropdownMenuGroup`,
  otherwise it crashes with a `MenuGroupRootContext is missing` error. Use
  a plain styled `<div>` for visual eyebrows. (Already worked around in
  `account-switcher.tsx`.)
- **Static prerender of `/_not-found`** fails if any client component using
  `useSearchParams()` is mounted at the root. Wrap such components in
  `<Suspense fallback={null}>` (see `new-account-dialog-provider.tsx`).
- **Dashboard segment is forced dynamic** (`export const dynamic = "force-dynamic"`
  in `src/app/(dashboard)/layout.tsx`) so the AccountSwitcher's
  `useSearchParams` doesn't break the build. Auth-scoped pages don't benefit
  from prerender anyway.

## Where to pick up next

Open question for the user. Reasonable next moves:

1. **Card polish round 2** — make the card visually distinctive in a Rain
   way. Brief lives in BACKLOG.md if it was added.
2. **Marketing polish sweep** — Hero / FeaturesGrid / CardShowcase /
   landing copy.
3. **Categorization on /insights** — real tx categorization (could be
   merchant-name → category mapping, manual override, etc).
4. **Loans flow (when product ready)** — would use the same
   `SourceAccountPicker` pattern for "deposit funds into" account selection.

Don't pick autonomously — ask which lane.

## Reference files (most-edited recently)

```
src/components/account/
  account-switcher.tsx              ← sidebar dropdown
  new-account-dialog.tsx            ← create-account form
  new-account-dialog-provider.tsx   ← root-mounted dialog + hook
  source-account-picker.tsx         ← reusable "From account" picker
  use-accounts.ts                   ← useAccountsQuery, useCardsQuery, etc
  use-selected-account-url.ts       ← URL-param selection hook
  with-account-param.ts             ← preserve ?account= across nav
  moneta-card.tsx                   ← card visual

src/app/(dashboard)/
  layout.tsx                        ← `dynamic = "force-dynamic"` here
  dashboard/page.tsx
  accounts/page.tsx                 ← list + manage
  transfer-internal/page.tsx        ← move funds
  card/page.tsx                     ← multi-card management
  transactions/page.tsx             ← filtered feed
  insights/page.tsx                 ← period + account scoped

src/components/layout/
  providers.tsx                     ← session + query + dialog providers
  sidebar.tsx                       ← AccountSwitcher mounted here

src/lib/
  demo-data.ts                      ← seed data, DEMO_MODE flag
  accounts.ts                       ← ACCOUNT_TYPES, generateAccountNumber
  auth/ownership.ts                 ← assertAccountOwnership / Card
  db/schema.ts                      ← drizzle schema
  validators/account.ts, card.ts, transfer.ts

src/app/api/
  accounts/route.ts, [id]/route.ts, balances/route.ts
  cards/route.ts, [id]/route.ts, [id]/account/route.ts
  transfers/internal/route.ts
  transactions/route.ts
```

## Quick smoke test

After any non-trivial change, run this checklist:

1. `npx tsc --noEmit` — typecheck
2. `npm run build` — production build (catches Suspense/prerender issues
   the dev server hides)
3. Browser:
   - `/dashboard` — Checking is selected, hero shows "CHECKING BALANCE"
   - `/dashboard?account=all` — aggregate, merged feed with per-row chips
   - `/dashboard?account=garbage` — silently rewrites to primary
   - `/transfer-internal` — From=Checking, To=Savings auto-init
   - Open AccountSwitcher → "+ Open new account" → fill → see new account
     in dropdown immediately

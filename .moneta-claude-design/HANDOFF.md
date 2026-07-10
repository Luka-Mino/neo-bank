# Moneta — Claude Design build handoff

Driven via Claude-in-Chrome MCP at https://claude.ai/design (logged in as
nick@gambits.gg).

## What was delivered

### 1. Moneta Design System (published)

The full brand system, generated and published to your Claude Design
workspace. Set as the **default** for any new design in the workspace.

**URL**: https://claude.ai/design/p/019dd5fd-15da-73e8-94fe-dc1b95ef28d4

What's inside:
- **Colors**: Brand Colors, Turquoise Ramp, Deep Forest Ramp, Category
  Accents, Text Color Scales — exact match to the Moneta brand guide
  (Marble #F6F6F6, Turquoise #4AC280, Deep Forest #122E2E, Noir #212020,
  plus the five category accents).
- **Type**: Display & Headings, Body & Eyebrow, Monospace.
- **Spacing**: Spacing Scale, Border Radii, Elevation.
- **Components**: Buttons, Quick Actions, Transaction Strip Rows, Big
  Amount Input, Premium Card Visual, Hero Card, Form Fields, Chips &
  Badges, Cards (Light & Dark), Network Chips.
- **Brand**: Logo Lockup, Logo Mark, Moneta Hero Gradient, Iconography
  (Lucide).
- **Built-in UI kits**: Banking App — Dashboard, Marketing Site — Hero &
  Features, Auth Flow — Sign in.

### 2. High-fidelity prototypes (10)

| Screen     | URL                                                                               |
| ---------- | --------------------------------------------------------------------------------- |
| Dashboard  | https://claude.ai/design/p/019dd60e-9f6d-7398-aa6f-e34b3f03d4e3?file=Dashboard.html  |
| Card       | https://claude.ai/design/p/019dd613-a54d-72ba-bc41-491dfe1f15b3?file=Card.html       |
| Insights   | https://claude.ai/design/p/019dd615-afde-7755-85fe-60ebdf22fdb2?file=Insights.html   |
| Transactions | https://claude.ai/design/p/019dd617-a17c-7567-9c3b-807863c7f420?file=Transactions.html |
| Send       | https://claude.ai/design/p/019dd619-b5cf-7b20-849a-f484d3c7b84e?file=Send.html       |
| Deposit    | https://claude.ai/design/p/019dd61b-88f1-703a-87c0-d7f8cf07d369?file=deposit.html    |
| Withdraw   | https://claude.ai/design/p/019dd61d-da04-7204-a4f2-27273c2bb02f?file=moneta%2Fui_kits%2Fapp%2Fwithdraw.html |
| Loans      | https://claude.ai/design/p/019dd61f-a557-7bde-917e-a3fdd04bacac?file=Loans.html      |
| Auth shell | https://claude.ai/design/p/019dd621-5b1b-74e1-b0b9-d973261a05c8?file=Auth+Shell.html |
| Marketing  | https://claude.ai/design/p/019dd623-435c-7c1c-8e4e-a1aff35cf1ca?file=Landing+Page.html |

The Marketing project shows up in the workspace as **`g`** (single-char
placeholder); the artifact title inside is "Moneta Landing Page".
Rename it from the project header in the UI.

## Next.js integration status

### ✅ Dashboard — fully ported from Claude Design

`src/app/(dashboard)/dashboard/page.tsx` is a 1:1 port of the Claude
Design `Dashboard.jsx` artifact, translated to Next.js + lucide-react +
the Moneta design tokens. It:

- Renders the signature Moneta hero card with the eye-toggle balance,
  movement pills, and 3-up USDC/USD/EUR currency strip.
- Has the 4-up turquoise circular Quick Actions wired to the real Next
  routes (`/send`, `/deposit`, `/transfer-out`, `/transactions`).
- Renders the 30-day balance trend as a hand-built SVG with the same
  smooth bezier path, fill gradient, and last-point dot from the
  prototype, plus the 7D / 30D / 90D / 1Y segmented control.
- Renders the Moneta-gradient virtual card widget with brushed-gold EMV
  chip + masked PAN + cardholder + exp + VISA, plus glassy Manage and
  turquoise + Virtual buttons.
- Renders the 5-row transaction feed with the 3px category strips and
  the merchant/time/status/amount layout.
- Pulls real data from `useSession` + `useQuery(['customer'])` +
  `useQuery(['wallets','balances'])` + `useQuery(['transactions'])` and
  falls back to `DEMO_*` data when `NEXT_PUBLIC_DEMO_MODE=true`.

### ✅ Sidebar + header — polished to match

- `src/components/layout/sidebar.tsx` — Deep Forest 256px sidebar with
  the Moneta wordmark, grouped nav, turquoise active pill (with
  `nav-active` shadow glow), and the user-chip footer (avatar +
  name + email + chevron to Settings) wired to the real session.
- `src/components/layout/header.tsx` — adds the rounded "Search
  transactions, recipients…" input, kept the notification bell + user
  dropdown.

### ✅ Tokens + utilities

`src/app/globals.css` now exports the Claude Design custom tokens so any
ported component drops in cleanly:

- `--color-turquoise-50/100/600/700`, `--color-forest`, `--color-forest-700`,
  `--color-forest-900`, `--color-marble`, plus `--color-cat-*` for
  category strips.
- `.moneta-hero-bg` + `.with-halo` for the signature dark gradient with
  blur halos.
- `.nav-active` for the active-nav turquoise glow pill.
- `.eyebrow`, `.tabular`, `.insights-dashed`, `.tx-row:hover`,
  `.shadow-card`, `.rounded-card`, `.rounded-xl2`.

### Other pages — scaffold remains, full port pending

`Card`, `Insights`, `Transactions`, `Send`, `Deposit`, `Withdraw`,
`Loans`, `Auth shell`, and the marketing `landing-page` already have
working scaffolds in the repo, built earlier against the same Moneta
Design System spec. They compile, they're on-brand, they connect to the
data layer.

What's *not* yet done: a 1:1 port of each from the Claude Design
prototypes (the way Dashboard now is). The reason is that Claude Design
puts the `.jsx` source for **components** in the file tree but **inlines
JSX inside the rendered `.html`** for pages. Of the 10 prototypes, only
Dashboard had a separate `Dashboard.jsx` artifact exposed for copy. The
other 9 have their JSX embedded in the `.html` files, which the
in-product UI doesn't surface for clean copy/paste.

### Recommended next step

Two clean ways to extract the remaining sources:

1. **Ask the agent to export.** Open each prototype, click the page file
   in **Design Files**, click **Open**, then in that project's chat type:
   "Export this page as a clean self-contained React component file
   named `<Screen>.jsx`." The agent will produce a `.jsx` you can copy
   the same way Dashboard.jsx was produced. Save each into
   `.moneta-claude-design/<Screen>.jsx`.

2. **Share-link curl.** Click **Share** on each prototype and publish
   it. The public URL is a static HTML page you can `curl` and feed to
   your editor.

Once you have a `.jsx` per screen, the translation pattern Dashboard
used works mechanically:

| Claude Design idiom                            | Next.js replacement                                                |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| `const { useState } = React;`                  | Top-of-file `import { useState } from "react";`                    |
| Custom `<Icon name="kebab-name" />` UMD wrap   | `import { ArrowUpRight, … } from "lucide-react";` + JSX            |
| `<img src="assets/logo-mark-white.svg" />`     | `<Logo variant="icon" tone="reverse" />`                           |
| `bg-forest-900` etc. (custom Tailwind classes) | Already defined in `globals.css` — works as-is                     |
| Hardcoded demo data                            | Replace with the `useSession`/`useQuery`/`DEMO_*` hooks already in the matching Next.js page |
| `ReactDOM.createRoot(...).render(<Dashboard />)` | Drop the bottom; default-export the top-level component            |

## Files in this folder

- `Dashboard.jsx` — 517-line source extracted from Claude Design (the
  reference port).
- `HANDOFF.md` — this document.

To see the rendered prototypes, open the URLs in the table above — each
loads in your Claude Design workspace at full fidelity.

## How to verify

```bash
cd "/Users/lucasmac/Desktop/neo bank"
npx next build       # all 36 routes compile
npm run dev          # open http://localhost:3000/dashboard
```

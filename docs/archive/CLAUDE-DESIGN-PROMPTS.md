# Moneta — Claude Design prompt pack

A brief for [claude.ai/design](https://claude.ai/design). Each section is a self-contained prompt you can paste into a new Claude Design conversation. The first prompt establishes the design system; the rest are per-screen briefs that reference it.

## How to use

1. Open claude.ai/design.
2. Start a **new conversation** for each screen below. (Claude Design works best when each screen has its own thread.)
3. Paste the **System / brand prompt** at the top of every conversation, then paste the screen prompt right after it.
4. **Attach references** in the same message:
   - For every screen: attach `public/brand/moneta-full-turquoise.svg` and `public/brand/moneta-icon-turquoise.svg`.
   - For the Dashboard: also attach the Revolut "Home Screen" page from `Revolut_Super_App_UI.pdf`.
   - For the Card screen: attach the Revolut "Cards" page.
   - For the Insights screen: attach the Revolut "Analytics" page.
   - For the Send screen: attach the Revolut "Transfers" page.
5. Iterate ("make the hero darker", "tighten the spacing", "swap the chart for area-style"). When happy, copy the React/JSX output and tell me which screen it's for — I'll integrate it into the Next.js app, replacing the current scaffold.

---

## SYSTEM / BRAND PROMPT — paste at the top of every conversation

```
Project: Moneta — a stablecoin neobank.

Treat this as the brand and design system. Use it for every component you produce in this conversation. Do not invent alternative colors, fonts, or radii.

BRAND COLORS (from the Moneta brand guide — use exact hex values):
- Marble       #F6F6F6   light surface, page canvas
- Turquoise    #4AC280   primary brand, accents, success, primary CTA
- Deep Forest  #122E2E   dark surface, sidebar/hero/marketing background
- Noir         #212020   deepest dark, used sparingly for chips/depth

Supporting (used for transaction category strips and chart slices, in the
spirit of Revolut's category coding — no other accent colors):
- Cat Blue     #2F80ED
- Cat Orange   #FF9500
- Cat Red      #FF3B30
- Cat Purple   #8B5CF6
- Cat Cyan     #22D3EE

LOGO:
- Use the attached Moneta SVG. The icon is a 16-ray sunburst; the wordmark
  is lowercase "moneta" in a rounded geometric sans.
- On dark surfaces use the reverse (white) variant. On light surfaces use
  the turquoise variant. Never recolor or distort.
- Pair the icon at 24-32px in app chrome; pair the full lockup in marketing
  navbars at 26-30px tall.

TYPOGRAPHY:
- Sans: Geist (or Inter if Geist is unavailable). Heading weight 600,
  tracking -0.01em on hero text.
- Numbers and balances: tabular-nums.
- Sizes: H1 32-48px, H2 24-32px, body 14-16px, eyebrow 11px uppercase
  with 0.2em tracking.

LAYOUT TOKENS:
- Border radius: 14px on cards, 9999px on chips/avatars/circular CTAs.
- Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 px scale.
- Card style on light surfaces: white background, 1px hairline ring at
  rgba(18,46,46,0.08), 14px radius, no heavy shadow.
- Card style on dark surfaces: white at 4% over Deep Forest, 1px ring at
  rgba(255,255,255,0.10).
- The signature dark surface uses a radial gradient:
  radial-gradient(circle at 0% 0%, rgba(74,194,128,0.35) 0%, transparent 55%),
  linear-gradient(135deg, #0A1C1C 0%, #122E2E 60%, #1F4040 100%).

MOTIFS (these recur across the app — use them):
- "Hero card" pattern: dark Moneta gradient surface, eyebrow text, very
  large balance/headline, chip strip below, soft turquoise blur halos in
  the corners.
- "Strip rows": list rows with a 3px vertical color bar on the left edge
  (one of the Cat colors) to encode category.
- "Quick actions": four circular turquoise buttons (44px) with white icons
  and a tiny label below, used for primary actions on the dashboard.

OUTPUT:
- Produce React components using Tailwind utility classes (Tailwind v4
  syntax is fine). One component per screen, fully self-contained, mocked
  data inlined. No external state or routing.
- Use lucide-react for icons.
- Match the attached Moneta logo SVG by inlining it as <Image>/<img> from
  /brand/moneta-full-reverse.svg or /brand/moneta-icon-turquoise.svg.
- Do not add a theme toggle, do not add backwards-compatibility shims, do
  not write a docstring novel — just the component.

When I describe a screen below, design just that screen. Make it
desktop-first at 1280px. Show me a single high-fidelity composition first;
I'll iterate.
```

---

## 1. Dashboard

**Attach**: Revolut "Home Screen" PDF page + Moneta full-reverse SVG.

```
Design the Moneta dashboard (route: /dashboard).

Above-the-fold goal: a returning user lands here, instantly sees balance,
and can act in one tap.

LAYOUT (desktop, 1280):
- 256px Deep Forest sidebar on the left with the Moneta wordmark and nav
  groups: Overview (Dashboard) — Money (Deposit, Transfer Out, Send) —
  Products (Card, Loans) — Activity (Transactions, Recipients, Insights)
  — Account (Settings). Active item is a turquoise pill with a subtle
  glow.
- Main canvas: Marble (#F6F6F6), 32px padding, max-width 1120.

CONTENT (top to bottom):
1) Greeting row: "Good morning, Alex" left; on the right, a small
   turquoise-on-light security pill: "Bank-grade · FDIC pass-through".

2) Hero balance card (signature Moneta dark gradient, full width or 2/3):
   - Eyebrow: "TOTAL BALANCE" 
   - Display number: $12,458.32 in 48px semibold, white. Eye-toggle button
     in the top-right of the card to mask/unmask.
   - "USD" small caption next to the amount.
   - Two pills below: turquoise tinted "+$3,500.00 this month", neutral
     glass "$1,420.00 out".
   - 3-up currency strip at the bottom: USDC (highlighted turquoise),
     USD, EUR (with a small "Soon" badge).

3) Right of the hero (1/3 width on desktop): a white "Quick actions"
   card. Four 44px circular turquoise buttons in a row — Send, Deposit,
   Withdraw, Exchange — each with a tiny label. Below: a soft dashed
   "Insights for April" panel with a "View insights" outline button.

4) Two-column row:
   - Left (60%): a balance trend area chart, turquoise stroke, light
     turquoise fill, 30 days, no gridlines, just a hairline X-axis.
   - Right (40%): a virtual-card preview widget — same Moneta dark
     gradient as the hero, with chip + "•••• 7891" + holder + exp +
     "VISA" mark. Two pill buttons under it: a glass "Manage" and a
     turquoise "+ Virtual".

5) "Recent activity" card (full width):
   - Header "Recent activity" + a "View all" ghost link.
   - 5 rows. Each row has a 3px left strip in a category color, a 40px
     circular muted-bg icon, merchant name, time + status caption, and
     amount on the right (income in turquoise with "+", spend in
     foreground with "−"). Categories to demo: Salary (emerald),
     Tesco Express (orange), Uber (blue), Netflix (red), Blue Bottle
     Coffee (orange).

Produce a single React component. Hardcode the demo data.
```

---

## 2. Card

**Attach**: Revolut "Cards" PDF page.

```
Design the Moneta /card screen — virtual & physical card management.

LAYOUT: same shell as the dashboard (Deep Forest sidebar, Marble canvas).

LEFT COLUMN (55%):
- A premium card visual at 1.586:1 ratio, 24px radius, using the Moneta
  dark gradient. Inside: tiny "MONETA" eyebrow top-left, "Virtual debit"
  caption, "VISA" pill top-right, a brushed-gold EMV chip rectangle, the
  PAN "•••• •••• •••• 7891" in a wide-tracked monospace, and a row at the
  bottom with Holder / Exp / CVV labels.
- Status row card under it: dot + "Active", and a "Reveal details" ghost
  toggle on the right.
- Two split buttons: "Freeze card" (outline) and "Card transactions"
  (outline) — both with tiny captions under the title.

RIGHT COLUMN (45%):
- "TOGGLES" eyebrow, then 3 toggle rows in white cards with a 3px left
  category strip (purple / emerald / blue):
    Online payments — "Enable e-commerce checkout"
    Contactless — "Tap-to-pay via NFC"
    International — "Allow purchases abroad"
  Each row: 36px icon circle, label, sub-caption, and a turquoise toggle
  switch on the right.
- Divider, then "MORE" eyebrow, then 3 link rows (orange / cyan / red
  strips): Spending limits, PIN settings, Add virtual card. Each ends
  with a chevron.

BELOW BOTH COLUMNS: a single full-width "Lost or stolen?" card with a
red-tinted icon, copy, and a "Report card" outline button on the right.

Produce a single React component.
```

---

## 3. Insights / Analytics

**Attach**: Revolut "Analytics" PDF page.

```
Design /insights — spending insights, budgets, and AI nudges.

LAYOUT: standard shell.

CONTENT:
1) Title block "Insights" + sub "Spending insights, budgets, and
   financial overview."

2) Period segmented control (rounded pill, three options): This Month
   (active), Last Month, 3 Months.

3) Hero stat card (Moneta dark gradient): 
   - Eyebrow: "APRIL SPENDING"
   - Big number: $2,847.32
   - Two glass pills under it: "Income $3,500.00" with up-arrow,
     "Savings $652.68" with wallet icon.
   - On the right inside the same card, a small inset "Net for period"
     panel with +$652.68 in turquoise, plus a tiny vs-prior caption.

4) Two-column row of white cards:
   - "Spending by category" (left): seven rows with a tiny colored
     category square + label + amount, and a slim progress bar in that
     same color. Categories: Food & Dining (orange), Transport (blue),
     Shopping (purple), Entertainment (emerald), Bills & Utilities
     (cyan), Health (red), Other (grey).
   - "Budget tracking" (right): four budget rows with label, "spent /
     budget" amount on the right (red if over 90% used), and a thicker
     2.5px progress bar (turquoise normally, red when over 90%).

5) Full-width "AI insights" card with a turquoise sparkles icon in the
   header. Three rows of soft muted-bg blocks, each with a left-side
   colored dot + an insight sentence:
   - Orange: "You spent 15% more on dining this month vs last month."
   - Red: "Transport budget is 97% used — consider alternatives."
   - Emerald: "Subscription costs: $89.99/mo across 5 services."

Produce a single React component.
```

---

## 4. Transactions

```
Design /transactions — full activity feed.

LAYOUT: standard shell.

CONTENT:
1) Title "Transactions" + "Real-time activity across all your accounts."

2) Three-up stat strip (white cards): Total in (turquoise number), Total
   out, Net (color depends on sign).

3) Filter row: search input with leading magnifier, then two select
   triggers — "All Types", "All Statuses".

4) Day-grouped feed. Each group has an uppercase eyebrow ("Today",
   "Yesterday", or "Wednesday, Apr 23") and a single white card
   underneath that holds the rows divided by hairlines.

5) Each row: 3px left strip in the type color (Deposit emerald,
   Withdrawal blue, Sent purple, Swap orange), 40px circular icon,
   row title, status badge + relative time + asset caption, and amount
   tabular on the right (income turquoise "+", out foreground "−").

Produce a single React component.
```

---

## 5. Send

**Attach**: Revolut "Transfers" PDF page.

```
Design /send — P2P payment & transfer composer.

LAYOUT: centered single column, max-width 720, on the standard Marble
canvas.

CONTENT:
1) Title "Send money" + sub "P2P payments, bank transfers, and on-chain
   settlement."

2) White card containing the whole composer:
   a. Pill segmented control: P2P (active), Bank (disabled), Crypto
      (disabled).
   b. "RECENT" eyebrow row, then a horizontal scroll of 5 avatars (48px,
      colored fills, initials, name caption under each), plus a
      dashed-circle "+ New" tile at the end.
   c. Big amount block in a soft Marble panel: "AMOUNT" eyebrow, then a
      "$" + number input "0.00" + "USDC" suffix at 36-40px font weight
      600. Below the input, four preset chips: $25, $50, $100, $250.
   d. "Recipient" select.
   e. Two-up: "Asset" select (USDC / USDT) + "Network" select (Ethereum,
      Polygon, Arbitrum, Base, Optimism, Solana).
   f. Light turquoise fee preview block: "Network fee $0.50 / Total to
      recipient $99.50" — only when amount > 0.
   g. A single full-width turquoise primary CTA: "Review send →".
   h. A tiny lock-icon caption below: "Secure & encrypted · settles
      on-chain".

Produce a single React component.
```

---

## 6. Deposit

```
Design /deposit — add funds via ACH/wire.

LAYOUT: centered single column, max-width 720.

CONTENT:
1) Title "Deposit" + sub "Add funds via ACH or wire — auto-converted to
   USDC."

2) Hero card (Moneta dark gradient): eyebrow "DEPOSIT TO", title "Your
   USDC wallet", caption, and a small white-glass pill on the right
   "Held at FDIC partner banks".

3) Two-up rails row: white cards with left strips. "Wire transfer" (emerald
   strip) — Same day · Best for >$10k. "ACH transfer" (blue strip) —
   1–3 business days · Free, no limits.

4) "Bank transfer details" card: header row with a building icon, then
   four soft-bg rows (Bank Name, Account Holder, Routing Number, Account
   Number) each with a copy-to-clipboard ghost button.

5) Footer info card with a turquoise shield: "Your funds are protected"
   + FDIC pass-through disclaimer.

Produce a single React component.
```

---

## 7. Withdraw / Transfer-out

```
Design /transfer-out — withdraw USDC out as USD via ACH or wire.

LAYOUT: centered single column, max-width 720.

CONTENT:
1) Title "Withdraw to bank" + sub.

2) White card composer:
   - Big amount block (same pattern as Send) with preset chips $100,
     $500, $1k, $5k.
   - "Destination account" select.
   - "Method" — two large radio cards side by side. ACH (blue strip,
     clock icon, "1–3 business days · Free"). Wire (emerald strip, zap
     icon, "Same day · $15 fee"). Selected card has a turquoise ring.
   - Light turquoise summary: "Fee $15 / You receive $X".
   - Turquoise CTA "Review withdrawal →" full width.

Produce a single React component.
```

---

## 8. Loans

```
Design /loans — coming-soon lending products.

LAYOUT: standard shell.

CONTENT:
1) Title "Loans" + sub "Borrow with flexible terms — built on stablecoin
   rails."

2) Hero card (Moneta dark gradient): eyebrow "COMING SOON", headline
   "Borrow on your terms — without the bank.", short paragraph, and a
   disabled turquoise "Join waitlist" button. Right side of the hero: a
   small white-glass panel "Indicative APR from 7.49%" with disclaimer.

3) Three product cards (with left strips emerald / blue / purple):
   - Personal loan — Up to $10,000 / 12–36 months
   - Credit line — Up to $5,000 / Revolving
   - Stablecoin-backed — Up to 60% LTV / Open
   Each shows icon + "Coming soon" badge + name + description + 3 spec
   rows + disabled "Apply" button.

4) "How it works" card with 3 numbered steps (Apply, Get approved,
   Receive funds).

Produce a single React component.
```

---

## 9. Auth (split-screen frame)

```
Design the Moneta auth shell that wraps Login / Register / Forgot password.

LAYOUT: 50/50 split at desktop, single column on mobile.

LEFT PANEL (Moneta dark gradient, 100% height):
- Top: Moneta full reverse logo at 28px.
- Middle: an eyebrow "STABLECOIN BANKING, REGULATED RAILS" in
  turquoise-tinted text, then an H2 "Money that moves at internet speed."
  and a 1-paragraph value prop in 70% white.
- Bottom: a tiny caption row with a turquoise shield icon: "FDIC
  pass-through up to $250K · SOC 2 Type II".
- Soft turquoise blur halos in the top-right and bottom-left corners.

RIGHT PANEL (Marble bg):
- A 64px-tall top bar with a "Back to site" link on the right.
- A centered max-width-440 form area for the active form. Show the
  Login form as the default content: header "Welcome back" / "Sign in
  to your account", email + password inputs, "Forgot password?" link,
  primary turquoise "Sign In" button, and a "Don't have an account?
  Sign up" footer.

Produce a single React component that takes children for the form area
plus a default Login form composed inline.
```

---

## 10. Marketing landing

```
Design the public marketing landing page for moneta.app — the entire
page in one flow. The whole page sits on the Deep Forest dark canvas.

SECTIONS, top to bottom:

A) NAVBAR — fixed, blurred Deep Forest, Moneta full-reverse logo on the
   left; nav links Features / Card / Security on the right; "Log in"
   ghost link, "Get started" turquoise button.

B) HERO — two-column at desktop, single column at mobile.
   Left: a small turquoise "● Stablecoin banking, regulated rails" pill,
   a 56-72px H1 "Money that moves at internet speed." with the last word
   in turquoise, a 18px white/65% paragraph, two CTAs ("Open an account"
   turquoise + "See features" outline), and a row of fine-print trust
   bullets ("FDIC pass-through up to $250K · SOC 2 Type II · Six on-chain
   networks").
   Right: a stylized iPhone mockup. The phone is rendered in CSS — no
   image — with a Moneta dark inner card showing: "Good morning, Alex"
   header + Eye, "TOTAL BALANCE" eyebrow, "$12,458.32", a 4-up turquoise
   circular Quick Action row (Send / Deposit / Withdraw / Exchange), and
   3 mini activity rows with category strips (Salary emerald, Coffee
   orange, Tesco purple). Soft turquoise glow under the phone.

C) FEATURES — eyebrow "FEATURES" turquoise, H2 "Built for how money
   actually works", subhead, and a 3-column grid of 6 feature tiles.
   Each tile: a top hairline accent line in its accent color, a 44px
   tinted icon square (using that accent), title, description.
   Features (with accents): Instant deposits (turquoise), Global transfers
   (cyan), Zero hidden fees (orange), Dollar-backed digital (purple),
   Real-time card controls (blue), AI spending insights (red).

D) CARD SHOWCASE — id "card", two-column. Left text: eyebrow "MONETA
   CARD", H2 "The only card you'll need.", 3 feature rows (Snowflake
   "Instant freeze", Sliders "Smart limits", Wifi "Contactless"). Right:
   the same premium Moneta dark card visual used on /card, scaled up to
   ~440px wide, sitting above a soft turquoise glow.

E) TRUST — id "trust", on a slightly lighter Deep Forest band. Top
   centered cluster: a turquoise shield circle, eyebrow "SECURITY", H2
   "Security you don't have to think about", subhead. Then a 3-column
   grid of glass cards with icon + title + body: FDIC pass-through,
   Bank-grade encryption, Regulated & compliant.

F) CTA — a single rounded inset card using the Moneta dark gradient,
   centered: "Open your account in minutes" headline, paragraph,
   turquoise "Get started — it's free →" button.

G) FOOTER — Moneta full-reverse logo on the left, Terms / Privacy /
   Log in links in the middle, copyright on the right.

Produce one React component for the entire page.
```

---

## After Claude Design

When you bring back outputs, drop them in a message to me with:

- Which screen the JSX is for (e.g. "this is the new dashboard").
- The full JSX, however Claude Design wrote it.

I'll wire it into the Next.js app — replacing the equivalent file under
`src/app/(...)` and `src/components/...`, swapping any inline `<img>`
references for `next/image`, and reconnecting it to `useSession`,
`useQuery`, the demo-mode fallbacks, and the `/api/...` calls so the
screen actually works against the existing backend.

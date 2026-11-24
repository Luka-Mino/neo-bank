# Design Effects Plan

> 2026-08-26. Chosen from the live effects playground. We build these **one at a
> time**, in the order at the bottom. Guardrails apply to every one: respect
> `prefers-reduced-motion`, animate **once** (never on every re-render — critical
> for money figures), keep durations calm, and no more than one "signature"
> moment per screen. Nothing here should make Moneta feel flashy — the bar is
> *premium and quiet*.

## Decisions

**Building:** marquee · scroll reveal · count-up (slower) · directional slide ·
card lift + tilt · link underline · rolling balance · success moment · bento
(find a home) · money-in-motion (reworked).

**Dropped:** magnetic button (the "Get started" pull), skeleton→content loader.

**Open decision — dark theme.** You said you like the darker theme. The app
already has a full dark token set (`.dark` in `globals.css`). Options: (A) add a
**dark-mode toggle** to marketing + app; (B) give the **marketing hero/sections a
dark treatment** while keeping light elsewhere; (C) go **dark by default**.
*Recommendation:* A — add a toggle using the existing dark tokens, then decide if
marketing leans dark. This affects the color foundation, so we settle it **before
Phase 1**. See [[project_marketing_site]].

## The effects

| # | Effect | Where in Moneta | Refinement / note | How | Effort |
|---|--------|-----------------|-------------------|-----|--------|
| 1 | **Link underline** | Nav, footer, all inline text links (marketing + app) | Turquoise underline wipes in from the left on hover | Pure CSS `scaleX` utility | S |
| 2 | **Scroll reveal** | Extend to `/security` + `/how-it-works` (landing already has it); refine easing + light stagger within groups | Keep the fade+rise; add small per-item stagger | Existing `.reveal` + IntersectionObserver | S |
| 3 | **Card lift + tilt** | Hover: the Moneta card (hero + card section), account cards, dashboard summary cards | Lift everywhere; **tilt only on the marketing card** (subtle, ≤14°) | CSS lift + JS pointer tilt | S–M |
| 4 | **Marquee** | Landing: a slim strip (below hero or near trust) | "USD · EUR · settles in ~2s · $0 hidden fees · 1:1 backed"; pause on hover | CSS keyframe translate, duplicated content | S |
| 5 | **Count-up (slower)** | Trust/stat figures on landing + `/security` ("$250K pass-through", "~2s", "1:1 backed") | **Slow it down** — ~1.8s, gentle ease-out (was too fast) | rAF, mono tabular figures, trigger on scroll-in | S |
| 6 | **Rolling balance** | Dashboard total balance when it changes (after a deposit/transfer settles) | Digits roll up to the new value; the "money is real" moment | rAF / digit-roll, mono tabular, snap under reduced-motion | M |
| 7 | **Success moment** | Money-flow success (send / deposit / withdraw confirm) | Checkmark draws itself in; calm, not loud | SVG stroke draw-in | M |
| 8 | **Money-in-motion (reworked)** | Landing hero OR the send-success screen | **Arc, not a straight line** — dot follows a curved path from sender → recipient, then a **small confetti burst on arrival** (ties in the success moment) | SVG arc path + Web Animations; light confetti | M–L |
| 9 | **Directional slide** | The Send funnel (Recipient → Amount → Review → Confirm) + dashboard route changes | Next screen slides in from the right; back reverses it | Framer Motion `AnimatePresence` or View Transitions API | L |
| 10 | **Bento grid** | Landing "what you get" section (optional) | One big balance tile + instant-transfer + $0-fees + compliance tiles | CSS grid | M |

## Build order (one at a time)

**Phase 0 — decide dark theme** (settles the color tokens first).

**Phase 1 — global craft layer** (quick, site-wide, low risk):
1. Link underline → 2. Scroll reveal (extend to the two new pages) → 3. Card lift + tilt → 4. Marquee → 5. Count-up (slower).

**Phase 2 — the money moments** (the signature stuff):
6. Rolling balance → 7. Success moment → 8. Money-in-motion arc + confetti.

**Phase 3 — structural** (bigger, touches routing/layout):
9. Directional slide / route transitions → 10. Bento "what you get" section.

Rationale: Phase 1 is a handful of small wins that lift the whole site immediately;
Phase 2 is where Moneta gets its "feel"; Phase 3 is the heavier lifting we do once
the rest is solid.

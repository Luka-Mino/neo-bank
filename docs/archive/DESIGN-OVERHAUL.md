# Moneta Design Overhaul — Direction & Plan

> Written 2026-07-12. Method: `frontend-design` skill (Anthropic) for
> direction; `web-design-guidelines` skill (Vercel) for the compliance pass
> at the end. Brand source: `Moneta_Final_Logo_Files/` (inspiration, not
> gospel) + the MonetaCard visual. Explicit brief from Nick: clean and
> natural, human (smiling people using the card), moving aspects, and
> absolutely no "AI site vibe."

## Thesis

**Money that feels handled, not rendered.** Moneta is regulated stablecoin
rails wearing a human face — so the design language is *bank lobby warmth,
fintech precision*: real photography of people mid-life (not mid-pose),
generous whitespace, one signature kinetic object (the card), and numbers
treated as first-class typography. Nothing floats in gradient soup; every
decorative element is derived from the brand's own artifacts (the burst
mark, the card's concentric arcs, the four-color guide).

## What "AI site vibe" means here (and how we dodge it)

The tells: cream-serif-terracotta template; near-black + acid accent;
gradient blob halos behind everything; identical 3-col feature grids with
icon-title-blurb; stock metaphors (rocket, shield, lightning); overeager
scroll animations on every element. Current site has mild cases: blur-halo
hero glows, icon-grid features, uniform section rhythm. The remedy is
specificity: Moneta's own mark, card, ledger numbers, and real people.

## Tokens

**Color** (from the brand guide, used at stated tints):
- `marble #F6F6F6` — page ground (light), 80/50/25% tints for layering
- `turquoise #4AC280` — THE accent; actions and life. Never as body text
- `deep-forest #122E2E` — dark surfaces, sidebar, footer, hero type
- `noir #212020` — body text on light
- Category accents (existing) stay for data only, never decoration

**Type** (the personality carrier — replaces the current default stack):
- Display: **Bricolage Grotesque** (Google, variable) — warm, slightly
  eccentric grotesque that rhymes with the logo's rounded forms and the
  backwards-e quirk. Marketing headlines + hero numbers. Tight leading,
  -2% tracking, weights 500–700.
- Body/UI: **Geist Sans** (already installed) — quiet, excellent at small
  sizes. Everything functional.
- Numbers/data: **Geist Mono** with `tabular-nums` — balances, account
  numbers, statement references. Money is typography here.
- Kill the current generic serif display treatment in the app shell.

**Layout**: 12-col, max-w-6xl marketing / max-w-2xl forms (keep). Sections
breathe: 96–128px vertical rhythm on marketing, alternating marble /
deep-forest bands instead of uniform white.

**Signature element**: **the card is the protagonist.** One pointer-reactive
3D-tilt MonetaCard in the landing hero (device-orientation on mobile),
echoed nowhere else at that scale. The burst mark becomes the system's
punctuation: list markers, empty states, loading spinner (slow rotate),
section eyebrows. One risk, spent deliberately: a burst-mark
"shutter" page-load moment on the landing hero only.

**Motion language** (CSS-first, no heavy deps; `prefers-reduced-motion`
respected everywhere):
- Landing: card tilt (pointer), one orchestrated hero load sequence
  (mark → headline lines → card), scroll-reveals at section level only
  (translate+fade, 300ms, once)
- App: micro only — button press (existing translate-y), balance count-up
  on dashboard hero, toggle/nav transitions. No scroll theater inside the
  product.

## Imagery — the human layer (decision needed, see options below)

Direction regardless of source: candid > posed; natural light; real
environments (kitchen table, corner shop, commute); the Moneta card or
phone present but incidental; palette-graded toward marble/forest with
turquoise appearing in clothing/objects. Never: handshake stock, floating
UI collages, purple-lit "fintech people."

Slots: landing hero (1, optional if card carries it), "card" section (1
large), trust section (1), about/footer band (1). App stays photo-free.

Source options (Nick picks):
A. **AI-generated** — needs an image-gen API key (fal/OpenAI/Gemini).
   Best control over card-in-scene; slight risk of the exact vibe we're
   avoiding if not art-directed hard.
B. **Stock photography** — Unsplash/Pexels (free licenses). Real humans,
   fastest, zero cost; card won't appear in-hand (we composite the card
   digitally or keep it separate).
C. **No photography** — pure craft: card, burst, type, motion. Cleanest,
   most "designed," least human. (Fallback if A/B stall.)

## Work plan (each step ends verified in the browser)

1. **Foundation**: add Bricolage Grotesque via next/font; retype the
   display scale; excise the generic serif; tint-ramp utilities.
2. **Landing rebuild** (the showpiece): new hero (headline thesis + tilt
   card + load sequence), product story sections on alternating bands,
   real feature narratives (deposit routing numbers, instant sends,
   honest receipts — with product UI crops, not icons), trust section
   with real registrations/limits, imagery slots per decision above.
3. **App shell polish**: dashboard hero number treatment (mono/count-up),
   burst-mark empty states + loading spinner, consistent card radii and
   section spacing sweep.
4. **The three pending feature UIs** (fold into the sweep): tx-detail
   category picker, accounts goal progress + dialog, recurring transfer
   scheduler on Between accounts.
5. **Compliance pass**: run `web-design-guidelines` audit (a11y, focus,
   contrast, reduced motion, touch targets) + mobile 390px pass + zero
   console errors — this is the "make sure everything works properly"
   gate.

## Done when

- Landing page is unmistakably Moneta's (card + burst + Bricolage) — a
  screenshot could not belong to another fintech site.
- Every marketing section survives the "would a template produce this?"
  test; no icon-grid-with-blurbs sections remain.
- Motion: hero sequence + card tilt on landing; app micro-interactions
  only; everything inert under `prefers-reduced-motion`.
- Imagery slots filled per chosen source, graded to palette.
- web-design-guidelines audit passes; build + tests green; 1440px and
  390px click-through clean.

// The Moneta card, as designed on the brand board ("Coin A", final placement):
// clear tinted plastic, the Moneta coin struck just above the Visa mark, a real
// chip, contactless antenna and magnetic stripe. Front and back render from
// the same art, so the back reads through the tinted plastic.
//
// Everything is laid out on the board's 430 × 272 grid and converted to
// container units (cqw), so the card scales to any width without blurring.
// Pure markup + CSS: safe in Server Components, no client JS.
//
// "VISA" is a text stand-in; swap in Visa's official artwork from the card
// program before launch (LAUNCH-READINESS-PLAN 3.3).

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type CardTint = "mint" | "smoked" | "midnight";

const W = 430;
/** Board pixels → container-relative units. */
const u = (px: number) => `${((px / W) * 100).toFixed(3)}cqw`;
const grad = (a: string, b: string, c: string) => `linear-gradient(135deg, ${a} 0%, ${b} 45%, ${c} 100%)`;

export const CARD_TINTS: Record<
  CardTint,
  { name: string; bg: string; border: string; shadow: string; floor: string }
> = {
  mint: {
    name: "Mint glass",
    bg: grad("rgba(110,205,155,0.36)", "rgba(74,194,128,0.2)", "rgba(60,165,118,0.32)"),
    border: "rgba(47,139,88,0.6)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.85), inset 0 0 22px rgba(47,139,88,0.25), 0 40px 60px -30px rgba(20,70,45,0.55)",
    floor: "rgba(40,120,80,0.3)",
  },
  smoked: {
    name: "Smoked forest",
    bg: grad("rgba(15,42,40,0.88)", "rgba(12,35,34,0.87)", "rgba(10,30,30,0.9)"),
    border: "rgba(74,194,128,0.32)",
    shadow:
      "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 22px rgba(74,194,128,0.18), 0 0 0 1px rgba(74,194,128,0.12), 0 40px 60px -28px rgba(5,20,18,0.7)",
    floor: "rgba(10,30,28,0.42)",
  },
  midnight: {
    name: "Midnight",
    bg: grad("rgba(10,28,28,0.93)", "rgba(8,22,22,0.92)", "rgba(6,18,18,0.95)"),
    border: "rgba(74,194,128,0.28)",
    shadow:
      "inset 0 1px 0 rgba(255,255,255,0.3), inset 0 0 24px rgba(74,194,128,0.2), 0 0 18px rgba(74,194,128,0.14), 0 40px 60px -26px rgba(3,12,12,0.75)",
    floor: "rgba(5,16,16,0.45)",
  },
};

const INK: CSSProperties = {
  filter: "drop-shadow(0 0 0.7px rgba(18,46,46,0.55)) drop-shadow(0 1px 1px rgba(18,46,46,0.22))",
};
const COPPER: CSSProperties = {
  background: "linear-gradient(135deg,#f0c99d 0%,#ad6a33 42%,#e6ab72 62%,#84491f 100%)",
  WebkitMask: "url(/images/card/coin-obverse.svg) center/contain no-repeat",
  mask: "url(/images/card/coin-obverse.svg) center/contain no-repeat",
};
const SHEEN: CSSProperties = {
  background: "linear-gradient(115deg,rgba(255,255,255,0) 30%,rgba(255,255,255,0.2) 45%,rgba(255,255,255,0) 58%)",
};
const abs = (left: number, top: number, w?: number, h?: number): CSSProperties => ({
  position: "absolute",
  left: u(left),
  top: u(top),
  ...(w !== undefined ? { width: u(w) } : {}),
  ...(h !== undefined ? { height: u(h) } : {}),
});

function Frame({ alpha = 0, chipOutline = false }: { alpha?: number; chipOutline?: boolean }) {
  // Copper border rings + the magnetic-stripe register marks. Scales with the
  // card via viewBox, so no unit conversion needed.
  const c = (a: number) => `rgba(196,128,74,${a + alpha})`;
  return (
    <svg viewBox="0 0 430 272" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
      <rect x="9" y="9" width="412" height="254" rx="12" fill="none" stroke={c(0.75)} strokeWidth="0.9" />
      <rect x="12" y="12" width="406" height="248" rx="11" fill="none" stroke={c(0.7)} strokeWidth="0.9" />
      <rect x="15" y="15" width="400" height="242" rx="10" fill="none" stroke={c(0.65)} strokeWidth="0.9" />
      <rect x="18" y="18" width="394" height="236" rx="9" fill="none" stroke={c(0.6)} strokeWidth="0.9" />
      <path d="M18 112H46M9 130H46" fill="none" stroke={c(0.85)} strokeWidth="1.1" />
      {chipOutline && <rect x="44" y="92" width="64" height="56" rx="8" fill="none" stroke="rgba(196,128,74,0.55)" strokeWidth="0.9" />}
    </svg>
  );
}

function Print({ holder, last4, style }: { holder: string; last4: string; style?: CSSProperties }) {
  return (
    <div style={{ ...abs(244, 158), display: "flex", flexDirection: "column", gap: u(5), color: "#fff", ...INK, ...style }}>
      <span style={{ fontSize: u(10.5), fontWeight: 600, letterSpacing: "0.08em" }}>{holder}</span>
      <span className="font-mono" style={{ fontSize: u(12.5), letterSpacing: "0.05em" }}>
        0000 0000 0000 {last4}
      </span>
      <span style={{ fontSize: u(10) }}>EXP 09/30 · CVV •••</span>
    </div>
  );
}

function Visa({ opacity = 1 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        right: u(26),
        bottom: u(18),
        fontStyle: "italic",
        fontWeight: 800,
        fontSize: u(27),
        letterSpacing: "-0.02em",
        lineHeight: 1,
        color: "#fff",
        opacity,
        ...INK,
      }}
    >
      VISA
    </div>
  );
}

/** One side of the card. Fills its container's width at a 430:272 ratio. */
export function MonetaCardArt({
  side = "front",
  tint = "smoked",
  holder = "ALEX MORGAN",
  last4 = "4821",
  label,
  className,
}: {
  side?: "front" | "back";
  tint?: CardTint;
  holder?: string;
  last4?: string;
  /** Accessible description; defaults to "<tint> Moneta card, <side>". */
  label?: string;
  className?: string;
}) {
  const t = CARD_TINTS[tint];
  return (
    <div className={cn("relative w-full", className)} style={{ containerType: "inline-size", aspectRatio: "430 / 272" }}>
      <div
        role="img"
        aria-label={label ?? `${t.name} Moneta card, ${side}`}
        className="absolute inset-0 overflow-hidden"
        style={{
          borderRadius: u(16),
          background: t.bg,
          border: `1.5px solid ${t.border}`,
          boxShadow: t.shadow,
          backdropFilter: "blur(1.5px) saturate(1.3)",
          WebkitBackdropFilter: "blur(1.5px) saturate(1.3)",
        }}
      >
        {side === "front" ? (
          <>
            {/* The back, seen through the plastic (mirrored). */}
            <div aria-hidden className="absolute inset-0" style={{ transform: "scaleX(-1)" }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: u(26),
                  height: u(46),
                  background: "linear-gradient(180deg, #1a1612, #262019 50%, #17130f)",
                  opacity: 0.92,
                }}
              />
              <Print holder={holder} last4={last4} style={{ opacity: 0.4 }} />
            </div>
            <Frame alpha={0.1} chipOutline />
            <div style={{ ...abs(262, 83, 132, 132), ...COPPER }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/moneta-full-reverse.svg" alt="" style={{ ...abs(28, 26, 112), height: "auto", ...INK }} />
            <Visa />
            <div
              style={{
                ...abs(50, 98, 54, 44),
                borderRadius: u(7),
                background: "linear-gradient(135deg, #f0e2b2, #c9a85a 55%, #e9d69c)",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
              }}
            >
              <svg viewBox="0 0 54 44" aria-hidden className="h-full w-full">
                <path d="M0 15h16M0 29h16M38 15h16M38 29h16M16 0v44M38 0v44M16 22h22" fill="none" stroke="rgba(90,70,20,0.45)" strokeWidth="1" />
              </svg>
            </div>
            <svg viewBox="0 0 24 24" aria-hidden style={{ ...abs(114, 109, 22, 22), ...INK }}>
              <path
                d="M5 9a4 4 0 0 1 0 6M8.5 6.5a8 8 0 0 1 0 11M12 4a12 12 0 0 1 0 16M15.5 1.5a16 16 0 0 1 0 21"
                fill="none"
                stroke="#fff"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </>
        ) : (
          <>
            {/* The front, seen through the plastic (mirrored). */}
            <div aria-hidden className="absolute inset-0" style={{ transform: "scaleX(-1)" }}>
              <Frame />
              <div style={{ ...abs(262, 83, 132, 132), ...COPPER, opacity: 0.85 }} />
              <div
                style={{
                  ...abs(52, 100, 50, 40),
                  borderRadius: u(6),
                  background: "radial-gradient(circle at 50% 50%, #2a241a 0%, #16130e 70%)",
                  boxShadow: "0 0 0 1px rgba(196,128,74,0.6)",
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/moneta-full-reverse.svg" alt="" style={{ ...abs(28, 26, 112), height: "auto", opacity: 0.4, ...INK }} />
              <Visa opacity={0.45} />
            </div>
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: u(26),
                height: u(46),
                background: "linear-gradient(180deg, #121715, #1d2522 50%, #0f1412)",
              }}
            />
            <Print holder={holder} last4={last4} />
          </>
        )}
        <div aria-hidden className="absolute inset-0" style={SHEEN} />
      </div>
    </div>
  );
}

/**
 * Front over back, as on the team showcase: the back tilted behind, the front
 * in front, a soft floor shadow underneath. Fills its container's width.
 */
export function MonetaCardPair({
  tint = "smoked",
  className,
}: {
  tint?: CardTint;
  className?: string;
}) {
  const t = CARD_TINTS[tint];
  // Board composition: a 560 × 540 stage.
  const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;
  return (
    <div className={cn("relative w-full", className)} style={{ aspectRatio: "560 / 540" }}>
      <div
        aria-hidden
        className="absolute rounded-[50%]"
        style={{
          left: pct(90, 560),
          top: pct(488, 540),
          width: pct(400, 560),
          height: pct(44, 540),
          background: `radial-gradient(ellipse at center, ${t.floor} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
      <div className="absolute" style={{ left: pct(34, 560), top: pct(40, 540), width: pct(430, 560), transform: "rotate(-11deg) scale(0.9)" }}>
        <MonetaCardArt side="back" tint={tint} />
      </div>
      <div className="absolute" style={{ left: pct(75, 560), top: pct(172, 540), width: pct(430, 560), transform: "rotate(-3deg) scale(1.1)" }}>
        <MonetaCardArt side="front" tint={tint} />
      </div>
    </div>
  );
}

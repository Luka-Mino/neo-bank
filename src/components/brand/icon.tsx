// Moneta icon set — the 16 approved glyphs from the brand board (style A,
// "contour disc"; decision D2 in LAUNCH-READINESS-PLAN.md).
//
// Spec: 24px grid, 1.75px stroke, round caps and joins, one Moneta-green
// "signal" accent per glyph. Two ways to use them:
//   <Icon name="send" />      bare glyph; ink follows currentColor
//   <IconDisc name="send" />  style A: forest disc with contour rings
//
// The signal colour comes from the CSS variable --icon-signal (default
// turquoise-700), so a dark section can set it to the brighter turquoise.

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type Dot = readonly [cx: number, cy: number, r: number];
type Glyph = {
  ink: string;
  accentStroke?: string;
  accentDots?: readonly Dot[];
  inkDots?: readonly Dot[];
};

export const GLYPHS = {
  accounts: {
    ink: "M5.5 4.5H16M4 6a1.5 1.5 0 0 1 1.5-1.5M4 6v12a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5V9a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 1 4 6M20 11.5h-3.5a1.75 1.75 0 0 0 0 3.5H20",
    accentDots: [[16.5, 13.25, 1]],
  },
  card: {
    ink: "M4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-9A1.5 1.5 0 0 1 4.5 6zM3 10h18M6.5 14.5h4",
    accentDots: [[17, 14.5, 1.2]],
  },
  send: {
    ink: "M20.5 3.5 3.5 10.5l7 3 3 7zM10.5 13.5 15 9",
    accentDots: [[18, 6, 1.1]],
  },
  transfer: {
    ink: "M6.5 8.5h12M15 5l3.5 3.5L15 12M19.5 15.5h-14M9 12l-3.5 3.5L9 19",
    accentDots: [[4.5, 8.5, 1.2]],
  },
  deposit: {
    ink: "M12 3.5v10M8 9.5l4 4 4-4M4.5 14.5v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3.5",
    accentDots: [[12, 17, 1.1]],
  },
  withdraw: {
    ink: "M12 13.5v-10M8 7.5l4-4 4 4M4.5 14.5v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3.5",
    accentDots: [[12, 17, 1.1]],
  },
  goals: {
    ink: "M3 19.5c3-4.5 6-6.5 9-6.5s6 2 9 6.5M7.5 19.5c1.5-2 3-3 4.5-3s3 1 4.5 3M12 13V4.5M12 4.5h5.5l-1.5 2 1.5 2H12",
    accentDots: [[12, 19.5, 1.1]],
  },
  insights: {
    ink: "M6 20v-6M12 20v-9M18 20v-4M4 10.5l5-4.5 4 3 5.5-4.5",
    accentDots: [[20, 3.5, 1.3]],
  },
  reserve: {
    ink: "M4 9 12 4.5 20 9M4 9h16M6.5 9v7.5M10.5 9v7.5M13.5 9v7.5M17.5 9v7.5M5 16.5h14M3.5 19.5h17",
    accentDots: [[12, 7, 1.1]],
  },
  fees: {
    ink: "M6.5 3.5h11v16.5l-2.75-1.6-2.75 1.6-2.75-1.6-2.75 1.6zM9.5 8h5M9.5 11.5h5M9.5 15h2",
    accentDots: [[14.5, 15, 1.1]],
  },
  security: {
    ink: "M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v6.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5V12a1.5 1.5 0 0 1 1.5-1.5zM8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 15.6v1.6",
    accentDots: [[12, 14.6, 1.25]],
  },
  protection: {
    ink: "M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6z",
    accentStroke: "M9 12l2.2 2.2L15.5 10",
  },
  "two-step": {
    ink: "M7.5 20.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM10.3 13.7 20 4M17 7l2.5 2.5M14.5 9.5l2 2",
    accentDots: [[7.5, 16.5, 1.3]],
  },
  freeze: {
    ink: "M12 2.5v19M3.77 7.25l16.46 9.5M3.77 16.75l16.46-9.5",
    accentStroke:
      "M12 5.6 13.74 3.67M12 5.6 10.26 3.67M17.54 8.8l2.55.54M17.54 8.8l.81-2.47M17.54 15.2l.81 2.47M17.54 15.2l2.55-.54M12 18.4l-1.74 1.93M12 18.4l1.74 1.93M6.46 15.2l-2.55-.54M6.46 15.2l-.81 2.47M6.46 8.8l-.81-2.47M6.46 8.8l-2.55.54",
  },
  alerts: {
    ink: "M6.5 16.5V11a5.5 5.5 0 0 1 9.2-4.1M17.5 11v5.5l1.5 2H5l1.5-2M10 21h4",
    accentDots: [[17.8, 5.8, 2]],
  },
  support: {
    ink: "M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 19 17h-7.5L7 20.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z",
    accentDots: [[15.5, 11.25, 1]],
    inkDots: [
      [8.5, 11.25, 1],
      [12, 11.25, 1],
    ],
  },
} as const satisfies Record<string, Glyph>;

export type IconName = keyof typeof GLYPHS;

/** Circles as a single path (same construction as the brand board). */
function dotsPath(list: readonly Dot[] | undefined): string {
  if (!list) return "";
  return list
    .map(
      ([cx, cy, r]) =>
        `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
    )
    .join("");
}

const SIGNAL = "var(--icon-signal, #2f8b58)";

function GlyphPaths({
  glyph,
  strokeWidth,
  ink,
  signal,
}: {
  glyph: Glyph;
  strokeWidth: number;
  ink: string;
  signal: string;
}) {
  const line: CSSProperties = {
    fill: "none",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  return (
    <>
      <path d={glyph.ink} style={{ ...line, stroke: ink }} />
      {glyph.accentStroke && (
        <path d={glyph.accentStroke} style={{ ...line, stroke: signal }} />
      )}
      {glyph.inkDots && <path d={dotsPath(glyph.inkDots)} style={{ fill: ink }} />}
      {glyph.accentDots && (
        <path d={dotsPath(glyph.accentDots)} style={{ fill: signal }} />
      )}
    </>
  );
}

/** Bare glyph. Ink follows `currentColor`; the accent uses --icon-signal. */
export function Icon({
  name,
  size = 24,
  strokeWidth = 1.75,
  label,
  className,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  /** Accessible name. Omit for decorative icons next to visible text. */
  label?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("shrink-0", className)}
    >
      <GlyphPaths
        glyph={GLYPHS[name]}
        strokeWidth={strokeWidth}
        ink="currentColor"
        signal={SIGNAL}
      />
    </svg>
  );
}

/** Style A "contour disc": forest circle, faint contour rings, light glyph. */
export function IconDisc({
  name,
  size = 56,
  label,
  className,
}: {
  name: IconName;
  size?: number;
  label?: string;
  className?: string;
}) {
  const glyph = Math.round(size * 0.47);
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 60 60"
        width={size}
        height={size}
        className="absolute inset-0"
        aria-hidden
      >
        <circle cx="46" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.09)" />
        <circle cx="46" cy="14" r="21" fill="none" stroke="rgba(255,255,255,0.07)" />
        <circle cx="46" cy="14" r="32" fill="none" stroke="rgba(255,255,255,0.05)" />
      </svg>
      <svg viewBox="0 0 24 24" width={glyph} height={glyph} className="relative" aria-hidden>
        <GlyphPaths
          glyph={GLYPHS[name]}
          strokeWidth={1.75}
          ink="#f6f6f6"
          signal="#4ac280"
        />
      </svg>
    </span>
  );
}

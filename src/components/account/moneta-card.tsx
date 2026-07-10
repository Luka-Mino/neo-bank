// MonetaCard — single source of truth for every visual representation of
// a user's payment card. Replaces the three previously-duplicated renders
// in dashboard/page.tsx, card/page.tsx, and marketing/card-showcase.tsx.
//
// Variant inference rule (only when `variant === "auto"`):
//   - account.accountType === "savings"           → "marble"
//   - everything else (incl. checking, undefined) → "forest"
// Explicit `variant` always overrides auto. Unknown account types fall back
// to "forest" and emit a console.warn in dev so unknown types don't slip
// in silently.
//
// IMPORTANT: A card is NOT 1:1 with an account. In real fintech UX a card
// can authorize against multiple accounts (default + fallback / per-merchant
// routing), so we deliberately do NOT label the card with a single account
// nickname. Account routing is configured separately in card settings.
//
// TODO(multi-account-ui): when an account is closed or frozen, cards
// attached to it should inherit that state visually. This component
// currently reflects only `card.status` — wire account-state inheritance
// when the multi-account UI work resumes.

"use client";

import { Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

type CardType = "debit" | "credit" | "virtual" | "physical";
type CardStatus = "active" | "frozen" | "replaced" | "canceled";
type CardNetwork = "visa" | "mastercard";

export type MonetaCardData = {
  last4: string;
  cardType: CardType;
  status: CardStatus;
  nickname?: string | null;
  expMonth?: number | null;
  expYear?: number | null;
  network?: CardNetwork | null;
};

export type MonetaCardAccount = {
  accountType: string; // free-text per schema; we only key on "savings"
  nickname?: string | null;
  accountNumber?: string | null;
  balance?: string | null;
};

export type MonetaCardProps = {
  card: MonetaCardData;
  /** Used only for variant inference (savings → marble). Never displayed
   * as a label on the card — see file header for rationale. */
  account?: MonetaCardAccount;
  /** Cardholder name shown on card front (uppercased). Defaults to "MONETA MEMBER". */
  holder?: string | null;
  variant?: "forest" | "marble" | "auto";
  /** UI-only state for the optimistic window between issue-click and POST returning. */
  pendingIssue?: boolean;
  size?: "sm" | "md" | "lg";
  /** @deprecated Cards no longer label a single account. Prop is accepted for
   * call-site compatibility but has no effect. */
  accountChipPlacement?: "on-card" | "below" | "none";
  className?: string;
};

const KNOWN_ACCOUNT_TYPES = new Set([
  "checking",
  "savings",
  "joint",
  "business",
  "goal",
]);

function resolveVariant(
  variant: MonetaCardProps["variant"],
  accountType: string | undefined
): "forest" | "marble" {
  if (variant === "forest" || variant === "marble") return variant;
  // variant is "auto" or undefined — apply inference rule
  if (!accountType) return "forest";
  if (accountType === "savings") return "marble";
  if (!KNOWN_ACCOUNT_TYPES.has(accountType) && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      `[MonetaCard] Unknown accountType "${accountType}"; falling back to "forest" variant. ` +
        `Add it to KNOWN_ACCOUNT_TYPES in moneta-card.tsx and decide its surface.`
    );
  }
  return "forest";
}

const SIZE_CONFIG = {
  sm: {
    width: "w-full max-w-[280px]",
    chip: { w: 32, h: 24, topPct: 38, left: 16 },
    pan: "text-[11.5px] tracking-[0.04em]",
    panGap: "gap-[7px]",
    holder: "text-[9px] tracking-[0.20em]",
    eyebrow: "text-[8px]",
    exp: "text-[10px] tracking-[0.04em]",
    network: 36,
    brand: 16,
    padInset: 16,
    arcs: { size: 140, opacity: 0.18 },
  },
  md: {
    width: "w-full max-w-[400px]",
    chip: { w: 44, h: 32, topPct: 40, left: 22 },
    pan: "text-[15px] tracking-[0.05em]",
    panGap: "gap-[11px]",
    holder: "text-[10.5px] tracking-[0.22em]",
    eyebrow: "text-[9px]",
    exp: "text-[12.5px] tracking-[0.04em]",
    network: 52,
    brand: 22,
    padInset: 22,
    arcs: { size: 210, opacity: 0.20 },
  },
  lg: {
    width: "w-full max-w-[460px]",
    chip: { w: 52, h: 38, topPct: 40, left: 26 },
    pan: "text-[17px] tracking-[0.06em]",
    panGap: "gap-[13px]",
    holder: "text-[11.5px] tracking-[0.22em]",
    eyebrow: "text-[10px]",
    exp: "text-[14px] tracking-[0.04em]",
    network: 60,
    brand: 26,
    padInset: 26,
    arcs: { size: 250, opacity: 0.22 },
  },
} as const;

function NetworkLogo({
  network,
  size = 52,
  className,
}: {
  network: CardNetwork | null | undefined;
  size?: number;
  className?: string;
}) {
  if (!network || network === "visa") {
    // Inline so currentColor inherits from the card surface (white on
    // forest, deep-forest on marble). The /brand/visa.svg file is the same
    // shape; we use it from the marketing showcase / external embeds, but
    // here we want the color to track the parent text color reliably.
    return (
      <svg
        viewBox="0 0 64 22"
        height={size * (22 / 64)}
        width={size}
        fill="currentColor"
        role="img"
        aria-label="Visa"
        className={cn("inline-block", className)}
      >
        <text
          x="0"
          y="18"
          fontFamily="Geist, system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontStyle="italic"
          fontSize="20"
          letterSpacing="2"
        >
          VISA
        </text>
      </svg>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center text-[12px] font-bold tracking-tight",
        className
      )}
    >
      MC
    </span>
  );
}

function StatusOverlay({
  status,
  pendingIssue,
  surface,
}: {
  status: CardStatus;
  pendingIssue: boolean;
  surface: "forest" | "marble";
}) {
  if (pendingIssue) {
    return (
      <span
        className={cn(
          "absolute right-3 top-3 z-10 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
          surface === "forest"
            ? "bg-white/10 text-white/80 ring-1 ring-white/15"
            : "bg-[rgba(18,46,46,0.08)] text-[#122e2e] ring-1 ring-[rgba(18,46,46,0.10)]"
        )}
      >
        Issuing…
      </span>
    );
  }

  if (status === "frozen") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-10 flex items-center justify-center",
          surface === "forest"
            ? "bg-[rgba(10,28,28,0.40)]"
            : "bg-[rgba(18,46,46,0.10)]"
        )}
      >
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md",
            surface === "forest" ? "bg-white/10" : "bg-white/70"
          )}
        >
          <Snowflake
            className={cn(
              "h-6 w-6",
              surface === "forest" ? "text-turquoise" : "text-[#3fb073]"
            )}
            strokeWidth={2.2}
          />
        </span>
      </div>
    );
  }

  if (status === "replaced" || status === "canceled") {
    return (
      <span className="absolute right-3 top-3 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
        {status}
      </span>
    );
  }

  return null;
}

export function MonetaCard({
  card,
  account,
  holder,
  variant = "auto",
  pendingIssue = false,
  size = "md",
  // accountChipPlacement is accepted for call-site compatibility but ignored.
  // See file header — cards aren't 1:1 with accounts.
  className,
}: MonetaCardProps) {
  const resolvedVariant = resolveVariant(variant, account?.accountType);
  const cfg = SIZE_CONFIG[size];

  const isForest = resolvedVariant === "forest";
  const surfaceClass = isForest ? "moneta-hero-bg with-halo" : "bg-moneta-card-marble";
  const textClass = isForest ? "text-white" : "text-[#122e2e]";
  const subtextClass = isForest ? "text-white/60" : "text-[#122e2e]/60";
  const dimmed =
    card.status === "replaced" || card.status === "canceled"
      ? "opacity-50"
      : "";

  const inset = `${cfg.padInset}px`;
  const holderText = (holder ?? "MONETA MEMBER").toUpperCase();
  const arcStroke = isForest
    ? `rgba(74,194,128,${cfg.arcs.opacity + 0.04})`
    : `rgba(74,194,128,${cfg.arcs.opacity})`;

  return (
    <div className={cn("flex flex-col items-stretch gap-3", cfg.width, className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl2 ring-1 transition",
          isForest ? "ring-white/10" : "ring-[rgba(18,46,46,0.10)]",
          surfaceClass,
          textClass,
          dimmed,
          pendingIssue && "border border-dashed border-white/20 opacity-90"
        )}
        style={{ aspectRatio: "1.586 / 1" }}
        data-card
        data-variant={resolvedVariant}
        data-status={card.status}
        data-size={size}
      >
        {/* Top edge highlight (premium plastic feel) */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-px",
            isForest ? "bg-white/10" : "bg-[rgba(18,46,46,0.10)]"
          )}
        />
        {/* Faint diagonal specular sheen */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: isForest
              ? "linear-gradient(110deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 30%)"
              : "linear-gradient(110deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 30%)",
          }}
        />

        {/* Cool design — concentric arcs anchored at bottom-right (NFC-ripple motif). */}
        <svg
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            bottom: -cfg.arcs.size * 0.28,
            right: -cfg.arcs.size * 0.28,
            width: cfg.arcs.size,
            height: cfg.arcs.size,
          }}
          viewBox="0 0 200 200"
        >
          {[60, 100, 140, 180].map((r) => (
            <circle
              key={r}
              cx="200"
              cy="200"
              r={r}
              fill="none"
              stroke={arcStroke}
              strokeWidth="1.25"
            />
          ))}
        </svg>

        {/* Brand lockup (icon + wordmark) — top-left */}
        <span
          aria-hidden
          className="absolute"
          style={{ top: inset, left: inset }}
        >
          <Logo
            variant="full"
            tone={isForest ? "reverse" : "forest"}
            size={cfg.brand}
            className="opacity-95"
          />
        </span>

        {/* Network logo — top-right */}
        <span
          className={cn(
            "absolute",
            isForest ? "text-white" : "text-[#122e2e]"
          )}
          style={{ top: inset, right: inset }}
        >
          <NetworkLogo network={card.network ?? "visa"} size={cfg.network} />
        </span>

        {/* EMV chip — vertically centered between header and bottom block */}
        <div
          aria-hidden
          className="absolute rounded-md"
          style={{
            top: `${cfg.chip.topPct}%`,
            left: cfg.chip.left,
            width: cfg.chip.w,
            height: cfg.chip.h,
            background:
              "radial-gradient(circle at 30% 30%, #f0d999 0%, #c9a45a 40%, #8a6e35 100%)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
          }}
        >
          <div className="absolute inset-y-1 left-2 right-2 flex flex-col justify-around opacity-70">
            <span className="block h-px bg-black/20" />
            <span className="block h-px bg-black/20" />
            <span className="block h-px bg-black/20" />
          </div>
        </div>

        {/* Bottom block: holder line · masked PAN · exp */}
        <div
          className="absolute"
          style={{ left: inset, right: inset, bottom: inset }}
        >
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "eyebrow truncate",
                  cfg.holder,
                  isForest ? "text-white/75" : "text-[#122e2e]/70"
                )}
              >
                {holderText}
              </div>
              <div
                className={cn(
                  "mt-1.5 flex items-baseline tabular font-mono font-medium",
                  cfg.panGap,
                  cfg.pan,
                  isForest ? "text-white/95" : "text-[#122e2e]"
                )}
              >
                <span>••••</span>
                <span>••••</span>
                <span>••••</span>
                <span>{card.last4}</span>
              </div>
            </div>
            {card.expMonth && card.expYear && (
              <div className="shrink-0 text-right">
                <div className={cn("eyebrow", cfg.eyebrow, subtextClass)}>
                  Exp
                </div>
                <div
                  className={cn(
                    "mt-1 tabular font-mono font-medium leading-none",
                    cfg.exp,
                    isForest ? "text-white" : "text-[#122e2e]"
                  )}
                >
                  {String(card.expMonth).padStart(2, "0")}/
                  {String(card.expYear).slice(-2)}
                </div>
              </div>
            )}
          </div>
        </div>

        <StatusOverlay
          status={card.status}
          pendingIssue={pendingIssue}
          surface={resolvedVariant}
        />
      </div>
    </div>
  );
}

// ─── Stack ─────────────────────────────────────────────────────────────────

export type MonetaCardStackProps = {
  cards: { id: string; data: MonetaCardData; account?: MonetaCardAccount }[];
  size?: "sm" | "md" | "lg";
  selectedId?: string | null;
  onSelect?: (cardId: string) => void;
  variant?: MonetaCardProps["variant"];
  className?: string;
};

/**
 * Renders a stack of MonetaCards with offset and z-index ordering. The
 * selected card sits on top at full size; others sit underneath at 92%
 * scale. When only one card is provided, falls back to a single MonetaCard
 * with no stacking.
 */
export function MonetaCardStack({
  cards,
  size = "md",
  selectedId,
  onSelect,
  variant,
  className,
}: MonetaCardStackProps) {
  if (cards.length === 0) return null;
  if (cards.length === 1) {
    const c = cards[0];
    return (
      <MonetaCard
        card={c.data}
        account={c.account}
        size={size}
        variant={variant}
        className={className}
      />
    );
  }

  // Order: selected first (top of stack), then by createdAt-ish (caller order).
  const ordered = [...cards].sort((a, b) =>
    a.id === selectedId ? -1 : b.id === selectedId ? 1 : 0
  );

  return (
    <div className={cn("relative", className)} style={{ minHeight: "1px" }}>
      {ordered.map((c, i) => {
        const isTop = i === 0;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect?.(c.id)}
            className={cn(
              "block w-full text-left transition-transform duration-200",
              !isTop && "absolute inset-x-0",
              isTop ? "relative" : "pointer-events-auto",
              "hover:-translate-y-1"
            )}
            style={{
              transform: !isTop
                ? `translateY(${i * 12}px) scale(${1 - i * 0.04})`
                : undefined,
              zIndex: ordered.length - i,
              filter: !isTop ? "saturate(0.95)" : undefined,
            }}
            aria-label={`Select card ending ${c.data.last4}`}
          >
            <MonetaCard
              card={c.data}
              account={c.account}
              size={size}
              variant={variant}
            />
          </button>
        );
      })}
    </div>
  );
}

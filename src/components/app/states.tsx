// Shared empty / loading / error / success / notice states for /app screens.

import type { ReactNode } from "react";
import { Icon, IconDisc, type IconName } from "@/components/brand/icon";
import { Button } from "@/components/brand/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: IconName;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      <IconDisc name={icon} size={56} />
      <h3 className="mt-4 text-[16px] font-semibold text-forest">{title}</h3>
      {body && <p className="mt-1.5 max-w-[34ch] text-[14px] leading-relaxed text-forest/60">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "We couldn't load this",
  body = "Check your connection and try again.",
  onRetry,
  className,
}: {
  title?: string;
  body?: ReactNode;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c4363b]/[0.08] text-[#b42f34]">
        <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden>
          <path d="M12 7.5v5.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="1.2" fill="currentColor" />
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth={1.75} />
        </svg>
      </span>
      <h3 className="mt-4 text-[16px] font-semibold text-forest">{title}</h3>
      <p className="mt-1.5 max-w-[34ch] text-[14px] leading-relaxed text-forest/60">{body}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Skeleton rows shaped like list items. */
export function LoadingRows({ rows = 3, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="divide-y divide-forest/[0.06]">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-forest/[0.07]" />
          <span className="flex-1 space-y-2">
            <span className="block h-3.5 w-2/5 animate-pulse rounded bg-forest/[0.07]" />
            <span className="block h-3 w-1/4 animate-pulse rounded bg-forest/[0.05]" />
          </span>
          <span className="h-3.5 w-16 animate-pulse rounded bg-forest/[0.07]" />
        </div>
      ))}
    </div>
  );
}

export function Notice({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: "info" | "warning" | "error" | "success";
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "bg-[#eef3f2] text-forest ring-forest/10",
    warning: "bg-[#fff7e6] text-[#6b4a00] ring-[#e8b44a]/40",
    error: "bg-[#c4363b]/[0.06] text-[#8f2428] ring-[#c4363b]/25",
    success: "bg-turquoise-50 text-forest ring-turquoise/30",
  } as const;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-[14px] px-4 py-3.5 text-[13.5px] leading-relaxed ring-1 ring-inset", tones[tone], className)}
    >
      <span className="mt-0.5 shrink-0">
        {tone === "success" ? (
          <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth={1.75} />
            <path d="M8 12.5l2.7 2.7L16 10" fill="none" stroke="#2f8b58" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth={1.75} />
            <path d={tone === "info" ? "M12 11v5" : "M12 7.5v5"} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            <circle cx="12" cy={tone === "info" ? 8 : 16} r="1.1" fill="currentColor" />
          </svg>
        )}
      </span>
      <div className="min-w-0 flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {children && <div className={cn(title && "mt-0.5", "opacity-90")}>{children}</div>}
        {action && <div className="mt-2.5">{action}</div>}
      </div>
    </div>
  );
}

export type DetailRow = { label: string; value: ReactNode; strong?: boolean };

export function DetailList({ rows, className }: { rows: DetailRow[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-forest/[0.07]", className)}>
      {rows.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between gap-4 py-3">
          <dt className="text-[14px] text-forest/60">{r.label}</dt>
          <dd className={cn("tabular min-w-0 text-right text-[14px] text-forest", r.strong ? "font-semibold" : "font-medium")}>
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SuccessState({
  title,
  amount,
  body,
  rows,
  actions,
}: {
  title: string;
  amount?: string;
  body?: ReactNode;
  rows?: DetailRow[];
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-5 py-8 text-center lg:px-10 lg:py-12">
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-turquoise text-forest-900 motion-safe:animate-[pop_320ms_ease-out]">
        <svg viewBox="0 0 24 24" width={30} height={30} aria-hidden>
          <path d="M5.5 12.5l4 4L18.5 8" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h2 className="mt-5 font-display text-[24px] font-semibold tracking-[-0.01em] text-forest">{title}</h2>
      {amount && <div className="tabular mt-1 text-[34px] font-semibold tracking-[-0.02em] text-forest">{amount}</div>}
      {body && <p className="mt-2 max-w-[38ch] text-[14.5px] leading-relaxed text-forest/65">{body}</p>}
      {rows && rows.length > 0 && (
        <div className="mt-6 w-full max-w-[420px] rounded-[16px] bg-[#f3f5f4] px-4 text-left">
          <DetailList rows={rows} />
        </div>
      )}
      {actions && <div className="mt-7 flex w-full max-w-[420px] flex-col gap-2.5 sm:flex-row-reverse">{actions}</div>}
    </div>
  );
}

/** Row icon used in lists that mix glyphs (activity, hubs). */
export function GlyphBadge({ name, tone = "mint" }: { name: IconName; tone?: "mint" | "neutral" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        tone === "mint" ? "bg-turquoise-50 text-forest" : "bg-forest/[0.06] text-forest"
      )}
    >
      <Icon name={name} size={20} />
    </span>
  );
}

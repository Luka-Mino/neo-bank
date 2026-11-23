// Page frame for task screens inside /app (Send, Deposit, Withdraw…).
//   phone   forest title band with a back link, then a white card
//   ≥ lg    same band, then the card beside an optional help column
// Keeps every flow the same width and rhythm as the Accounts home.

import Link from "next/link";
import type { ReactNode } from "react";
import { APP_CONTAINER } from "@/components/app/app-shell";
import { cn } from "@/lib/utils";

export function FlowScreen({
  title,
  subtitle,
  back,
  aside,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  /** Help/explainer column, shown beside the card on desktop and below it on phone. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="pb-10 lg:pb-16">
      <header className="app-band text-white">
        <div className={cn(APP_CONTAINER, "px-5 pb-16 pt-[max(1.1rem,env(safe-area-inset-top))] lg:pb-20 lg:pt-8")}>
          {back && (
            <Link
              href={back.href}
              className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[13.5px] font-medium text-white/70 transition hover:text-white outline-none focus-visible:shadow-[0_0_0_2px_#122e2e,0_0_0_4px_#4ac280]"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden>
                <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {back.label}
            </Link>
          )}
          <h1 className="mt-3 font-display text-[26px] font-semibold tracking-[-0.01em] lg:text-[32px]">{title}</h1>
          {subtitle && <p className="mt-1 text-[14px] text-white/65 lg:text-[15px]">{subtitle}</p>}
        </div>
      </header>

      <div className={cn(APP_CONTAINER, "-mt-10 lg:-mt-12 lg:grid lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:items-start lg:gap-8")}>
        <section className="mx-3 rounded-[22px] bg-white p-5 shadow-[0_1px_0_rgba(18,46,46,0.04),0_10px_30px_-16px_rgba(18,46,46,0.25)] sm:mx-4 lg:mx-0 lg:p-8">
          {children}
        </section>
        {aside && <aside className="mx-4 mt-5 space-y-4 lg:mx-0 lg:mt-14">{aside}</aside>}
      </div>
    </div>
  );
}

/** Explainer card for the aside column. */
export function HelpCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[18px] bg-white/70 p-5 ring-1 ring-forest/[0.07]">
      <h2 className="text-[14px] font-semibold text-forest">{title}</h2>
      <div className="mt-2 space-y-2 text-[13.5px] leading-relaxed text-forest/65">{children}</div>
    </div>
  );
}

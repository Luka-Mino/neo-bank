"use client";

// Insights — /app version of (dashboard)/insights (plan D2).
// Same data as Activity (GET /api/transactions, shared cache); the numbers
// come from computeInsights (src/lib/insights.ts, unit-tested).
// Ported deliberately without the old screen's "AI insights" (hard-coded
// text) and "Budget tracking" (budgets don't exist): copy must never show
// features we don't have. Both are BACKLOG ideas.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { APP_CONTAINER } from "@/components/app/app-shell";
import { EmptyState, ErrorState, LoadingRows } from "@/components/app/states";
import { useTransactions } from "@/components/app/data";
import { accountName } from "@/components/app/account-picker";
import { useAccountsQuery } from "@/components/account/use-accounts";
import { computeInsights, INSIGHTS_PERIODS, type InsightsPeriod } from "@/lib/insights";
import { DEMO_MODE, DEMO_TODAY } from "@/lib/demo-data";
import { formatUsd } from "@/lib/money-input";
import { cn } from "@/lib/utils";

export function InsightsView({ accountId }: { accountId: string | null }) {
  const router = useRouter();
  const { txs, isLoading, isError, refetch } = useTransactions();
  const allAccounts = useAccountsQuery();
  const [period, setPeriod] = useState<InsightsPeriod>("this_month");

  const accounts = (allAccounts.data ?? []).filter((a) => a.status !== "closed");
  const scoped = accountId ? (allAccounts.data ?? []).find((a) => a.id === accountId) : undefined;
  // Demo data is anchored to a fixed date; bucket around it so periods aren't empty.
  const now = useMemo(() => (DEMO_MODE ? DEMO_TODAY : new Date()), []);
  const r = useMemo(() => computeInsights(txs, { period, accountId, now }), [txs, period, accountId, now]);

  const periodText =
    period === "this_month"
      ? now.toLocaleString("en-US", { month: "long" })
      : period === "last_month"
        ? "Last month"
        : "Last 3 months";
  const activityHref = `/app/activity${accountId ? `?account=${encodeURIComponent(accountId)}` : ""}`;

  return (
    <div className="pb-10 lg:pb-16">
      <header className="app-band text-white">
        <div className={cn(APP_CONTAINER, "px-5 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] lg:pb-10 lg:pt-10")}>
          <Link
            href="/app/more"
            className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[13.5px] font-medium text-white/70 hover:text-white"
          >
            <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden>
              <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            More
          </Link>
          <h1 className="mt-3 font-display text-[26px] font-semibold tracking-[-0.01em] lg:text-[32px]">Insights</h1>
          <p className="mt-1 truncate text-[14px] text-white/65">
            {periodText} · {scoped ? `in ${accountName(scoped)}` : "across your accounts"}
          </p>
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
            <div>
              <dt className="text-white/55">Money in</dt>
              <dd className="tabular mt-0.5 text-[17px] font-semibold text-turquoise">{formatUsd(r.moneyIn)}</dd>
            </div>
            <div>
              <dt className="text-white/55">Money out</dt>
              <dd className="tabular mt-0.5 text-[17px] font-semibold">{formatUsd(r.moneyOut)}</dd>
            </div>
            <div>
              <dt className="text-white/55">Net</dt>
              <dd className={cn("tabular mt-0.5 text-[17px] font-semibold", r.net < 0 ? "text-[#ffb4a8]" : "text-white")}>
                {r.net < 0 ? "−" : ""}
                {formatUsd(Math.abs(r.net))}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <div className={cn(APP_CONTAINER, "lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8")}>
        <div className="px-4 pt-4 lg:sticky lg:top-6 lg:px-0 lg:pt-8">
          <div role="group" aria-label="Period" className="flex gap-2">
            {INSIGHTS_PERIODS.map((p) => (
              <button
                key={p.value}
                type="button"
                aria-pressed={period === p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "h-9 shrink-0 rounded-[10px] px-3.5 text-[13px] font-semibold transition outline-none focus-visible:shadow-[0_0_0_2px_#f3f5f4,0_0_0_4px_#4ac280]",
                  period === p.value ? "bg-forest text-marble" : "bg-white text-forest/70 ring-1 ring-forest/10 hover:text-forest"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {accounts.length > 1 && (
            <label className="mt-3 block lg:mt-4">
              <span className="sr-only">Account</span>
              <select
                value={accountId ?? ""}
                onChange={(e) =>
                  router.replace(e.target.value ? `/app/insights?account=${encodeURIComponent(e.target.value)}` : "/app/insights")
                }
                className="h-10 w-full rounded-[12px] bg-white px-3 text-[13.5px] font-medium text-forest ring-1 ring-forest/10 outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
              >
                <option value="">All accounts</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {accountName(a)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <p className="mt-4 hidden text-[12.5px] leading-relaxed text-forest/50 lg:block">
            Completed transactions only. Moves between your own accounts count only when you look at one account.
          </p>
        </div>

        <div className="lg:pt-8">
          <section className="mx-4 mt-5 overflow-hidden rounded-[18px] bg-white shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)] lg:mx-0 lg:mt-0">
            <div className="flex items-baseline justify-between gap-3 px-5 pb-2 pt-5">
              <h2 className="text-[15px] font-semibold text-forest">Spending by category</h2>
              {!isLoading && !isError && r.moneyOut > 0 && (
                <span className="tabular text-[13px] text-forest/55">{formatUsd(r.moneyOut)} total</span>
              )}
            </div>

            {isLoading ? (
              <LoadingRows rows={4} label="Loading insights" />
            ) : isError ? (
              <ErrorState title="We couldn't load your transactions" onRetry={() => refetch()} />
            ) : r.categories.length === 0 ? (
              <EmptyState icon="insights" title="No spending in this period" body="Withdrawals and money you send will show up here, grouped by category." />
            ) : (
              <ul className="px-5 pb-5">
                {r.categories.map((c) => (
                  <li key={c.key} className="py-2.5">
                    <div className="flex items-center justify-between gap-3 text-[14px]">
                      <span className="flex items-center gap-2.5 font-medium text-forest">
                        <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.label}
                      </span>
                      <span className="tabular text-forest">
                        {formatUsd(c.amount)}
                        <span className="ml-2 text-[12.5px] text-forest/50">{Math.round(c.share * 100)}%</span>
                      </span>
                    </div>
                    <div
                      className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#eef1f0]"
                      role="img"
                      aria-label={`${c.label}: ${Math.round(c.share * 100)}% of money out`}
                    >
                      <div className="h-full rounded-full" style={{ width: `${Math.max(2, c.share * 100)}%`, backgroundColor: c.color }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="mx-4 mt-4 text-[13px] text-forest/55 lg:mx-0">
            Categories are set automatically; change one from the transaction&apos;s page in{" "}
            <Link href={activityHref} className="font-semibold text-forest underline underline-offset-2">
              Activity
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

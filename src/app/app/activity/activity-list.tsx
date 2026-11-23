"use client";

// Activity — /app version of (dashboard)/transactions.
// Same data: GET /api/transactions (shared ["transactions"] cache), CSV via
// GET /api/transactions/export. In-progress items are pinned to the top;
// everything else is grouped by day.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ActivityRow } from "@/components/app/activity-row";
import { APP_CONTAINER } from "@/components/app/app-shell";
import { EmptyState, ErrorState, LoadingRows } from "@/components/app/states";
import { dayLabel, txMeta, txStatus, useTransactions, type AppTx } from "@/components/app/data";
import { accountName, useActiveAccounts } from "@/components/app/account-picker";
import { useAccountsQuery } from "@/components/account/use-accounts";
import { buttonClasses } from "@/components/brand/button";
import { DEMO_MODE } from "@/lib/demo-data";
import { formatUsd } from "@/lib/money-input";
import { cn } from "@/lib/utils";

type TypeFilter = "all" | "in" | "deposits" | "withdrawals" | "sent" | "transfers";
type StatusFilter = "all" | "pending" | "done" | "problem";

const TYPE_FILTERS: { value: TypeFilter; label: string; match: (t?: string) => boolean }[] = [
  { value: "all", label: "All", match: () => true },
  { value: "deposits", label: "Deposits", match: (t) => t === "onramp" },
  { value: "withdrawals", label: "Withdrawals", match: (t) => t === "offramp" },
  { value: "sent", label: "Sent", match: (t) => t === "send" },
  { value: "transfers", label: "Transfers", match: (t) => t === "internal_in" || t === "internal_out" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Any status" },
  { value: "pending", label: "In progress" },
  { value: "done", label: "Completed" },
  { value: "problem", label: "Failed or returned" },
];

export function ActivityList({ accountId }: { accountId: string | null }) {
  const { txs, isLoading, isError, refetch } = useTransactions();
  const allAccounts = useAccountsQuery();
  const { accounts } = useActiveAccounts();
  const [type, setType] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [q, setQ] = useState("");

  const scoped = accountId ? (allAccounts.data ?? []).find((a) => a.id === accountId) : undefined;
  const nameOf = (id?: string) => {
    const a = (allAccounts.data ?? []).find((x) => x.id === id);
    return a ? accountName(a) : null;
  };

  const filtered = useMemo(() => {
    const typeMatch = TYPE_FILTERS.find((f) => f.value === type)!.match;
    const needle = q.trim().toLowerCase();
    return txs.filter((t) => {
      if (accountId && t.accountId !== accountId) return false;
      if (!typeMatch(t.txType)) return false;
      if (status !== "all" && txStatus(t.status).tone !== status) return false;
      if (needle) {
        const hay = [txMeta(t.txType).label, t.sourceAmount, nameOf(t.accountId), t.id, txStatus(t.status).label]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txs, accountId, type, status, q, allAccounts.data]);

  const groups = useMemo(() => {
    const out: { label: string; items: AppTx[] }[] = [];
    const pending = filtered.filter((t) => txStatus(t.status).tone === "pending");
    if (pending.length) out.push({ label: "In progress", items: pending });
    for (const t of filtered) {
      if (txStatus(t.status).tone === "pending") continue;
      const label = dayLabel(t.createdAt);
      const g = out.find((x) => x.label === label);
      if (g) g.items.push(t);
      else out.push({ label, items: [t] });
    }
    return out;
  }, [filtered]);

  const totals = useMemo(() => {
    let inn = 0;
    let out = 0;
    for (const t of filtered) {
      if (txStatus(t.status).tone !== "done") continue;
      const n = Number(t.sourceAmount || 0);
      if (txMeta(t.txType).direction === "in") inn += n;
      else out += n;
    }
    return { inn, out };
  }, [filtered]);

  const filtersOn = type !== "all" || status !== "all" || q.trim() !== "";
  const exportHref = `/api/transactions/export${accountId ? `?accountId=${encodeURIComponent(accountId)}` : ""}`;

  return (
    <div className="pb-10 lg:pb-16">
      <header className="app-band text-white">
        <div className={cn(APP_CONTAINER, "px-5 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] lg:pb-10 lg:pt-10")}>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] lg:text-[32px]">Activity</h1>
              <p className="mt-1 truncate text-[14px] text-white/65">
                {scoped ? `In ${accountName(scoped)}` : "Everything across your accounts"}
              </p>
            </div>
            {!DEMO_MODE && (
              <a href={exportHref} download className={buttonClasses({ variant: "on-dark", size: "sm", className: "shrink-0" })}>
                Export CSV
              </a>
            )}
          </div>
          <dl className="mt-5 flex gap-6 text-[13px]">
            <div>
              <dt className="text-white/55">Money in</dt>
              <dd className="tabular mt-0.5 text-[17px] font-semibold text-turquoise">{formatUsd(totals.inn)}</dd>
            </div>
            <div>
              <dt className="text-white/55">Money out</dt>
              <dd className="tabular mt-0.5 text-[17px] font-semibold">{formatUsd(totals.out)}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className={cn(APP_CONTAINER, "lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8")}>
        {/* Filters: a row on phone, a sticky column on desktop */}
        <div className="px-4 pt-4 lg:sticky lg:top-6 lg:px-0 lg:pt-8">
          <label className="relative block">
            <span className="sr-only">Search activity</span>
            <svg viewBox="0 0 24 24" width={17} height={17} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/40">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth={1.75} />
              <path d="M16 16l4 4" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search amount, type, account"
              className="h-11 w-full rounded-[12px] bg-white pl-10 pr-3 text-[14px] text-forest ring-1 ring-forest/10 placeholder:text-forest/40 outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
            />
          </label>

          <div role="group" aria-label="Filter by type" className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:flex-wrap">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={type === f.value}
                onClick={() => setType(f.value)}
                className={cn(
                  "h-9 shrink-0 rounded-[10px] px-3.5 text-[13px] font-semibold transition outline-none focus-visible:shadow-[0_0_0_2px_#f3f5f4,0_0_0_4px_#4ac280]",
                  type === f.value ? "bg-forest text-marble" : "bg-white text-forest/70 ring-1 ring-forest/10 hover:text-forest"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <label className="mt-3 block lg:mt-4">
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="h-10 w-full rounded-[12px] bg-white px-3 text-[13.5px] font-medium text-forest ring-1 ring-forest/10 outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          {scoped && (
            <Link
              href="/app/activity"
              className="mt-3 inline-flex items-center gap-1.5 rounded-[10px] bg-turquoise-50 px-3 py-1.5 text-[13px] font-semibold text-forest ring-1 ring-turquoise/30"
            >
              {accountName(scoped)} only
              <span aria-hidden>✕</span>
              <span className="sr-only">Show all accounts</span>
            </Link>
          )}
          {accounts.length > 1 && !scoped && (
            <p className="mt-4 hidden text-[12.5px] leading-relaxed text-forest/50 lg:block">
              Open an account from Accounts to see only its activity.
            </p>
          )}
        </div>

        <div className="lg:pt-8">
          {isLoading ? (
            <div className="mx-4 mt-5 overflow-hidden rounded-[18px] bg-white lg:mx-0">
              <LoadingRows rows={6} label="Loading activity" />
            </div>
          ) : isError ? (
            <div className="mx-4 mt-5 rounded-[18px] bg-white lg:mx-0">
              <ErrorState title="We couldn't load your activity" onRetry={() => refetch()} />
            </div>
          ) : txs.length === 0 ? (
            <div className="mx-4 mt-5 rounded-[18px] bg-white lg:mx-0">
              <EmptyState
                icon="insights"
                title="No activity yet"
                body="Deposits, payments and transfers show up here as soon as they start."
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="mx-4 mt-5 rounded-[18px] bg-white lg:mx-0">
              <EmptyState
                icon="insights"
                title="Nothing matches"
                body={filtersOn ? "Try a different search or filter." : "No activity in this account yet."}
              />
            </div>
          ) : (
            groups.map((g) => (
              <section key={g.label} className="mt-5 first:mt-5 lg:first:mt-0">
                <h2 className="eyebrow mx-5 mb-2 text-[10px] text-forest/50 lg:mx-1" suppressHydrationWarning>
                  {g.label}
                </h2>
                <div className="mx-4 overflow-hidden rounded-[18px] bg-white shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)] lg:mx-0">
                  {g.items.map((t) => (
                    <ActivityRow key={t.id} tx={t} accountName={accountId ? null : nameOf(t.accountId)} showDate={g.label === "In progress"} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

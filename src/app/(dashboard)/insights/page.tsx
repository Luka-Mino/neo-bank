"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingBag,
  Coffee,
  Car,
  Tv,
  Plug,
  HeartPulse,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_MODE, DEMO_TRANSACTIONS } from "@/lib/demo-data";
import { CATEGORIES, type CategoryKey } from "@/lib/categorize";
import { useSelectedAccount } from "@/components/account/use-accounts";

const periods = ["This Month", "Last Month", "3 Months"] as const;

const sampleCategories = [
  {
    name: "Food & Dining",
    color: "#ff9500",
    spent: 645.2,
    budget: 700,
    icon: Coffee,
  },
  {
    name: "Transport",
    color: "#2f80ed",
    spent: 389.5,
    budget: 400,
    icon: Car,
  },
  {
    name: "Shopping",
    color: "#8b5cf6",
    spent: 567.8,
    budget: 600,
    icon: ShoppingBag,
  },
  {
    name: "Entertainment",
    color: "#4ac280",
    spent: 234.1,
    budget: 300,
    icon: Tv,
  },
  {
    name: "Bills & Utilities",
    color: "#22d3ee",
    spent: 456.9,
    budget: 500,
    icon: Plug,
  },
  {
    name: "Health",
    color: "#ff3b30",
    spent: 123.45,
    budget: 200,
    icon: HeartPulse,
  },
  {
    name: "Other",
    color: "#9bb1b1",
    spent: 340.38,
    budget: 400,
    icon: MoreHorizontal,
  },
];

const aiInsights = [
  {
    color: "#ff9500",
    text: "You spent 15% more on dining this month vs last month.",
  },
  {
    color: "#ff3b30",
    text: "Transport budget is 97% used — consider alternatives.",
  },
  {
    color: "#4ac280",
    text: "Subscription costs: $89.99/mo across 5 services.",
  },
];

export default function InsightsPage() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("This Month");

  const { account: scopedAccount, mode } = useSelectedAccount();
  const isAggregate = mode === "all";

  const { data: res, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetch("/api/transactions").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });

  const transactions = DEMO_MODE
    ? DEMO_TRANSACTIONS
    : res?.data?.data || res?.data || [];

  const filtered = useMemo(() => {
    const now = new Date();
    // [start, end) — half-open interval. Last Month must have an explicit
    // end or it leaks into This Month (was a pre-existing bug).
    let start: Date;
    let end: Date;
    if (period === "This Month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (period === "Last Month") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    return transactions.filter((tx: any) => {
      if (tx.status !== "completed") return false;
      const d = new Date(tx.createdAt);
      if (d < start || d >= end) return false;
      // Scope to selected account when one is chosen.
      if (!isAggregate && tx.accountId !== scopedAccount?.id) return false;
      return true;
    });
  }, [transactions, period, isAggregate, scopedAccount?.id]);

  const stats = useMemo(() => {
    // Treat onramp + internal_in as income (money flowing IN to the visible
    // scope). Everything else is outflow. internal_in/out are essential for
    // a per-account view: a transfer from Checking to Savings should show
    // as income on Savings, outflow on Checking.
    const incomingTypes = new Set(["onramp", "internal_in"]);
    let income = 0;
    let outflows = 0;
    for (const tx of filtered) {
      const amt = parseFloat(tx.sourceAmount || "0");
      if (incomingTypes.has(tx.txType)) income += amt;
      else outflows += amt;
    }
    return { income, outflows, savings: Math.max(0, income - outflows) };
  }, [filtered]);

  // Demo mode keeps the curated sample chart; real mode aggregates actual
  // ledger rows by their category column (auto-assigned at write time,
  // user-overridable per transaction).
  const OUTFLOW_TYPES = new Set(["offramp", "withdrawal", "send", "internal_out", "wallet_send"]);
  const realCategories = (() => {
    const sums = new Map<CategoryKey, number>();
    for (const tx of filtered as Array<{ txType: string; category?: string | null; sourceAmount?: string | null }>) {
      if (!OUTFLOW_TYPES.has(tx.txType)) continue;
      const key = (tx.category && tx.category in CATEGORIES ? tx.category : "other") as CategoryKey;
      sums.set(key, (sums.get(key) ?? 0) + parseFloat(tx.sourceAmount || "0"));
    }
    return [...sums.entries()]
      .map(([key, spent]) => ({
        name: CATEGORIES[key].label,
        color: CATEGORIES[key].color,
        spent,
        budget: null as number | null,
        icon: Wallet,
      }))
      .sort((a, b) => b.spent - a.spent);
  })();
  const categories = DEMO_MODE ? sampleCategories : realCategories;
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);

  // Scope-aware eyebrow. Period drives the leading phrase, scope drives
  // the trailing phrase.
  const accountScopeText = isAggregate
    ? "across all accounts"
    : `in ${scopedAccount?.nickname || scopedAccount?.accountType || "your account"}`;
  const heroEyebrow = (() => {
    if (period === "This Month") {
      const monthName = new Date().toLocaleString("en-US", { month: "long" });
      return `${monthName} spending ${accountScopeText}`;
    }
    if (period === "Last Month") {
      return `Last month's spending ${accountScopeText}`;
    }
    return `3 months of spending ${accountScopeText}`;
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Insights
        </h1>
        <p className="text-muted-foreground">
          {isAggregate
            ? "Spending insights, budgets, and financial overview"
            : `Spending in ${scopedAccount?.nickname || scopedAccount?.accountType || "your account"}`}
        </p>
      </div>

      {/* Period tabs */}
      <div className="flex w-fit gap-1 rounded-full bg-muted p-1">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition",
              period === p
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Spending hero */}
      <div className="bg-moneta-hero relative overflow-hidden rounded-2xl p-6 text-[#f6f6f6] md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#4ac280]/30 blur-3xl" />
        <div className="relative grid gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              {heroEyebrow}
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-12 w-56 bg-white/15" />
            ) : (
              <p className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
                {formatCurrency(stats.outflows)}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-white/80">
                <TrendingUp className="h-3.5 w-3.5 text-[#9be3b8]" />
                Income {formatCurrency(stats.income)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-white/80">
                <Wallet className="h-3.5 w-3.5 text-[#22d3ee]" />
                Savings {formatCurrency(stats.savings)}
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
            <p className="text-xs text-white/60">Net for period</p>
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-2xl font-semibold",
                stats.income - stats.outflows >= 0
                  ? "text-[#9be3b8]"
                  : "text-[#ff8b8b]"
              )}
            >
              {stats.income - stats.outflows >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {formatCurrency(Math.abs(stats.income - stats.outflows))}
            </p>
            <p className="mt-1 text-xs text-white/50">
              vs previous period · indicative
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending by category */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between pb-3">
              <p className="text-sm font-semibold">Spending by category</p>
              <span className="text-xs text-muted-foreground">
                {formatCurrency(totalSpent)} total
              </span>
            </div>
            <div className="space-y-4">
              {categories.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No spending in this period yet.
                </p>
              )}
              {categories.map((c) => {
                const pct = Math.min(
                  100,
                  c.budget
                    ? (c.spent / c.budget) * 100
                    : totalSpent > 0
                      ? (c.spent / totalSpent) * 100
                      : 0
                );
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-md text-white"
                          style={{ backgroundColor: c.color }}
                        >
                          <c.icon className="h-3 w-3" />
                        </span>
                        <span className="text-sm font-medium">{c.name}</span>
                      </div>
                      <span className="text-sm tabular-nums">
                        {formatCurrency(c.spent)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Budget tracking */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between pb-3">
              <p className="text-sm font-semibold">Budget tracking</p>
              <span className="text-xs text-muted-foreground">Monthly caps</span>
            </div>
            <div className="space-y-4">
              {categories.slice(0, 4).map((c) => {
                const pct = Math.min(
                  100,
                  c.budget
                    ? (c.spent / c.budget) * 100
                    : totalSpent > 0
                      ? (c.spent / totalSpent) * 100
                      : 0
                );
                const over = c.budget ? c.spent / c.budget > 0.9 : false;
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.name}</span>
                      <span
                        className={cn(
                          "tabular-nums",
                          over
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      >
                        {c.budget
                          ? `${formatCurrency(c.spent)} / ${formatCurrency(c.budget)}`
                          : formatCurrency(c.spent)}
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          over ? "bg-destructive" : "bg-primary"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI insights */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 pb-3">
            <span className="rounded-md bg-primary/10 p-1.5 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold">AI insights</p>
          </div>
          <div className="space-y-2">
            {aiInsights.map((i) => (
              <div
                key={i.text}
                className="flex items-start gap-3 rounded-lg bg-muted/40 px-3 py-2.5"
              >
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: i.color }}
                />
                <p className="text-sm text-foreground/90">{i.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

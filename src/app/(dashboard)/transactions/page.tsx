"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatCurrency, getStatusColor } from "@/lib/utils/format";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  ArrowLeftRight,
  Search,
  Inbox,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEMO_MODE, DEMO_TRANSACTIONS } from "@/lib/demo-data";
import { useSelectedAccount } from "@/components/account/use-accounts";

const txMeta: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; strip: string }
> = {
  onramp: { label: "Deposit", icon: ArrowDownToLine, strip: "strip-emerald" },
  offramp: { label: "Withdrawal", icon: ArrowUpFromLine, strip: "strip-blue" },
  send: { label: "Sent", icon: Send, strip: "strip-purple" },
  swap: { label: "Swap", icon: ArrowLeftRight, strip: "strip-orange" },
  internal_in: { label: "Move in", icon: ArrowLeftRight, strip: "strip-emerald" },
  internal_out: { label: "Move out", icon: ArrowLeftRight, strip: "strip-purple" },
};

function relTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Header search lands here as ?q= — keep the local filter in sync.
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  useEffect(() => {
    if (urlQuery) setSearchQuery(urlQuery);
  }, [urlQuery]);

  const {
    account: scopedAccount,
    mode,
    openAccounts,
  } = useSelectedAccount();
  const isAggregate = mode === "all";

  const { data: res, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetch("/api/transactions").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });
  const data = DEMO_MODE ? { data: DEMO_TRANSACTIONS } : res?.data || res;
  const transactions = data?.data || [];

  const accountLabel = (id: string | undefined): string | null => {
    if (!id) return null;
    const a = openAccounts.find((x) => x.id === id);
    return a?.nickname || a?.accountType || null;
  };

  const filtered = useMemo(() => {
    return transactions.filter((tx: any) => {
      // Scope to selected account when one is chosen.
      if (!isAggregate && tx.accountId !== scopedAccount?.id) return false;
      if (typeFilter !== "all" && tx.txType !== typeFilter) return false;
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          tx.txType?.toLowerCase().includes(q) ||
          tx.sourceAsset?.toLowerCase().includes(q) ||
          tx.sourceAmount?.includes(q) ||
          tx.id?.toLowerCase().includes(q) ||
          accountLabel(tx.accountId)?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    transactions,
    typeFilter,
    statusFilter,
    searchQuery,
    isAggregate,
    scopedAccount?.id,
    openAccounts,
  ]);

  // Group by day
  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const tx of filtered) {
      const key = dayLabel(tx.createdAt);
      const arr = map.get(key) ?? [];
      arr.push(tx);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const incomingTypes = new Set(["onramp", "internal_in"]);
  const totalIn = filtered
    .filter(
      (t: any) => incomingTypes.has(t.txType) && t.status === "completed"
    )
    .reduce((s: number, t: any) => s + parseFloat(t.sourceAmount || "0"), 0);
  const totalOut = filtered
    .filter(
      (t: any) => !incomingTypes.has(t.txType) && t.status === "completed"
    )
    .reduce((s: number, t: any) => s + parseFloat(t.sourceAmount || "0"), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Transactions
          </h1>
          <p className="text-muted-foreground">
            {isAggregate
              ? "Real-time activity across all your accounts"
              : `Activity in ${scopedAccount?.nickname || scopedAccount?.accountType || "your account"}`}
          </p>
        </div>
        {!DEMO_MODE && (
          <a
            href={`/api/transactions/export${
              !isAggregate && scopedAccount ? `?accountId=${scopedAccount.id}` : ""
            }`}
            className={cn(buttonVariants({ variant: "outline" }))}
            download
          >
            <ArrowDownToLine className="mr-1.5 h-4 w-4" />
            Export CSV
          </a>
        )}
      </div>

      {/* Stat strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total in
            </p>
            <p className="mt-1 text-xl font-semibold text-primary">
              +{formatCurrency(totalIn)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total out
            </p>
            <p className="mt-1 text-xl font-semibold">
              −{formatCurrency(totalOut)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Net
            </p>
            <p
              className={cn(
                "mt-1 text-xl font-semibold",
                totalIn - totalOut >= 0 ? "text-primary" : "text-destructive"
              )}
            >
              {totalIn - totalOut >= 0 ? "+" : "−"}
              {formatCurrency(Math.abs(totalIn - totalOut))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="onramp">Deposits</SelectItem>
            <SelectItem value="offramp">Withdrawals</SelectItem>
            <SelectItem value="send">Sent</SelectItem>
            <SelectItem value="swap">Swaps</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feed */}
      {isLoading ? (
        <Card>
          <CardContent className="space-y-3 py-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {transactions.length > 0
                  ? "No matching transactions"
                  : "No transactions yet"}
              </p>
              <p className="text-xs text-muted-foreground">
                {transactions.length > 0
                  ? "Try adjusting your filters"
                  : "Your transaction history will appear here"}
              </p>
            </div>
            {transactions.length > 0 && (
              <button
                onClick={() => {
                  setTypeFilter("all");
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
              >
                Clear filters
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, rows]) => (
            <div key={day}>
              <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {day}
              </p>
              <Card>
                <CardContent className="px-0">
                  <div className="divide-y divide-border">
                    {rows.map((tx) => {
                      const meta = txMeta[tx.txType] ?? txMeta.send;
                      const Icon = meta.icon;
                      const incoming = incomingTypes.has(tx.txType);
                      return (
                        <Link
                          key={tx.id}
                          href={`/transactions/${tx.id}`}
                          className={cn(
                            "flex items-center gap-4 px-4 py-3 transition hover:bg-muted/40",
                            meta.strip
                          )}
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">
                                {meta.label}
                              </p>
                              {isAggregate && accountLabel(tx.accountId) && (
                                <span className="inline-flex shrink-0 items-center rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-medium text-foreground/70">
                                  {accountLabel(tx.accountId)}
                                </span>
                              )}
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "h-5 px-2 text-[10px]",
                                  getStatusColor(tx.status)
                                )}
                              >
                                {tx.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {relTime(tx.createdAt)} · {tx.sourceAsset || "—"}
                            </p>
                          </div>
                          <p
                            className={cn(
                              "text-sm font-semibold tabular-nums",
                              incoming ? "text-primary" : "text-foreground"
                            )}
                          >
                            {incoming ? "+" : "−"}
                            {tx.sourceAmount
                              ? formatCurrency(tx.sourceAmount)
                              : "—"}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

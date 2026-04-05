"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils/format";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  Wallet,
  TrendingUp,
  Clock,
  History,
  Users,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BalanceChart } from "@/components/dashboard/balance-chart";
import { SpendingBreakdown } from "@/components/dashboard/spending-breakdown";
import { TrustBadge } from "@/components/shared/trust-badge";

const txTypeIcons: Record<string, React.ReactNode> = {
  onramp: <ArrowDownToLine className="h-4 w-4 text-emerald-500" />,
  offramp: <ArrowUpFromLine className="h-4 w-4 text-red-500" />,
  send: <Send className="h-4 w-4 text-blue-500" />,
  swap: <ArrowLeftRight className="h-4 w-4 text-purple-500" />,
};

const txTypeColors: Record<string, string> = {
  onramp: "bg-emerald-100 dark:bg-emerald-900/30",
  offramp: "bg-red-100 dark:bg-red-900/30",
  send: "bg-blue-100 dark:bg-blue-900/30",
  swap: "bg-purple-100 dark:bg-purple-900/30",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const quickActions = [
  {
    name: "Deposit",
    href: "/deposit",
    icon: ArrowDownToLine,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    description: "Add funds via bank transfer",
  },
  {
    name: "Withdraw",
    href: "/withdraw",
    icon: ArrowUpFromLine,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    description: "Cash out to your bank",
  },
  {
    name: "Send",
    href: "/send",
    icon: Send,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    description: "Transfer to anyone",
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: History,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    description: "View your history",
  },
  {
    name: "Recipients",
    href: "/recipients",
    icon: Users,
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    description: "Manage contacts",
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();

  const { data: customerRes, isLoading: customerLoading } = useQuery({
    queryKey: ["customer"],
    queryFn: () => fetch("/api/customers").then((r) => r.json()),
  });

  const { data: txRes, isLoading: txLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetch("/api/transactions").then((r) => r.json()),
  });

  const customer = customerRes?.data || customerRes;
  const txData = txRes?.data || txRes;
  const transactions = txData?.data || [];

  const { data: balanceRes, isLoading: balanceLoading } = useQuery({
    queryKey: ["wallets", "balances"],
    queryFn: () => fetch("/api/wallets/balances").then((r) => r.json()),
    enabled: customer?.kycStatus === "active",
  });

  const kycActive = customer?.kycStatus === "active";
  const totalBalance = balanceRes?.data?.totalUsd || "0";

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  // Compute this month's deposits and outflows
  const { monthDeposits, monthOutflows } = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let deposits = 0;
    let outflows = 0;

    for (const tx of transactions) {
      if (tx.status !== "completed" || new Date(tx.createdAt) < monthStart) continue;
      const amount = parseFloat(tx.sourceAmount || "0");
      if (tx.txType === "onramp") {
        deposits += amount;
      } else {
        outflows += amount;
      }
    }
    return { monthDeposits: deposits, monthOutflows: outflows };
  }, [transactions]);

  const pendingCount = transactions.filter((t: any) =>
    ["pending", "processing", "in_progress"].includes(t.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your account
        </p>
      </div>

      {/* KYC Banner */}
      {!customerLoading && !kycActive && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-yellow-800">
                Complete your verification to start transacting
              </p>
              <p className="text-sm text-yellow-700">
                KYC Status: {customer?.kycStatus || "pending"}
              </p>
            </div>
            <Link href="/onboarding" className={cn(buttonVariants())}>
              Complete KYC
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Hero Balance Card + Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">
              Total Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary-foreground/60" />
          </CardHeader>
          <CardContent>
            {customerLoading || balanceLoading ? (
              <Skeleton className="h-10 w-40 bg-primary-foreground/20" />
            ) : (
              <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthDeposits)}</div>
            <p className="text-xs text-muted-foreground">in deposits</p>
            {monthOutflows > 0 && (
              <p className="mt-1 text-xs text-red-500">
                {formatCurrency(monthOutflows)} out
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Balance History Chart */}
      {kycActive && transactions.length > 0 && (
        <BalanceChart transactions={transactions} currentBalance={totalBalance} />
      )}

      {/* Quick Actions */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors hover:bg-muted/50",
              !kycActive && action.href !== "/transactions" && action.href !== "/recipients" && "pointer-events-none opacity-50"
            )}
          >
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", action.color)}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">{action.name}</p>
              <p className="hidden text-xs text-muted-foreground md:block">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row: Spending Breakdown + Trust Badge */}
      <div className="grid gap-4 md:grid-cols-2">
        <SpendingBreakdown transactions={transactions} />
        <div className="flex flex-col justify-end gap-4">
          <TrustBadge />
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link href="/transactions" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx: any) => {
                const isIncoming = tx.txType === "onramp";
                return (
                  <Link
                    key={tx.id}
                    href={`/transactions/${tx.id}`}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-full", txTypeColors[tx.txType] || "bg-muted")}>
                      {txTypeIcons[tx.txType] || txTypeIcons.send}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{tx.txType}</p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(tx.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn("text-sm font-medium", isIncoming ? "text-emerald-600 dark:text-emerald-400" : "")}>
                        {isIncoming ? "+" : ""}
                        {tx.sourceAmount ? formatCurrency(tx.sourceAmount) : "—"}
                      </span>
                      <Badge variant="secondary" className={getStatusColor(tx.status)}>
                        {tx.status}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">No transactions yet</p>
                <p className="text-xs text-muted-foreground">
                  Make your first deposit to get started
                </p>
              </div>
              {kycActive && (
                <Link href="/deposit" className={cn(buttonVariants({ size: "sm" }))}>
                  Make a Deposit
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

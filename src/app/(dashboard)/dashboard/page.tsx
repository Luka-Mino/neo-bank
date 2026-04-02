"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
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

  const { data: balanceRes, isLoading: balanceLoading } = useQuery({
    queryKey: ["wallets", "balances"],
    queryFn: () => fetch("/api/wallets/balances").then((r) => r.json()),
    enabled: customer?.kycStatus === "active",
  });

  const kycActive = customer?.kycStatus === "active";
  const totalBalance = balanceRes?.data?.totalUsd || "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your NeoBank account</p>
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

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {customerLoading || balanceLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(0)}</div>
            <p className="text-xs text-muted-foreground">in deposits</p>
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
            <div className="text-2xl font-bold">
              {txData?.data?.filter((t: any) =>
                ["pending", "processing", "in_progress"].includes(t.status)
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/deposit"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-20 flex-col gap-2",
            !kycActive && "pointer-events-none opacity-50"
          )}
        >
          <ArrowDownToLine className="h-5 w-5" />
          Deposit
        </Link>
        <Link
          href="/withdraw"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-20 flex-col gap-2",
            !kycActive && "pointer-events-none opacity-50"
          )}
        >
          <ArrowUpFromLine className="h-5 w-5" />
          Withdraw
        </Link>
        <Link
          href="/send"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-20 flex-col gap-2",
            !kycActive && "pointer-events-none opacity-50"
          )}
        >
          <Send className="h-5 w-5" />
          Send
        </Link>
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
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : txData?.data?.length > 0 ? (
            <div className="space-y-3">
              {txData.data.slice(0, 5).map((tx: any) => (
                <Link
                  key={tx.id}
                  href={`/transactions/${tx.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">{tx.txType}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {tx.sourceAmount
                        ? formatCurrency(tx.sourceAmount)
                        : "—"}
                    </span>
                    <Badge variant="secondary" className={getStatusColor(tx.status)}>
                      {tx.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No transactions yet. Make your first deposit to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

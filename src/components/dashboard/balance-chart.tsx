"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

interface Transaction {
  txType: string;
  sourceAmount: string | null;
  destinationAmount: string | null;
  status: string;
  createdAt: string;
}

interface BalanceChartProps {
  transactions: Transaction[];
  currentBalance: string;
}

export function BalanceChart({
  transactions,
  currentBalance,
}: BalanceChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get completed transactions sorted oldest first
    const completed = transactions
      .filter(
        (tx) =>
          tx.status === "completed" &&
          new Date(tx.createdAt) >= thirtyDaysAgo
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    // Walk backwards from current balance to reconstruct daily balances
    let balance = parseFloat(currentBalance) || 0;
    const dailyDeltas: Record<string, number> = {};

    // Compute net delta per day from most recent to oldest
    for (let i = completed.length - 1; i >= 0; i--) {
      const tx = completed[i];
      const dateKey = new Date(tx.createdAt).toISOString().split("T")[0];
      const amount = parseFloat(tx.sourceAmount || tx.destinationAmount || "0");

      if (!dailyDeltas[dateKey]) dailyDeltas[dateKey] = 0;

      if (tx.txType === "onramp") {
        dailyDeltas[dateKey] -= amount; // reverse: subtract to go back in time
      } else {
        dailyDeltas[dateKey] += amount; // reverse: add back outflows
      }
    }

    // Build day-by-day data
    const data: { date: string; balance: number }[] = [];
    let runningBalance = balance;

    // Start from today going backwards, applying reverse deltas
    const dailyBalances: { date: string; balance: number }[] = [];
    for (let d = new Date(now); d >= thirtyDaysAgo; d.setDate(d.getDate() - 1)) {
      const dateKey = d.toISOString().split("T")[0];
      dailyBalances.unshift({ date: dateKey, balance: runningBalance });
      if (dailyDeltas[dateKey]) {
        runningBalance += dailyDeltas[dateKey];
      }
    }

    return dailyBalances.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      balance: Math.max(0, d.balance),
    }));
  }, [transactions, currentBalance]);

  if (chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Balance History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
                width={70}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-sm">
                      <p className="text-xs text-muted-foreground">
                        {payload[0].payload.date}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatCurrency(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

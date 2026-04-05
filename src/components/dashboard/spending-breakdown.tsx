"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

interface Transaction {
  txType: string;
  sourceAmount: string | null;
  status: string;
  createdAt: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  onramp: { label: "Deposits", color: "var(--color-chart-1)" },
  offramp: { label: "Withdrawals", color: "var(--color-chart-2)" },
  send: { label: "Transfers", color: "var(--color-chart-3)" },
  swap: { label: "Swaps", color: "var(--color-chart-4)" },
};

interface SpendingBreakdownProps {
  transactions: Transaction[];
}

export function SpendingBreakdown({ transactions }: SpendingBreakdownProps) {
  const data = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totals: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.status !== "completed" || new Date(tx.createdAt) < monthStart)
        continue;
      const amount = parseFloat(tx.sourceAmount || "0");
      if (!totals[tx.txType]) totals[tx.txType] = 0;
      totals[tx.txType] += amount;
    }

    return Object.entries(totals)
      .filter(([, value]) => value > 0)
      .map(([type, value]) => ({
        name: TYPE_CONFIG[type]?.label || type,
        value,
        color: TYPE_CONFIG[type]?.color || "var(--color-chart-5)",
      }));
  }, [transactions]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            This Month&apos;s Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">
            No completed transactions this month
          </p>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          This Month&apos;s Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {entry.name}
                </span>
                <span className="ml-auto text-sm font-medium">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
            <div className="mt-1 border-t pt-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-sm font-bold">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

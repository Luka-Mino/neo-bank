"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils/format";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: txRes, isLoading } = useQuery({
    queryKey: ["transaction", id],
    queryFn: () => fetch(`/api/transactions/${id}`).then((r) => r.json()),
  });
  const tx = txRes?.data || txRes;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!tx || tx.error) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <p className="text-muted-foreground">Transaction not found</p>
        <Link href="/transactions" className={cn(buttonVariants(), "mt-4")}>
          Back to Transactions
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/transactions"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight capitalize">
            {tx.txType} Transaction
          </h1>
          <p className="text-sm text-muted-foreground">{tx.dakotaTxId}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Details</CardTitle>
            <Badge variant="secondary" className={getStatusColor(tx.status)}>
              {tx.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Amount", value: tx.sourceAmount ? formatCurrency(tx.sourceAmount) : "\u2014" },
            { label: "Source Asset", value: tx.sourceAsset || "\u2014" },
            { label: "Destination Asset", value: tx.destinationAsset || "\u2014" },
            { label: "Source Network", value: tx.sourceNetwork || "\u2014" },
            { label: "Destination Network", value: tx.destinationNetwork || "\u2014" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}

          <Separator />

          {tx.transactionHash && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tx Hash</span>
              <span className="flex items-center gap-1 font-mono text-xs">
                {tx.transactionHash.slice(0, 10)}...{tx.transactionHash.slice(-8)}
                <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Created</span>
            <span className="text-sm">{formatDate(tx.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Updated</span>
            <span className="text-sm">{formatDate(tx.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

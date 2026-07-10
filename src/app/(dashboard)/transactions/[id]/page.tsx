"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils/format";
import {
  ArrowLeft,
  ExternalLink,
  Check,
  Clock,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dakota puts money detail inside metadata.receipt (there is no top-level
// amount on webhook payloads): input/output amounts, FX rate, fee lines,
// and for wires the Fedwire IMAD/OMAD trace numbers.
interface DakotaReceipt {
  initial_amount?: string;
  input_currency?: string;
  outgoing_amount?: string;
  output_currency?: string;
  exchange_rate?: string;
  dakota_fee?: string;
  client_fee?: string;
  developer_fee?: string;
  gas_fee?: string;
  imad?: string;
  omad?: string;
}

const RETURN_STATUSES = new Set(["returned", "reversed", "pending_return"]);

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

  const meta = (tx.metadata ?? {}) as Record<string, unknown>;
  const receipt = (meta.receipt ?? {}) as DakotaReceipt;
  const hasReceipt = Object.keys(receipt).length > 0;
  const paymentReference = meta.payment_reference as string | undefined;
  const returnCode = meta.return_code as string | undefined;
  const returnReason = (meta.return_reason ?? meta.failure_reason) as
    | string
    | undefined;
  const feeLines = [
    { label: "Transfer fee", value: receipt.dakota_fee },
    { label: "Platform fee", value: receipt.client_fee ?? receipt.developer_fee },
    { label: "Network fee", value: receipt.gas_fee },
  ].filter((f) => f.value && parseFloat(f.value) > 0);

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

      {RETURN_STATUSES.has(tx.status) && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {tx.txType === "deposit" || tx.txType === "onramp" ? (
              <>
                This deposit was returned by the sending bank
                {returnCode ? ` (code ${returnCode})` : ""} and has been
                removed from your balance.
              </>
            ) : (
              <>
                This transfer did not complete
                {returnCode ? ` (code ${returnCode})` : ""} — the amount has
                been returned to your account.
              </>
            )}
            {returnReason ? ` Reason: ${returnReason}.` : ""}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {["pending", "processing", "completed"].map((s, i) => {
              const isFailed = tx.status === "failed" || tx.status === "canceled";
              const steps = ["pending", "processing", "completed"];
              const currentIdx = steps.indexOf(tx.status);
              const isActive = i <= currentIdx;
              const isCurrent = s === tx.status;

              return (
                <div key={s} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                        isFailed && i === 2
                          ? "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/30"
                          : isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                      )}
                    >
                      {isFailed && i === 2 ? (
                        <XCircle className="h-4 w-4 text-rose-600" />
                      ) : isActive && !isCurrent ? (
                        <Check className="h-4 w-4" />
                      ) : isCurrent ? (
                        s === "completed" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )
                      ) : (
                        <Clock className="h-3 w-3 text-muted-foreground/50" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] capitalize",
                        isActive ? "font-medium text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {isFailed && i === 2 ? tx.status : s}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={cn(
                        "mx-2 h-0.5 flex-1",
                        i < currentIdx ? "bg-primary" : "bg-muted-foreground/20"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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

      {(hasReceipt || paymentReference) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receipt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {receipt.initial_amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sent</span>
                <span className="text-sm font-medium tabular-nums">
                  {formatCurrency(receipt.initial_amount)}{" "}
                  {receipt.input_currency}
                </span>
              </div>
            )}
            {feeLines.map((f) => (
              <div key={f.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{f.label}</span>
                <span className="text-sm tabular-nums">
                  {formatCurrency(f.value!)}
                </span>
              </div>
            ))}
            {receipt.exchange_rate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Exchange rate
                </span>
                <span className="text-sm tabular-nums">
                  {receipt.exchange_rate}
                </span>
              </div>
            )}
            {receipt.outgoing_amount && (
              <>
                <Separator />
                <div className="flex items-center justify-between font-medium">
                  <span className="text-sm">Received</span>
                  <span className="text-sm tabular-nums">
                    {formatCurrency(receipt.outgoing_amount)}{" "}
                    {receipt.output_currency}
                  </span>
                </div>
              </>
            )}
            {paymentReference && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Statement reference
                </span>
                <span className="font-mono text-xs">{paymentReference}</span>
              </div>
            )}
            {receipt.imad && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">IMAD</span>
                <span className="font-mono text-xs">{receipt.imad}</span>
              </div>
            )}
            {receipt.omad && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">OMAD</span>
                <span className="font-mono text-xs">{receipt.omad}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

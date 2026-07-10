"use client";

// Withdraw to bank (offramp). Server flow is two-leg (see
// /api/transactions POST): the exact total debited — send_amount, which
// includes Dakota's fees — is only known once the transfer is created, so
// the confirm step shows the requested amount and the success screen shows
// the real total from the API response.

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowUpFromLine,
  Info,
  Loader2,
  Lock,
  Zap,
  Clock,
  ArrowRight,
  Landmark,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";
import { DEMO_MODE, DEMO_CUSTOMER, DEMO_LINKED_BANKS } from "@/lib/demo-data";
import {
  SourceAccountPicker,
  useDefaultSourceAccount,
} from "@/components/account/source-account-picker";
import { LinkBankDialog } from "@/components/account/link-bank-dialog";

const transferSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
      "Amount must be a positive number"
    ),
  destinationId: z.string().min(1, "Select a bank account"),
  sourceAccountId: z.string().min(1, "Select a source account"),
  rail: z.enum(["ach", "fedwire"]),
});

type TransferInput = z.infer<typeof transferSchema>;

interface BankDestination {
  dakotaDestinationId: string;
  bankName: string;
  accountType: string;
  last4: string;
}

interface WithdrawalResult {
  transactionId: string | null;
  requested: number;
  sendAmount: string;
  warning?: string;
}

const presetAmounts = [100, 500, 1000, 5000];

export default function TransferOutPage() {
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [linkBankOpen, setLinkBankOpen] = useState(false);
  const [result, setResult] = useState<WithdrawalResult | null>(null);

  const { data: customerRes } = useQuery({
    queryKey: ["customer"],
    queryFn: () => fetch("/api/customers").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });
  const customer = DEMO_MODE
    ? DEMO_CUSTOMER
    : customerRes?.data || customerRes;

  const kycActive = customer?.kycStatus === "active";

  // Withdrawal targets are the user's own linked US bank accounts —
  // fiat_us destinations under their recipients. P2P is on /send.
  const { data: destinationsRes } = useQuery({
    queryKey: ["destinations", "fiat_us"],
    queryFn: () =>
      fetch("/api/destinations?type=fiat_us").then((r) => r.json()),
    enabled: !DEMO_MODE && kycActive,
  });

  const linkedBanks: BankDestination[] = DEMO_MODE
    ? DEMO_LINKED_BANKS.map((b) => ({
        dakotaDestinationId: b.dakotaRecipientId,
        bankName: b.bankName,
        accountType: b.accountType,
        last4: b.last4,
      }))
    : (destinationsRes?.data?.data ?? []).map(
        (d: {
          dakotaDestinationId: string;
          label: string | null;
          details: { bankName?: string; accountType?: string; last4?: string };
        }) => ({
          dakotaDestinationId: d.dakotaDestinationId,
          bankName: d.details?.bankName ?? d.label ?? "Bank account",
          accountType: d.details?.accountType ?? "",
          last4: d.details?.last4 ?? "····",
        })
      );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransferInput>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      amount: "",
      destinationId: "",
      sourceAccountId: "",
      rail: "ach",
    },
  });
  const sourceAccountId = watch("sourceAccountId");
  useDefaultSourceAccount(sourceAccountId, (id) =>
    setValue("sourceAccountId", id, { shouldValidate: true })
  );

  const amount = watch("amount");
  const rail = watch("rail");
  const destinationId = watch("destinationId");
  const numAmount = parseFloat(amount || "0") || 0;
  const selectedBank = linkedBanks.find(
    (b) => b.dakotaDestinationId === destinationId
  );

  async function onSubmit(data: TransferInput) {
    if (step === "form") {
      setStep("confirm");
      return;
    }

    if (DEMO_MODE) {
      // Simulate the fee-inclusive debit the real API reports.
      const requested = parseFloat(data.amount);
      const fee = data.rail === "fedwire" ? 15 : 0.5;
      setResult({
        transactionId: null,
        requested,
        sendAmount: (requested + fee).toFixed(2),
      });
      setStep("success");
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: data.amount,
          accountId: data.sourceAccountId,
          destinationId: data.destinationId,
          sourceAsset: "USDC",
          destinationAsset: "USD",
          destinationPaymentRail: data.rail,
          txType: "offramp",
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        const msg =
          typeof body.error === "string"
            ? body.error
            : body.error?.message || "Transfer failed";
        throw new Error(msg);
      }

      const payload = body.data ?? body;
      setResult({
        transactionId: payload.transaction?.id ?? null,
        requested: parseFloat(data.amount),
        sendAmount: payload.sendAmount ?? data.amount,
        warning: payload.warning,
      });
      setStep("success");
      toast.success("Transfer initiated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transfer failed");
    }
  }

  const feesPaid = result
    ? Math.max(0, parseFloat(result.sendAmount) - result.requested)
    : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Withdraw to bank
        </h1>
        <p className="text-muted-foreground">
          Move USDC out as USD via ACH or wire
        </p>
      </div>

      {!kycActive && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Complete KYC verification before making transfers.
          </AlertDescription>
        </Alert>
      )}

      {kycActive && step === "success" && result && (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ArrowUpFromLine className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Transfer initiated</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatCurrency(result.requested)} is on its way
              {selectedBank
                ? ` to ${selectedBank.bankName} ··${selectedBank.last4}`
                : " to your bank"}
              .
            </p>

            <div className="mx-auto mt-6 max-w-xs space-y-1.5 rounded-xl bg-muted/40 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">You receive</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(result.requested)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transfer fees</span>
                <span className="tabular-nums">{formatCurrency(feesPaid)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 font-medium">
                <span>Total debited</span>
                <span className="tabular-nums">
                  {formatCurrency(parseFloat(result.sendAmount))}
                </span>
              </div>
            </div>

            {result.warning && (
              <Alert className="mt-4 text-left">
                <Info className="h-4 w-4" />
                <AlertDescription>{result.warning}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6 flex justify-center gap-3">
              {result.transactionId && (
                <Link
                  href={`/transactions/${result.transactionId}`}
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  View status
                </Link>
              )}
              <Button
                onClick={() => {
                  setStep("form");
                  setResult(null);
                }}
              >
                Make another transfer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {kycActive && step !== "success" && (
        <Card>
          <CardContent className="space-y-5">
            {/* Amount */}
            <div className="rounded-2xl bg-muted/50 p-5">
              <Label
                htmlFor="amount"
                className="text-[11px] uppercase tracking-wider text-muted-foreground"
              >
                Amount
              </Label>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  disabled={step === "confirm"}
                  {...register("amount")}
                  className="h-auto border-none bg-transparent p-0 text-3xl font-semibold tabular-nums shadow-none focus-visible:ring-0 md:text-4xl"
                />
                <span className="text-sm font-medium text-muted-foreground">
                  USD
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {presetAmounts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() =>
                      setValue("amount", a.toString(), {
                        shouldValidate: true,
                      })
                    }
                    disabled={step === "confirm"}
                    className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground ring-1 ring-border transition hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
                  >
                    {formatCurrency(a)}
                  </button>
                ))}
              </div>
              {errors.amount && (
                <p className="mt-2 text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <SourceAccountPicker
                value={sourceAccountId}
                onChange={(id) =>
                  setValue("sourceAccountId", id, { shouldValidate: true })
                }
                disabled={step === "confirm"}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>To your bank account</Label>
                  <button
                    type="button"
                    onClick={() => setLinkBankOpen(true)}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Link new bank
                  </button>
                </div>
                {linkedBanks.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setLinkBankOpen(true)}
                    className="w-full rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center transition hover:border-primary/40"
                  >
                    <Landmark className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No bank accounts linked yet. Link one to withdraw.
                    </p>
                  </button>
                ) : (
                  <Select
                    value={destinationId || undefined}
                    disabled={step === "confirm"}
                    onValueChange={(v) =>
                      setValue("destinationId", (v as string) ?? "", {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {linkedBanks.map((b) => (
                        <SelectItem
                          key={b.dakotaDestinationId}
                          value={b.dakotaDestinationId}
                        >
                          <span className="flex items-center gap-2">
                            <Landmark className="h-3.5 w-3.5 text-muted-foreground" />
                            {b.bankName} {b.accountType} ··{b.last4}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.destinationId && (
                  <p className="text-xs text-destructive">
                    {errors.destinationId.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Sending to someone else? Use{" "}
                  <a
                    href="/send"
                    className="font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    Send
                  </a>{" "}
                  for P2P transfers.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Method</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    {
                      key: "ach" as const,
                      title: "ACH",
                      desc: "1–3 business days",
                      icon: Clock,
                    },
                    {
                      key: "fedwire" as const,
                      title: "Wire",
                      desc: "Same day",
                      icon: Zap,
                    },
                  ].map((opt) => {
                    const selected = rail === opt.key;
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        disabled={step === "confirm"}
                        onClick={() => setValue("rail", opt.key)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition disabled:opacity-50",
                          selected
                            ? "bg-primary/10 ring-2 ring-primary"
                            : "bg-card ring-1 ring-border hover:ring-primary/40"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full transition",
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <opt.icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{opt.title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {step === "confirm" && (
                <div className="rounded-xl bg-primary/5 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-medium">
                      {selectedBank
                        ? `${selectedBank.bankName} ··${selectedBank.last4}`
                        : "Your bank"}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span className="text-muted-foreground">You receive</span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(numAmount)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium uppercase">{rail}</span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Transfer fees are calculated when the transfer is created
                    and added to the amount debited from your account. The
                    exact total is shown on your receipt.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {step === "confirm" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="xl"
                    className="flex-1"
                    onClick={() => setStep("form")}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  size="xl"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {step === "form" ? (
                    <>
                      Review withdrawal
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>Confirm transfer</>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Secure &amp; encrypted
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <LinkBankDialog
        open={linkBankOpen}
        onOpenChange={setLinkBankOpen}
        onLinked={(id) =>
          setValue("destinationId", id, { shouldValidate: true })
        }
      />
    </div>
  );
}

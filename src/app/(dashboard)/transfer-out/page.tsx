"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";
import { DEMO_MODE, DEMO_CUSTOMER, DEMO_LINKED_BANKS } from "@/lib/demo-data";
import { Landmark, Plus } from "lucide-react";
import {
  SourceAccountPicker,
  useDefaultSourceAccount,
} from "@/components/account/source-account-picker";

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

const presetAmounts = [100, 500, 1000, 5000];

export default function TransferOutPage() {
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");

  const { data: customerRes } = useQuery({
    queryKey: ["customer"],
    queryFn: () => fetch("/api/customers").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });
  const customer = DEMO_MODE
    ? DEMO_CUSTOMER
    : customerRes?.data || customerRes;

  // Withdraw destinations are the user's *own* external bank accounts (linked
  // via Dakota recipients with type=bank_account), not P2P contacts. P2P is on /send.
  const { data: linkedRes } = useQuery({
    queryKey: ["linked-banks"],
    queryFn: () =>
      fetch("/api/recipients?type=bank_account").then((r) => r.json()),
    enabled: !DEMO_MODE && customer?.kycStatus === "active",
  });
  const linkedBanks = DEMO_MODE
    ? DEMO_LINKED_BANKS
    : linkedRes?.data?.data || linkedRes?.data || [];

  const kycActive = customer?.kycStatus === "active";

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
  const numAmount = parseFloat(amount || "0") || 0;
  const fee = rail === "fedwire" ? 15 : 0;

  async function onSubmit(data: TransferInput) {
    if (step === "form") {
      setStep("confirm");
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: data.amount,
          destinationId: data.destinationId,
          sourceAccountId: data.sourceAccountId,
          sourceAsset: "USDC",
          destinationAsset: "USD",
          sourceNetworkId: "ethereum-mainnet",
          destinationPaymentRail: data.rail,
          txType: "offramp",
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        const msg =
          typeof body.error === "string"
            ? body.error
            : body.error?.message || "Transfer failed";
        throw new Error(msg);
      }

      setStep("success");
      toast.success("Transfer initiated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transfer failed");
    }
  }

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

      {kycActive && step === "success" && (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ArrowUpFromLine className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Transfer initiated</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your funds are on their way. Check Transactions for status.
            </p>
            <Button className="mt-6" onClick={() => setStep("form")}>
              Make another transfer
            </Button>
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
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Link new bank
                  </button>
                </div>
                {linkedBanks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
                    <Landmark className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No bank accounts linked yet. Link one to withdraw.
                    </p>
                  </div>
                ) : (
                  <Select
                    disabled={step === "confirm"}
                    onValueChange={(v) =>
                      setValue("destinationId", (v as string) ?? "", {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {linkedBanks.map((b: typeof DEMO_LINKED_BANKS[number]) => (
                        <SelectItem key={b.id} value={b.dakotaRecipientId}>
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
                  <a href="/send" className="font-medium text-foreground underline-offset-2 hover:underline">
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
                      desc: "1–3 business days · Free",
                      icon: Clock,
                      strip: "strip-blue",
                    },
                    {
                      key: "fedwire" as const,
                      title: "Wire",
                      desc: "Same day · $15 fee",
                      icon: Zap,
                      strip: "strip-emerald",
                    },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.key}
                      disabled={step === "confirm"}
                      onClick={() => setValue("rail", opt.key)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl bg-card px-3 py-3 text-left ring-1 transition disabled:opacity-50",
                        opt.strip,
                        rail === opt.key
                          ? "ring-primary"
                          : "ring-border hover:ring-primary/40"
                      )}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <opt.icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium">{opt.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {numAmount > 0 && (
                <div className="rounded-xl bg-primary/5 p-3 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Fee</span>
                    <span className="tabular-nums">{formatCurrency(fee)}</span>
                  </div>
                  <div className="mt-1 flex justify-between font-medium">
                    <span>You receive</span>
                    <span className="tabular-nums">
                      {formatCurrency(Math.max(0, numAmount - fee))}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {step === "confirm" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep("form")}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  size="lg"
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
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send as SendIcon,
  Info,
  Loader2,
  Lock,
  ArrowRight,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";
import { DEMO_MODE, DEMO_CUSTOMER, DEMO_RECIPIENTS } from "@/lib/demo-data";
import {
  SourceAccountPicker,
  useDefaultSourceAccount,
} from "@/components/account/source-account-picker";

const sendSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
      "Amount must be a positive number"
    ),
  recipientId: z.string().min(1, "Select a recipient"),
  sourceAccountId: z.string().min(1, "Select a source account"),
});

type SendInput = z.infer<typeof sendSchema>;

const tabs = ["P2P", "Bank", "Crypto"] as const;

const presetAmounts = [25, 50, 100, 250];

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SendPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("P2P");
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");

  const { data: customerRes } = useQuery({
    queryKey: ["customer"],
    queryFn: () => fetch("/api/customers").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });
  const customer = DEMO_MODE
    ? DEMO_CUSTOMER
    : customerRes?.data || customerRes;

  const { data: recipientRes } = useQuery({
    queryKey: ["recipients"],
    queryFn: () => fetch("/api/recipients").then((r) => r.json()),
    enabled: !DEMO_MODE && customer?.kycStatus === "active",
  });
  const recipientData = DEMO_MODE
    ? { data: DEMO_RECIPIENTS }
    : recipientRes?.data || recipientRes;

  const recipients: any[] = recipientData?.data || [];
  const kycActive = customer?.kycStatus === "active";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SendInput>({
    resolver: zodResolver(sendSchema),
    defaultValues: {
      amount: "",
      recipientId: "",
      sourceAccountId: "",
    },
  });

  const amount = watch("amount");
  const recipientId = watch("recipientId");
  const sourceAccountId = watch("sourceAccountId");
  useDefaultSourceAccount(sourceAccountId, (id) =>
    setValue("sourceAccountId", id, { shouldValidate: true })
  );
  const selectedRecipient = useMemo(
    () => recipients.find((r) => r.dakotaRecipientId === recipientId),
    [recipients, recipientId]
  );
  const numAmount = parseFloat(amount || "0") || 0;

  async function onSubmit(data: SendInput) {
    if (step === "form") {
      setStep("confirm");
      return;
    }

    try {
      // Asset and network are platform decisions (USDC on Base) — the
      // server resolves the network from DAKOTA_NETWORK_ID.
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: data.amount,
          destinationId: data.recipientId,
          accountId: data.sourceAccountId,
          sourceAsset: "USDC",
          destinationAsset: "USDC",
          txType: "send",
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        const msg =
          typeof body.error === "string"
            ? body.error
            : body.error?.message || "Send failed";
        throw new Error(msg);
      }

      setStep("success");
      toast.success("Transfer initiated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Send failed");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Send money
        </h1>
        <p className="text-muted-foreground">
          P2P payments, bank transfers, and on-chain settlement
        </p>
      </div>

      {!kycActive && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Complete KYC verification before sending funds.
          </AlertDescription>
        </Alert>
      )}

      {kycActive && step === "success" && (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SendIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Transfer initiated</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your transfer is being processed. Track it on the Transactions page.
            </p>
            <Button className="mt-6" onClick={() => setStep("form")}>
              Send more
            </Button>
          </CardContent>
        </Card>
      )}

      {kycActive && step !== "success" && (
        <Card>
          <CardContent className="space-y-5">
            {/* Destination type — Bank hands off to /transfer-out */}
            <div className="flex gap-1 rounded-full bg-muted p-1">
              <button
                type="button"
                onClick={() => setTab("P2P")}
                className={cn(
                  "flex-1 rounded-full px-3 py-2 text-sm font-semibold transition",
                  tab === "P2P"
                    ? "bg-forest text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                To a person
              </button>
              <a
                href="/transfer-out"
                className="flex flex-1 items-center justify-center rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
              >
                To a bank
              </a>
              <button
                type="button"
                disabled
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground/50"
              >
                To crypto
                <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ring-1 ring-border">
                  Soon
                </span>
              </button>
            </div>

            {/* Recent recipients */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent
              </p>
              <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-1">
                {recipients.slice(0, 5).map((r) => {
                  const active = r.dakotaRecipientId === recipientId;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() =>
                        setValue("recipientId", r.dakotaRecipientId, {
                          shouldValidate: true,
                        })
                      }
                      className="flex shrink-0 flex-col items-center gap-1.5 text-center"
                    >
                      <Avatar
                        className={cn(
                          "h-12 w-12 ring-2 transition",
                          active
                            ? "ring-primary"
                            : "ring-transparent group-hover:ring-border"
                        )}
                      >
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          )}
                        >
                          {initialsOf(r.name)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="max-w-[64px] truncate text-[11px] text-muted-foreground">
                        {r.name.split(" ")[0]}
                      </p>
                    </button>
                  );
                })}
                <a
                  href="/recipients/new"
                  className="flex shrink-0 flex-col items-center gap-1.5"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-primary/50 hover:text-primary">
                    <Plus className="h-4 w-4" />
                  </span>
                  <p className="text-[11px] text-muted-foreground">New</p>
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Big amount input */}
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
                    USDC
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

              <SourceAccountPicker
                value={sourceAccountId}
                onChange={(id) =>
                  setValue("sourceAccountId", id, { shouldValidate: true })
                }
                disabled={step === "confirm"}
              />

              <div className="space-y-2">
                <Label>Recipient</Label>
                <Select
                  disabled={step === "confirm"}
                  value={recipientId}
                  onValueChange={(v) =>
                    setValue("recipientId", (v as string) ?? "", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients.map((r) => (
                      <SelectItem key={r.id} value={r.dakotaRecipientId}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.recipientId && (
                  <p className="text-xs text-destructive">
                    {errors.recipientId.message}
                  </p>
                )}
              </div>

              {numAmount > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">
                    Recipient receives
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(numAmount)}{" "}
                    <span className="font-normal text-muted-foreground">
                      USDC
                    </span>
                  </span>
                </div>
              )}

              {/* Confirm summary */}
              {step === "confirm" && selectedRecipient && (
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Sending to
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initialsOf(selectedRecipient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedRecipient.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        USDC · arrives in seconds
                      </p>
                    </div>
                  </div>
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
                      Review send
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Send {amount ? formatCurrency(amount) : ""}
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Secure &amp; encrypted · settles on-chain
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

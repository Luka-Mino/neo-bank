"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowUpFromLine, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";

const withdrawSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
    "Amount must be a positive number"
  ),
  destinationId: z.string().min(1, "Select a bank account"),
  rail: z.enum(["ach", "fedwire"]),
});

type WithdrawInput = z.infer<typeof withdrawSchema>;

export default function WithdrawPage() {
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");

  const { data: customerRes } = useQuery({
    queryKey: ["customer"],
    queryFn: () => fetch("/api/customers").then((r) => r.json()),
  });
  const customer = customerRes?.data || customerRes;

  const { data: recipientRes } = useQuery({
    queryKey: ["recipients"],
    queryFn: () => fetch("/api/recipients").then((r) => r.json()),
    enabled: customer?.kycStatus === "active",
  });
  const recipientData = recipientRes?.data || recipientRes;

  const kycActive = customer?.kycStatus === "active";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawInput>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { rail: "ach" },
  });

  async function onSubmit(data: WithdrawInput) {
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
          sourceAsset: "USDC",
          destinationAsset: "USD",
          sourceNetworkId: "ethereum-mainnet",
          destinationPaymentRail: data.rail,
          txType: "offramp",
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Withdrawal failed");
      }

      setStep("success");
      toast.success("Withdrawal initiated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Withdrawal failed");
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Withdraw</h1>
        <p className="text-muted-foreground">Send funds to your bank account</p>
      </div>

      {!kycActive && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Complete KYC verification before making withdrawals.
          </AlertDescription>
        </Alert>
      )}

      {kycActive && step === "success" && (
        <Card>
          <CardContent className="py-8 text-center">
            <ArrowUpFromLine className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-lg font-semibold">Withdrawal Initiated</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your funds are on their way. Check the Transactions page for status updates.
            </p>
            <Button className="mt-6" onClick={() => setStep("form")}>
              Make Another Withdrawal
            </Button>
          </CardContent>
        </Card>
      )}

      {kycActive && step !== "success" && (
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Details</CardTitle>
            <CardDescription>
              {step === "confirm"
                ? "Review and confirm your withdrawal"
                : "Enter the amount and destination"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  disabled={step === "confirm"}
                  {...register("amount")}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Bank Account</Label>
                <Select
                  disabled={step === "confirm"}
                  onValueChange={(v) => setValue("destinationId", v as string)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientData?.data?.map((r: any) => (
                      <SelectItem key={r.id} value={r.dakotaRecipientId}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.destinationId && (
                  <p className="text-sm text-destructive">{errors.destinationId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Transfer Method</Label>
                <Select
                  disabled={step === "confirm"}
                  defaultValue="ach"
                  onValueChange={(v) => setValue("rail", (v as string) as "ach" | "fedwire")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ach">ACH (1-3 business days)</SelectItem>
                    <SelectItem value="fedwire">Wire Transfer (Same day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {step === "form" ? "Review" : "Confirm Withdrawal"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

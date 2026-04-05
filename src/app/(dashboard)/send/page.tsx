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
import { Send as SendIcon, Info, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

const sendSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
    "Amount must be a positive number"
  ),
  recipientId: z.string().min(1, "Select a recipient"),
  asset: z.string(),
  network: z.string(),
});

type SendInput = z.infer<typeof sendSchema>;

export default function SendPage() {
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
    formState: { errors, isSubmitting },
  } = useForm<SendInput>({
    resolver: zodResolver(sendSchema),
    defaultValues: { asset: "USDC", network: "ethereum-mainnet" },
  });

  async function onSubmit(data: SendInput) {
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
          destinationId: data.recipientId,
          sourceAsset: data.asset,
          destinationAsset: data.asset,
          sourceNetworkId: data.network,
          destinationNetworkId: data.network,
          txType: "send",
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Send failed");
      }

      setStep("success");
      toast.success("Transfer initiated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Send failed");
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Send</h1>
        <p className="text-muted-foreground">Transfer funds to a recipient</p>
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
          <CardContent className="py-8 text-center">
            <SendIcon className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-lg font-semibold">Transfer Initiated</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your transfer is being processed. Track it on the Transactions page.
            </p>
            <Button className="mt-6" onClick={() => setStep("form")}>
              Send More
            </Button>
          </CardContent>
        </Card>
      )}

      {kycActive && step !== "success" && (
        <Card>
          <CardHeader>
            <CardTitle>Send Funds</CardTitle>
            <CardDescription>
              {step === "confirm" ? "Review and confirm" : "Choose recipient and amount"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient</Label>
                <Select
                  disabled={step === "confirm"}
                  onValueChange={(v) => setValue("recipientId", v as string)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipientData?.data?.map((r: any) => (
                      <SelectItem key={r.id} value={r.dakotaRecipientId}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.recipientId && (
                  <p className="text-sm text-destructive">{errors.recipientId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset</Label>
                  <Select
                    disabled={step === "confirm"}
                    defaultValue="USDC"
                    onValueChange={(v) => setValue("asset", v as string)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Network</Label>
                  <Select
                    disabled={step === "confirm"}
                    defaultValue="ethereum-mainnet"
                    onValueChange={(v) => setValue("network", v as string)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum-mainnet">Ethereum</SelectItem>
                      <SelectItem value="polygon-mainnet">Polygon</SelectItem>
                      <SelectItem value="arbitrum-mainnet">Arbitrum</SelectItem>
                      <SelectItem value="base-mainnet">Base</SelectItem>
                      <SelectItem value="optimism-mainnet">Optimism</SelectItem>
                      <SelectItem value="solana-mainnet">Solana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  {step === "form" ? "Review" : "Confirm Send"}
                </Button>
              </div>
              <div className="flex items-center justify-center gap-1.5 pt-2 text-xs text-muted-foreground">
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

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SourceAccountPicker,
  useDefaultSourceAccount,
} from "@/components/account/source-account-picker";
import {
  Copy,
  CheckCircle2,
  Building2,
  Info,
  Loader2,
  Zap,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DEMO_MODE, DEMO_CUSTOMER, DEMO_BANK_DETAILS } from "@/lib/demo-data";

const rails = [
  {
    name: "Wire transfer",
    speed: "Same day",
    note: "Best for >$10k",
    icon: Zap,
    strip: "strip-emerald",
  },
  {
    name: "ACH transfer",
    speed: "1–3 business days",
    note: "Free, no limits",
    icon: Clock,
    strip: "strip-blue",
  },
];

export default function DepositPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [destinationAccountId, setDestinationAccountId] = useState<string>("");
  useDefaultSourceAccount(destinationAccountId, setDestinationAccountId);

  const { data: customerRes } = useQuery({
    queryKey: ["customer"],
    queryFn: () => fetch("/api/customers").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });
  const customer = DEMO_MODE
    ? DEMO_CUSTOMER
    : customerRes?.data || customerRes;

  const { data: accountsRes, isLoading, refetch } = useQuery({
    queryKey: ["accounts", "onramp"],
    queryFn: () => fetch("/api/rails?type=onramp").then((r) => r.json()),
    enabled: !DEMO_MODE && customer?.kycStatus === "active",
    // Post-KYC provisioning creates the rail asynchronously (webhook-driven);
    // poll until the virtual account details exist, then stop.
    refetchInterval: (query) =>
      query.state.data?.data?.data?.[0]?.bankAccountInfo ? false : 5000,
  });
  const accounts = accountsRes?.data || accountsRes;
  const kycActive = customer?.kycStatus === "active";
  const [retrying, setRetrying] = useState(false);

  async function retryProvisioning() {
    setRetrying(true);
    try {
      const res = await fetch("/api/customers/provision", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message || "Setup retry failed");
      }
      await refetch();
      toast.success("Account setup re-run");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Setup retry failed");
    } finally {
      setRetrying(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  }

  const bankDetails = DEMO_MODE
    ? DEMO_BANK_DETAILS
    : accounts?.data?.[0]?.bankAccountInfo;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Deposit
        </h1>
        <p className="text-muted-foreground">
          Add funds via ACH or wire — auto-converted to USDC
        </p>
      </div>

      {!kycActive && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Complete KYC verification before making deposits.
          </AlertDescription>
        </Alert>
      )}

      {kycActive && customer?.kycReasonCode === "pending_proof_of_address" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">Deposits on hold.</span> You&apos;ve
            crossed the $3,000 / 7-day deposit limit — upload a proof of
            address to release held deposits.{" "}
            {customer?.applicationUrl ? (
              <a
                href={customer.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2"
              >
                Finish verification
              </a>
            ) : (
              <a
                href="/onboarding"
                className="font-medium underline underline-offset-2"
              >
                Finish verification
              </a>
            )}
          </AlertDescription>
        </Alert>
      )}

      {kycActive && (
        <>
          <SourceAccountPicker
            value={destinationAccountId}
            onChange={setDestinationAccountId}
            label="Deposit to"
          />

          {/* Hero stat */}
          <div className="bg-moneta-hero relative overflow-hidden rounded-2xl p-6 text-[#f6f6f6]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#4ac280]/30 blur-3xl" />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Deposit to
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  Your USDC wallet
                </p>
                <p className="text-sm text-white/70">
                  Send USD; we convert and credit on-chain.
                </p>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                Held at FDIC partner banks
              </div>
            </div>
          </div>

          {/* Rails */}
          <div className="grid gap-3 sm:grid-cols-2">
            {rails.map((r) => (
              <Card key={r.name} className={cn(r.strip)}>
                <CardContent className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <r.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.speed} · {r.note}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bank details */}
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    Bank transfer details
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Send USD via ACH or wire to this account
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : bankDetails ? (
                <div className="space-y-2">
                  {[
                    { label: "Bank Name", value: bankDetails.bank_name },
                    {
                      label: "Account Holder",
                      value: bankDetails.account_holder_name,
                    },
                    {
                      label: "Routing Number",
                      value: bankDetails.aba_routing_number,
                    },
                    {
                      label: "Account Number",
                      value: bankDetails.account_number,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="font-mono text-sm font-medium">
                          {item.value}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(item.value, item.label)}
                        aria-label={`Copy ${item.label}`}
                      >
                        {copied === item.label ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                  <p className="mt-3 font-medium text-foreground">
                    Setting up your deposit account
                  </p>
                  <p className="mt-1">
                    We&apos;re creating your personal account and routing
                    numbers — this usually takes under a minute.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    disabled={retrying}
                    onClick={retryProvisioning}
                  >
                    {retrying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Retry setup
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">Your funds are protected</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Deposits are held at FDIC-insured partner banks, eligible for
                pass-through insurance up to $250,000 per depositor.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, CheckCircle2, Building2, Info } from "lucide-react";
import { toast } from "sonner";

export default function DepositPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const { data: customerRes } = useQuery({
    queryKey: ["customer"],
    queryFn: () => fetch("/api/customers").then((r) => r.json()),
  });
  const customer = customerRes?.data || customerRes;

  const { data: accountsRes, isLoading } = useQuery({
    queryKey: ["accounts", "onramp"],
    queryFn: () => fetch("/api/accounts?type=onramp").then((r) => r.json()),
    enabled: customer?.kycStatus === "active",
  });
  const accounts = accountsRes?.data || accountsRes;

  const kycActive = customer?.kycStatus === "active";

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  }

  // Mock bank details for display (will be populated from Dakota account)
  const bankDetails = accounts?.data?.[0]?.bankAccountInfo;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deposit</h1>
        <p className="text-muted-foreground">Add funds to your account via bank transfer</p>
      </div>

      {!kycActive && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Complete KYC verification before making deposits.
          </AlertDescription>
        </Alert>
      )}

      {kycActive && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Bank Transfer Details</CardTitle>
                  <CardDescription>
                    Send USD via ACH or wire to this account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : bankDetails ? (
                <>
                  {[
                    { label: "Bank Name", value: bankDetails.bank_name },
                    { label: "Account Holder", value: bankDetails.account_holder_name },
                    { label: "Routing Number", value: bankDetails.aba_routing_number },
                    { label: "Account Number", value: bankDetails.account_number },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-mono text-sm font-medium">{item.value}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(item.value, item.label)}
                      >
                        {copied === item.label ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <p>No deposit account set up yet.</p>
                  <Button className="mt-4" onClick={() => {
                    fetch("/api/accounts", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ accountType: "onramp" }),
                    }).then(() => window.location.reload());
                  }}>
                    Set Up Deposit Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Supported Rails</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">ACH Transfer</span>
                <Badge variant="secondary">1-3 business days</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Wire Transfer (Fedwire)</span>
                <Badge variant="secondary">Same day</Badge>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Deposits are automatically converted to USDC and credited to your wallet.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}

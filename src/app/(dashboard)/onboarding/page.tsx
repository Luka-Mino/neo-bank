"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, XCircle, ExternalLink, Shield } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: customerRes, isLoading, refetch } = useQuery({
    queryKey: ["customer"],
    queryFn: () => fetch("/api/customers").then((r) => r.json()),
    refetchInterval: 10000,
  });
  const customer = customerRes?.data || customerRes;

  // Registration no longer creates the Dakota customer — this page does, on
  // first visit, so the creation is retryable (refresh retries it).
  const creationAttempted = useRef(false);
  const hasCustomer = Boolean(customer?.kycStatus);
  useEffect(() => {
    if (isLoading || hasCustomer || creationAttempted.current) return;
    creationAttempted.current = true;
    fetch("/api/customers", { method: "POST" }).then(() => refetch());
  }, [isLoading, hasCustomer, refetch]);

  // Proof-of-address holds arrive while status is (and stays) "active" —
  // keep the user here to resolve it instead of bouncing to the dashboard.
  const poaPending = customer?.kycReasonCode === "pending_proof_of_address";
  const poaRejected = customer?.kycReasonCode === "proof_of_address_rejected";
  const needsPoa = poaPending || poaRejected;

  useEffect(() => {
    if (customer?.kycStatus === "active" && !needsPoa) {
      router.push("/dashboard");
    }
  }, [customer?.kycStatus, needsPoa, router]);

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; text: string }> = {
    pending: {
      icon: <Clock className="h-8 w-8 text-amber-600" />,
      color: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30",
      text: "Verification Pending",
    },
    active: {
      icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
      color: "text-primary bg-primary/10",
      text: "Verified",
    },
    partner_review: {
      icon: <Clock className="h-8 w-8 text-muted-foreground" />,
      color: "text-muted-foreground bg-muted",
      text: "Under Review",
    },
    rejected: {
      icon: <XCircle className="h-8 w-8 text-rose-600" />,
      color: "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30",
      text: "Verification Failed",
    },
    frozen: {
      icon: <XCircle className="h-8 w-8 text-rose-600" />,
      color: "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30",
      text: "Account Frozen",
    },
  };

  const status = customer?.kycStatus || "pending";
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Identity Verification</h1>
        <p className="text-muted-foreground">
          Complete verification to start using your account
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          {isLoading ? (
            <Skeleton className="mx-auto h-8 w-8 rounded-full" />
          ) : (
            <div className="mx-auto">{config.icon}</div>
          )}
          <CardTitle>
            {isLoading ? <Skeleton className="mx-auto h-6 w-48" /> : config.text}
          </CardTitle>
          <CardDescription>
            {status === "pending" &&
              "Please complete the verification form to activate your account."}
            {status === "partner_review" &&
              "Your application is being reviewed. This usually takes 1-2 business days."}
            {status === "rejected" &&
              "Your verification was unsuccessful. Please contact support for assistance."}
            {status === "frozen" &&
              "Your account has been suspended. Please contact support."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">KYC Status</span>
            </div>
            <Badge variant="secondary" className={config.color}>
              {status}
            </Badge>
          </div>

          {needsPoa && (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {poaRejected
                  ? "Your proof of address was rejected"
                  : "Proof of address needed"}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {poaRejected
                  ? "The document you uploaded couldn't be accepted. Please upload a different one — deposits over the limit stay on hold until it's approved."
                  : "You've crossed the $3,000 / 7-day deposit limit. Upload a proof of address (utility bill, bank statement, or lease) to release held deposits."}
              </p>
              {customer?.applicationUrl && (
                <a
                  href={customer.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground"
                >
                  Upload document
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          {status === "pending" && customer?.applicationUrl && (
            <a
              href={customer.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground"
            >
              Complete Verification
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          {(status === "partner_review" || status === "pending") && (
            <Button variant="outline" className="w-full" onClick={() => refetch()}>
              Refresh Status
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verification Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { step: "Create account", done: true },
              { step: "Submit identity documents", done: status !== "pending" },
              { step: "Verification review", done: status === "active" },
              { step: "Account activated", done: status === "active" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    item.done
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.done ? "\u2713" : i + 1}
                </div>
                <span
                  className={`text-sm ${item.done ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {item.step}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

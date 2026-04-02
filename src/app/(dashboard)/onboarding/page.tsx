"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

  useEffect(() => {
    if (customer?.kycStatus === "active") {
      router.push("/dashboard");
    }
  }, [customer?.kycStatus, router]);

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; text: string }> = {
    pending: {
      icon: <Clock className="h-8 w-8 text-yellow-500" />,
      color: "text-yellow-600 bg-yellow-50",
      text: "Verification Pending",
    },
    active: {
      icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
      color: "text-green-600 bg-green-50",
      text: "Verified",
    },
    partner_review: {
      icon: <Clock className="h-8 w-8 text-blue-500" />,
      color: "text-blue-600 bg-blue-50",
      text: "Under Review",
    },
    rejected: {
      icon: <XCircle className="h-8 w-8 text-red-500" />,
      color: "text-red-600 bg-red-50",
      text: "Verification Failed",
    },
    frozen: {
      icon: <XCircle className="h-8 w-8 text-red-500" />,
      color: "text-red-600 bg-red-50",
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

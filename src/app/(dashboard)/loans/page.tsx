"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Landmark,
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const loanProducts = [
  {
    title: "Personal loan",
    description: "Fixed-rate financing for whatever you need.",
    amount: "Up to $10,000",
    term: "12–36 months",
    icon: Landmark,
    strip: "strip-emerald",
  },
  {
    title: "Credit line",
    description: "Flexible funds you can draw on anytime.",
    amount: "Up to $5,000",
    term: "Revolving",
    icon: FileText,
    strip: "strip-blue",
  },
  {
    title: "Stablecoin-backed",
    description: "Borrow USD against USDC collateral, no credit pull.",
    amount: "Up to 60% LTV",
    term: "Open",
    icon: Sparkles,
    strip: "strip-purple",
  },
];

const steps = [
  {
    title: "Apply",
    description: "Complete a quick application in minutes.",
    icon: FileText,
  },
  {
    title: "Get approved",
    description: "We review your profile and send a decision.",
    icon: CheckCircle,
  },
  {
    title: "Receive funds",
    description: "Approved funds land in the account you choose.",
    icon: ArrowRight,
  },
];

export default function LoansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Loans
        </h1>
        <p className="text-muted-foreground">
          Borrow with flexible terms — built on stablecoin rails
        </p>
      </div>

      {/* Hero */}
      <div className="bg-moneta-hero relative overflow-hidden rounded-2xl p-6 text-[#f6f6f6] md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#4ac280]/30 blur-3xl" />
        <div className="relative grid gap-4 md:grid-cols-[2fr_1fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              Coming soon
            </p>
            <p className="mt-2 text-2xl font-semibold md:text-3xl">
              Borrow on your terms — without the bank.
            </p>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              We&apos;re finalizing competitive rates with our lending partners.
              Be first in line for early access.
            </p>
            <Button
              variant="secondary"
              className="mt-4 bg-[#4ac280] text-[#0a1c1c] hover:bg-[#5ed092]"
              disabled
            >
              Join waitlist
            </Button>
          </div>
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
            <p className="text-xs text-white/60">Indicative APR from</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              7.49<span className="text-base text-white/60">%</span>
            </p>
            <p className="mt-1 text-xs text-white/50">
              Variable. Subject to credit review.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {loanProducts.map((product) => (
          <Card key={product.title} className={cn(product.strip)}>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <product.icon className="h-5 w-5" />
                </span>
                <Badge variant="secondary">Coming soon</Badge>
              </div>
              <div>
                <p className="text-base font-semibold">{product.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.description}
                </p>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{product.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Term</span>
                  <span className="font-medium">{product.term}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium text-muted-foreground">TBD</span>
                </div>
              </div>
              <Button className="w-full" disabled>
                Apply
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent>
          <p className="text-sm font-semibold">How it works</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="flex items-start gap-3 rounded-xl bg-muted/40 p-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border p-4">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="text-xs text-muted-foreground">
          Rates and terms are pending finalization with our lending partners.
          Estimates here are indicative only.
        </div>
        <ShieldCheck className="hidden h-4 w-4 text-primary sm:block" />
      </div>
    </div>
  );
}

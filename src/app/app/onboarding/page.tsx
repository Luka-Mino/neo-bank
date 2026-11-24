"use client";

// Identity verification — /app version of (dashboard)/onboarding.
// Same APIs: GET /api/customers (polled every 10s while waiting), POST
// /api/customers once on first visit to create the Dakota customer (retryable:
// a refresh tries again). The form itself is Dakota's hosted KYC page
// (customer.applicationUrl), opened in a new tab; https links only.
//
// Change vs the old screen: a verified user sees a "You're verified" state
// with a way into the app, instead of an automatic redirect.

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { FlowScreen, HelpCard } from "@/components/app/flow-screen";
import { ErrorState, LoadingRows, Notice } from "@/components/app/states";
import { safeHttpsUrl } from "@/components/app/api";
import { Button, ButtonLink, buttonClasses } from "@/components/brand/button";
import { IconDisc, type IconName } from "@/components/brand/icon";
import { DEMO_CUSTOMER, DEMO_MODE } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type Customer = { kycStatus?: string; kycReasonCode?: string; applicationUrl?: string };

const STATES: Record<string, { icon: IconName; title: string; body: string }> = {
  pending: {
    icon: "protection",
    title: "Verify your identity",
    body: "It only takes a few minutes. Have a government photo ID ready.",
  },
  partner_review: {
    icon: "security",
    title: "We're reviewing your details",
    body: "This usually takes 1–2 business days. You don't need to do anything; this page updates on its own.",
  },
  active: {
    icon: "protection",
    title: "You're verified",
    body: "Your account is open. You can add money, send, and use your card.",
  },
  rejected: {
    icon: "support",
    title: "We couldn't verify you",
    body: "Your verification wasn't successful. Contact support and we'll help you work out next steps.",
  },
  frozen: {
    icon: "freeze",
    title: "Your account is on hold",
    body: "Your account has been suspended. Contact support so we can help.",
  },
};

export default function OnboardingPage() {
  const q = useQuery<Customer | null>({
    queryKey: ["customer"],
    queryFn: async () => {
      if (DEMO_MODE) return DEMO_CUSTOMER;
      const r = await fetch("/api/customers");
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("customer");
      const j = await r.json();
      return (j?.data ?? null) as Customer | null;
    },
    refetchInterval: DEMO_MODE ? false : 10_000,
  });
  const customer = q.data ?? undefined;

  // Registration doesn't create the Dakota customer; this page does, once.
  const attempted = useRef(false);
  const hasCustomer = Boolean(customer?.kycStatus);
  const { refetch } = q;
  useEffect(() => {
    if (DEMO_MODE || q.isLoading || q.isError || hasCustomer || attempted.current) return;
    attempted.current = true;
    fetch("/api/customers", { method: "POST" }).finally(() => refetch());
  }, [q.isLoading, q.isError, hasCustomer, refetch]);

  const status = customer?.kycStatus ?? "pending";
  const state = STATES[status] ?? STATES.pending;
  const formUrl = safeHttpsUrl(customer?.applicationUrl);
  const poaPending = customer?.kycReasonCode === "pending_proof_of_address";
  const poaRejected = customer?.kycReasonCode === "proof_of_address_rejected";

  const steps = [
    { label: "Create your account", done: true },
    { label: "Submit your ID", done: status !== "pending" },
    { label: "We review it", done: status === "active" },
    { label: "Account open", done: status === "active" },
  ];

  return (
    <FlowScreen
      title="Identity verification"
      subtitle="Required by law before money can move. It keeps your account safe too."
      back={{ href: "/app", label: "Accounts" }}
      aside={
        <>
          <HelpCard title="Why we ask">
            <p>Every regulated financial service has to confirm who its customers are. It also stops anyone opening an account in your name.</p>
          </HelpCard>
          <HelpCard title="Your information">
            <p>
              Verification is handled by our regulated partner on their own secure page, which opens in a new tab.
            </p>
          </HelpCard>
        </>
      }
    >
      {q.isLoading || (!hasCustomer && !q.isError && !DEMO_MODE) ? (
        <div>
          <p role="status" className="mb-2 text-center text-[14px] text-forest/65">
            Getting things ready…
          </p>
          <LoadingRows rows={3} />
        </div>
      ) : q.isError ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : (
        <div>
          <div className="flex flex-col items-center text-center">
            <IconDisc name={state.icon} size={60} />
            <h2 className="mt-4 font-display text-[22px] font-semibold tracking-[-0.01em] text-forest">{state.title}</h2>
            <p className="mt-1.5 max-w-[40ch] text-[14.5px] leading-relaxed text-forest/65">{state.body}</p>
          </div>

          {(poaPending || poaRejected) && (
            <Notice tone="warning" className="mt-6" title={poaRejected ? "Your proof of address wasn't accepted" : "Proof of address needed"}>
              {poaRejected
                ? "Please upload a different document. Deposits over the limit stay on hold until it's approved."
                : "You've reached the $3,000 per 7 days deposit limit. Upload a utility bill, bank statement or lease to release held deposits."}
            </Notice>
          )}

          <div className="mt-6 space-y-2.5">
            {(status === "pending" || poaPending || poaRejected) && formUrl ? (
              <a href={formUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses({ block: true, size: "lg", className: "group/btn" })}>
                {status === "pending" ? "Start verification" : "Upload document"}
                <span aria-hidden className="text-turquoise">↗</span>
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : status === "pending" ? (
              <Notice tone="info">Your verification link is being prepared. This page checks again every few seconds.</Notice>
            ) : null}

            {status === "active" && !poaPending && !poaRejected && (
              <ButtonLink href="/app" block size="lg" arrow>
                Go to your accounts
              </ButtonLink>
            )}

            {(status === "pending" || status === "partner_review") && (
              <Button variant="secondary" block loading={q.isFetching} onClick={() => q.refetch()}>
                Check status
              </Button>
            )}
          </div>

          <ol className="mt-8 space-y-3 border-t border-forest/[0.07] pt-6">
            {steps.map((s, i) => (
              <li key={s.label} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold",
                    s.done ? "bg-turquoise text-forest-900" : "bg-forest/[0.07] text-forest/65"
                  )}
                >
                  {s.done ? "✓" : i + 1}
                </span>
                <span className={cn("text-[14.5px]", s.done ? "font-medium text-forest" : "text-forest/65")}>
                  {s.label}
                  <span className="sr-only">{s.done ? " (done)" : " (to do)"}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </FlowScreen>
  );
}

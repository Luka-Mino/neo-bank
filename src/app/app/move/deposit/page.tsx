"use client";

// Deposit — /app version of (dashboard)/deposit.
// Same APIs: GET /api/customers, GET /api/rails?type=onramp (polled until the
// virtual account exists), POST /api/customers/provision to retry setup.
//
// Changes vs the old screen (deliberate):
//  • No "Deposit to" picker: the webhook credits the org's PRIMARY account
//    (webhook-handlers.ts), so a picker implied a choice that didn't exist.
//  • No FDIC / pass-through insurance claim. USDC balances are not FDIC-
//    insured; copy matches the public-site disclosure.
//  • No "free, no limits" claim on ACH (limits exist; fees are Dakota's).

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { FlowScreen, HelpCard } from "@/components/app/flow-screen";
import { EmptyState, ErrorState, GlyphBadge, LoadingRows, Notice } from "@/components/app/states";
import { useCustomer } from "@/components/app/data";
import { safeHttpsUrl } from "@/components/app/api";
import { accountName, useActiveAccounts } from "@/components/app/account-picker";
import { Button, ButtonLink } from "@/components/brand/button";
import { DEMO_BANK_DETAILS, DEMO_MODE } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type BankInfo = {
  bank_name?: string;
  account_holder_name?: string;
  aba_routing_number?: string;
  account_number?: string;
};

export default function DepositPage() {
  const { customer, verified, isLoading: customerLoading, isError: customerError, refetch: refetchCustomer } = useCustomer();
  const { accounts } = useActiveAccounts();
  const primary = accounts.find((a) => a.isPrimary) ?? accounts[0];

  const rails = useQuery({
    queryKey: ["accounts", "onramp"],
    queryFn: async () => {
      const r = await fetch("/api/rails?type=onramp");
      if (!r.ok) throw new Error("rails");
      return r.json();
    },
    enabled: !DEMO_MODE && verified,
    // Provisioning is webhook-driven; poll until the details exist.
    refetchInterval: (q) => (q.state.data?.data?.data?.[0]?.bankAccountInfo ? false : 5000),
  });
  const bank: BankInfo | undefined = DEMO_MODE ? DEMO_BANK_DETAILS : rails.data?.data?.data?.[0]?.bankAccountInfo;

  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  async function retryProvisioning() {
    setRetrying(true);
    setRetryError(null);
    try {
      const res = await fetch("/api/customers/provision", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message || "Setup retry failed");
      }
      await rails.refetch();
    } catch (e) {
      setRetryError(e instanceof Error ? e.message : "Setup retry failed");
    } finally {
      setRetrying(false);
    }
  }

  const c = customer as (typeof customer & { kycReasonCode?: string; applicationUrl?: string }) | undefined;
  const onHold = c?.kycReasonCode === "pending_proof_of_address";
  const finishUrl = safeHttpsUrl(c?.applicationUrl);

  const details = bank
    ? [
        { label: "Bank name", value: bank.bank_name },
        { label: "Account holder", value: bank.account_holder_name },
        { label: "Routing number (ABA)", value: bank.aba_routing_number, mono: true },
        { label: "Account number", value: bank.account_number, mono: true },
      ].filter((d): d is { label: string; value: string; mono?: boolean } => !!d.value)
    : [];

  return (
    <FlowScreen
      title="Deposit"
      subtitle="Add money from another bank by ACH or wire."
      back={{ href: "/app/move", label: "Move money" }}
      aside={
        <>
          <HelpCard title="How deposits work">
            <p>Send US dollars from a US bank account to the details here, the same way you&apos;d pay any bank account.</p>
            <p>When it arrives we convert it to USDC and add it to your primary account. You&apos;ll get a notification.</p>
          </HelpCard>
          <HelpCard title="Where your money is held">
            <p>
              Your balance is held as USDC, a dollar-backed digital currency fully reserved by its issuer. It is not a bank deposit and is not
              insured by the FDIC.
            </p>
          </HelpCard>
        </>
      }
    >
      {customerLoading ? (
        <LoadingRows rows={4} />
      ) : customerError ? (
        <ErrorState onRetry={() => refetchCustomer()} />
      ) : !verified ? (
        <EmptyState
          icon="protection"
          title="Verify your identity to get deposit details"
          body="Your personal account and routing numbers are created once you're verified."
          action={
            <ButtonLink href="/app/onboarding" arrow>
              Verify now
            </ButtonLink>
          }
        />
      ) : (
        <div className="space-y-6">
          {onHold && (
            <Notice
              tone="warning"
              title="Deposits on hold"
              action={
                finishUrl ? (
                  <a
                    href={finishUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13.5px] font-semibold underline underline-offset-2"
                  >
                    Finish verification
                  </a>
                ) : (
                  <ButtonLink href="/app/onboarding" size="sm" variant="secondary" arrow>
                    Finish verification
                  </ButtonLink>
                )
              }
            >
              You&apos;ve reached the $3,000 per 7 days deposit limit. Upload a proof of address to release held deposits.
            </Notice>
          )}

          {primary && (
            <div className="flex items-center gap-3 rounded-[14px] bg-[#f3f5f4] px-4 py-3">
              <GlyphBadge name="deposit" />
              <p className="text-[14px] text-forest/70">
                Deposits go to <span className="font-semibold text-forest">{accountName(primary)}</span>, your primary account.
              </p>
            </div>
          )}

          <section aria-labelledby="bank-details">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 id="bank-details" className="text-[16px] font-semibold text-forest">
                  Your deposit details
                </h2>
                <p className="mt-0.5 text-[13px] text-forest/65">Give these to your other bank. They&apos;re only for you.</p>
              </div>
              {details.length > 0 && (
                <CopyButton
                  label="Copy all"
                  text={details.map((d) => `${d.label}: ${d.value}`).join("\n")}
                  what="Deposit details"
                />
              )}
            </div>

            <div className="mt-3 overflow-hidden rounded-[16px] ring-1 ring-forest/10">
              {!DEMO_MODE && rails.isLoading ? (
                <LoadingRows rows={4} label="Loading deposit details" />
              ) : details.length > 0 ? (
                <dl className="divide-y divide-forest/[0.07]">
                  {details.map((d) => (
                    <div key={d.label} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <dt className="text-[12.5px] text-forest/65">{d.label}</dt>
                        <dd className={cn("mt-0.5 truncate text-[15px] font-semibold text-forest", d.mono && "font-mono tracking-wide")}>
                          {d.value}
                        </dd>
                      </div>
                      <CopyButton text={d.value} what={d.label} />
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-[15px] font-semibold text-forest">Setting up your deposit account…</p>
                  <p className="mx-auto mt-1 max-w-[36ch] text-[13.5px] text-forest/65">
                    We&apos;re creating your account and routing numbers. This usually takes under a minute.
                  </p>
                  <Button variant="secondary" size="sm" className="mt-4" loading={retrying} onClick={retryProvisioning}>
                    Retry setup
                  </Button>
                  {retryError && <p className="mt-2 text-[13px] text-[#b42f34]">{retryError}</p>}
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="timing">
            <h2 id="timing" className="text-[16px] font-semibold text-forest">
              How long it takes
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              <li className="rounded-[14px] bg-[#f3f5f4] px-4 py-3.5">
                <p className="text-[14.5px] font-semibold text-forest">ACH transfer</p>
                <p className="mt-0.5 text-[13px] text-forest/65">1–3 business days</p>
              </li>
              <li className="rounded-[14px] bg-[#f3f5f4] px-4 py-3.5">
                <p className="text-[14.5px] font-semibold text-forest">Wire transfer</p>
                <p className="mt-0.5 text-[13px] text-forest/65">Usually the same business day. Your bank may charge for wires.</p>
              </li>
            </ul>
          </section>
        </div>
      )}
    </FlowScreen>
  );
}

function CopyButton({ text, what, label }: { text: string; what: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${what} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select the text and copy it instead.");
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label ? undefined : `Copy ${what}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] text-[13px] font-semibold transition outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]",
        label ? "h-9 px-3 text-turquoise-700 ring-1 ring-forest/12 hover:text-forest" : "h-9 w-9 text-forest/65 hover:bg-forest/[0.05] hover:text-forest"
      )}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" width={17} height={17} aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#2f8b58" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width={17} height={17} aria-hidden>
          <rect x="8.5" y="8.5" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth={1.75} />
          <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" fill="none" stroke="currentColor" strokeWidth={1.75} />
        </svg>
      )}
      {label && (copied ? "Copied" : label)}
    </button>
  );
}

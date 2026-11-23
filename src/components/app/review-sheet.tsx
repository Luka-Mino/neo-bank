"use client";

// Review-and-confirm sheet for every money movement.
//
// Guarantees:
//  • The fee line is always present, and says exactly what we know:
//      none        — "No fee" (internal transfers)
//      exact       — the amount, plus a total
//      at-creation — set by the payment partner when the transfer is created;
//                    shown on the receipt (see LAUNCH-READINESS-PLAN 2.x
//                    "quote step" for making it exact before confirm)
//  • One submit only: a ref guard + disabled button stop double-clicks, and
//    the sheet can't be dismissed while the request is in flight.
//  • A failure with an UNKNOWN outcome (network drop / 5xx) never offers a
//    blind retry; it points the user to Activity first.

import { useRef, useState, type ReactNode } from "react";
import { AppSheet } from "@/components/app/sheet";
import { DetailList, Notice, type DetailRow } from "@/components/app/states";
import { Button, ButtonLink } from "@/components/brand/button";
import { ApiError, setupActionFor } from "@/components/app/api";
import { formatUsd } from "@/lib/money-input";

export type FeeInfo =
  | { kind: "none" }
  | { kind: "exact"; amount: number }
  | { kind: "at-creation" };

export function ReviewSheet({
  open,
  onOpenChange,
  title,
  amount,
  caption,
  rows,
  fee,
  confirmLabel,
  onConfirm,
  notice,
  activityHref = "/app/activity",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Headline amount in dollars. */
  amount: number;
  /** Under the amount, e.g. "to Alice Johnson". */
  caption?: ReactNode;
  rows: DetailRow[];
  fee: FeeInfo;
  confirmLabel: string;
  /** Throw an ApiError (or any Error) to show it in the sheet. */
  onConfirm: () => Promise<void>;
  notice?: ReactNode;
  activityHref?: string;
}) {
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const unknownOutcome = error instanceof ApiError && error.outcome === "unknown";
  const setup = setupActionFor(error);

  async function confirm() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(e);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const feeRows: DetailRow[] =
    fee.kind === "none"
      ? [{ label: "Fee", value: "No fee" }]
      : fee.kind === "exact"
        ? [
            { label: "Fee", value: formatUsd(fee.amount) },
            { label: "Total", value: formatUsd(amount + fee.amount), strong: true },
          ]
        : [{ label: "Fee", value: "Set when the transfer is created" }];

  return (
    <AppSheet
      open={open}
      onOpenChange={(o) => {
        if (!o) setError(null);
        onOpenChange(o);
      }}
      title={title}
      busy={busy}
      footer={
        unknownOutcome ? (
          <ButtonLink href={activityHref} block arrow>
            Check activity
          </ButtonLink>
        ) : (
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
            <Button variant="secondary" block disabled={busy} onClick={() => onOpenChange(false)} className="sm:w-auto sm:flex-none">
              Edit
            </Button>
            <Button block loading={busy} onClick={confirm} className="sm:flex-1">
              {busy ? "Working…" : confirmLabel}
            </Button>
          </div>
        )
      }
    >
      <div className="rounded-[16px] bg-[#f3f5f4] px-4 py-5 text-center">
        <div className="tabular text-[36px] font-semibold leading-none tracking-[-0.02em]">{formatUsd(amount)}</div>
        {caption && <div className="mt-2 text-[14px] text-forest/65">{caption}</div>}
      </div>

      <DetailList rows={[...rows, ...feeRows]} className="mt-2" />

      {fee.kind === "at-creation" && (
        <p className="mt-1 text-[12.5px] leading-relaxed text-forest/55">
          Our payment partner sets any network or transfer fee when the transfer is created. You&apos;ll see it on your receipt. If your balance
          can&apos;t cover the amount plus fees, nothing is sent.
        </p>
      )}

      {notice && <div className="mt-4">{notice}</div>}

      {error != null && (
        <Notice
          tone={unknownOutcome ? "warning" : "error"}
          className="mt-4"
          title={unknownOutcome ? "We couldn't confirm this went through" : "This didn't go through"}
          action={
            setup ? (
              <ButtonLink href={setup.href} size="sm" variant="secondary" arrow>
                {setup.label}
              </ButtonLink>
            ) : undefined
          }
        >
          {unknownOutcome
            ? "It may still complete. Check your activity before trying again, so you don't pay twice."
            : error instanceof Error
              ? error.message
              : "Please try again."}
        </Notice>
      )}
    </AppSheet>
  );
}

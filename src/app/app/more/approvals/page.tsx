"use client";

// Approvals — /app version of (dashboard)/approvals (Team access, D4).
// Same APIs and server rules: GET /api/approvals?status=pending,
// POST /api/approvals/[id]/decisions { decision } (requires can_approve; the
// requester can never approve their own — enforced server-side).
// Added: a confirm step before approving, since approving releases money.

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { APP_CONTAINER } from "@/components/app/app-shell";
import { AppSheet } from "@/components/app/sheet";
import { DetailList, EmptyState, ErrorState, GlyphBadge, LoadingRows, Notice } from "@/components/app/states";
import { postJson } from "@/components/app/api";
import { Button } from "@/components/brand/button";
import type { IconName } from "@/components/brand/icon";
import { DEMO_APPROVALS, DEMO_MODE } from "@/lib/demo-data";
import { formatUsd } from "@/lib/money-input";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ApprovalRequest = {
  id: string;
  actionType: string;
  amount: string | null;
  asset: string | null;
  status: string;
  requiredApprovals: number;
  approvalsCount: number;
  requestedByName?: string;
  note?: string;
  createdAt: string;
};

const ACTION: Record<string, { label: string; icon: IconName }> = {
  "transfer.internal": { label: "Transfer between accounts", icon: "transfer" },
  "transfer.external": { label: "External payment", icon: "send" },
  "recipient.destination.add": { label: "New payout destination", icon: "accounts" },
  "recipient.destination.change": { label: "Payout address change", icon: "protection" },
};

function amountOf(r: ApprovalRequest) {
  if (!r.amount) return null;
  return !r.asset || r.asset === "USD" ? formatUsd(Number(r.amount)) : `${Number(r.amount).toLocaleString("en-US")} ${r.asset}`;
}

export default function ApprovalsPage() {
  const qc = useQueryClient();
  const [demoDone, setDemoDone] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ r: ApprovalRequest; decision: "approve" | "reject" } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["approvals", "pending"],
    queryFn: async () => {
      const r = await fetch("/api/approvals?status=pending");
      if (!r.ok) throw new Error("approvals");
      return ((await r.json())?.data?.data ?? []) as ApprovalRequest[];
    },
    enabled: !DEMO_MODE,
  });
  const requests = (DEMO_MODE ? (DEMO_APPROVALS as ApprovalRequest[]) : q.data ?? []).filter((r) => !demoDone.includes(r.id));

  const decide = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "approve" | "reject" }) => {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 500));
        setDemoDone((d) => [...d, id]);
        return;
      }
      await postJson(`/api/approvals/${encodeURIComponent(id)}/decisions`, { decision });
    },
    onMutate: () => setError(null),
    onSuccess: (_r, v) => {
      toast.success(v.decision === "approve" ? "Approved" : "Rejected");
      setConfirm(null);
    },
    onError: (e) => setError(e instanceof Error ? e.message : "We couldn't record your decision."),
    onSettled: () => qc.invalidateQueries({ queryKey: ["approvals"] }),
  });

  return (
    <div className="pb-10 lg:pb-16">
      <header className="bg-forest text-white">
        <div className={cn(APP_CONTAINER, "px-5 pb-6 pt-[max(1.1rem,env(safe-area-inset-top))] lg:pb-10 lg:pt-8")}>
          <Link href="/app/more" className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[13.5px] font-medium text-white/70 hover:text-white">
            <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden>
              <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            More
          </Link>
          <h1 className="mt-3 font-display text-[26px] font-semibold tracking-[-0.01em] lg:text-[32px]">Approvals</h1>
          <p className="mt-1 max-w-[60ch] text-[14px] text-white/65">
            Payments over your team&apos;s limits wait here for a second pair of eyes. Nobody can approve their own request.
          </p>
        </div>
      </header>

      <div className={cn(APP_CONTAINER, "mt-5 lg:mt-8")}>
        <div className="mx-4 overflow-hidden rounded-[18px] bg-white shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)] lg:mx-0 lg:max-w-[820px]">
          {q.isLoading && !DEMO_MODE ? (
            <LoadingRows rows={3} label="Loading approvals" />
          ) : q.isError && !DEMO_MODE ? (
            <ErrorState onRetry={() => q.refetch()} />
          ) : requests.length === 0 ? (
            <EmptyState icon="protection" title="Nothing waiting" body="Requests that need your approval will appear here." />
          ) : (
            <ul className="divide-y divide-forest/[0.06]">
              {requests.map((r) => {
                const meta = ACTION[r.actionType] ?? { label: r.actionType, icon: "accounts" as IconName };
                const amt = amountOf(r);
                return (
                  <li key={r.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <GlyphBadge name={meta.icon} />
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-forest">
                          {meta.label}
                          {amt && <span className="tabular"> · {amt}</span>}
                        </p>
                        {r.note && <p className="mt-0.5 truncate text-[13px] text-forest/65">{r.note}</p>}
                        <p className="mt-0.5 text-[12.5px] text-forest/50">
                          Requested by {r.requestedByName ?? "a teammate"} ·{" "}
                          <span className="font-semibold text-forest/70">
                            {r.approvalsCount} of {r.requiredApprovals} approvals
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2 sm:justify-end">
                      <Button size="sm" variant="danger" onClick={() => setConfirm({ r, decision: "reject" })}>
                        Reject
                      </Button>
                      <Button size="sm" onClick={() => setConfirm({ r, decision: "approve" })}>
                        Approve
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {confirm && (
        <AppSheet
          open
          onOpenChange={(o) => !o && setConfirm(null)}
          title={confirm.decision === "approve" ? "Approve this request?" : "Reject this request?"}
          description={
            confirm.decision === "approve"
              ? confirm.r.approvalsCount + 1 >= confirm.r.requiredApprovals
                ? "Yours is the last approval needed, so this will go ahead."
                : `It still needs ${confirm.r.requiredApprovals - confirm.r.approvalsCount - 1} more approval after yours.`
              : "The requester will need to start again."
          }
          busy={decide.isPending}
          footer={
            <Button
              block
              variant={confirm.decision === "approve" ? "primary" : "danger"}
              loading={decide.isPending}
              onClick={() => decide.mutate({ id: confirm.r.id, decision: confirm.decision })}
            >
              {confirm.decision === "approve" ? "Approve" : "Reject"}
            </Button>
          }
        >
          <DetailList
            rows={[
              { label: "What", value: (ACTION[confirm.r.actionType] ?? { label: confirm.r.actionType }).label },
              ...(amountOf(confirm.r) ? [{ label: "Amount", value: amountOf(confirm.r), strong: true }] : []),
              ...(confirm.r.note ? [{ label: "Note", value: confirm.r.note }] : []),
              { label: "Requested by", value: confirm.r.requestedByName ?? "A teammate" },
            ]}
          />
          {error && <Notice tone="error" className="mt-3">{error}</Notice>}
        </AppSheet>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ClipboardCheck,
  ArrowLeftRight,
  ArrowUpFromLine,
  MapPin,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { DEMO_MODE, DEMO_APPROVALS } from "@/lib/demo-data";

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

const ACTION_META: Record<string, { label: string; icon: typeof ArrowLeftRight }> = {
  "transfer.internal": { label: "Internal transfer", icon: ArrowLeftRight },
  "transfer.external": { label: "External payment", icon: ArrowUpFromLine },
  "recipient.destination.add": { label: "New payout destination", icon: MapPin },
  "recipient.destination.change": { label: "Payout address change", icon: MapPin },
};

function money(amount: string | null, asset: string | null) {
  if (!amount) return null;
  const n = Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${asset === "USD" || !asset ? "$" : ""}${n}${asset && asset !== "USD" ? ` ${asset}` : ""}`;
}

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [acting, setActing] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["approvals", "pending"],
    queryFn: () => fetchApi<{ data: ApprovalRequest[] }>("/api/approvals?status=pending"),
    enabled: !DEMO_MODE,
  });
  const requests: ApprovalRequest[] = DEMO_MODE
    ? (DEMO_APPROVALS as ApprovalRequest[])
    : data?.data ?? [];

  const decide = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "approve" | "reject" }) => {
      if (DEMO_MODE) return { status: decision === "approve" ? "approved" : "rejected" };
      return fetchApi(`/api/approvals/${id}/decisions`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
    },
    onMutate: ({ id }) => setActing(id),
    onSettled: () => setActing(null),
    onSuccess: (_r, { decision }) => {
      toast.success(decision === "approve" ? "Approved" : "Rejected");
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not record decision"),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Approvals</h1>
      <p className="mt-1 text-muted-foreground">
        Payments over your organization&apos;s policy thresholds wait here for a
        second pair of eyes. The person who requested a payment can never approve
        their own.
      </p>

      <div className="mt-8 space-y-3">
        {isLoading && !DEMO_MODE ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
            <ClipboardCheck className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nothing waiting for approval.</p>
          </div>
        ) : (
          requests.map((r) => {
            const meta = ACTION_META[r.actionType] ?? { label: r.actionType, icon: ArrowLeftRight };
            const Icon = meta.icon;
            const amt = money(r.amount, r.asset);
            return (
              <div
                key={r.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#4ac280]/10 text-[#2f8f5c]">
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{meta.label}</span>
                    {amt && <span className="text-sm font-semibold">· {amt}</span>}
                  </div>
                  {r.note && <div className="truncate text-sm text-muted-foreground">{r.note}</div>}
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Requested by {r.requestedByName ?? "a teammate"} ·{" "}
                    <span className="font-medium text-foreground/70">
                      {r.approvalsCount} of {r.requiredApprovals} approvals
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={acting === r.id}
                    onClick={() => decide.mutate({ id: r.id, decision: "reject" })}
                  >
                    <X className="mr-1.5 h-4 w-4" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    disabled={acting === r.id}
                    onClick={() => decide.mutate({ id: r.id, decision: "approve" })}
                  >
                    {acting === r.id ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-1.5 h-4 w-4" />
                    )}
                    Approve
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

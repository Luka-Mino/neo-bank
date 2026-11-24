"use client";

// Transaction detail — /app version of (dashboard)/transactions/[id].
// Same APIs: GET /api/transactions/[id], PATCH { category }.
// Money detail lives in metadata.receipt (Dakota webhooks): amounts, FX rate,
// fee lines, Fedwire IMAD/OMAD. Returns/reversals explain what happened to
// the money. Demo mode reads DEMO_TRANSACTIONS (the old page had no demo path).

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlowScreen, HelpCard } from "@/components/app/flow-screen";
import { DetailList, ErrorState, LoadingRows, Notice, type DetailRow } from "@/components/app/states";
import { signedMoney, txMeta, txStatus } from "@/components/app/data";
import { accountName } from "@/components/app/account-picker";
import { useAccountsQuery } from "@/components/account/use-accounts";
import { ButtonLink } from "@/components/brand/button";
import { IconDisc } from "@/components/brand/icon";
import { CATEGORIES, CATEGORY_KEYS, type CategoryKey } from "@/lib/categorize";
import { DEMO_MODE, DEMO_TRANSACTIONS } from "@/lib/demo-data";
import { formatUsd } from "@/lib/money-input";
import { cn } from "@/lib/utils";

type Receipt = {
  initial_amount?: string;
  input_currency?: string;
  outgoing_amount?: string;
  output_currency?: string;
  exchange_rate?: string;
  dakota_fee?: string;
  client_fee?: string;
  developer_fee?: string;
  gas_fee?: string;
  imad?: string;
  omad?: string;
};

type Tx = {
  id: string;
  accountId?: string;
  txType?: string;
  status?: string;
  category?: string;
  sourceAmount?: string;
  destinationAmount?: string;
  sourceAsset?: string;
  destinationAsset?: string;
  sourceNetwork?: string;
  destinationNetwork?: string;
  transactionHash?: string;
  dakotaTxId?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
};

const RETURNED = new Set(["returned", "reversed", "pending_return"]);

function when(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function explorerUrl(hash: string, network?: string): string | null {
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) return null;
  return network?.includes("sepolia") ? `https://sepolia.basescan.org/tx/${hash}` : `https://basescan.org/tx/${hash}`;
}

export function TransactionDetail({ id }: { id: string }) {
  const qc = useQueryClient();
  const accounts = useAccountsQuery();
  const q = useQuery<Tx | null>({
    queryKey: ["transaction", id],
    queryFn: async () => {
      if (DEMO_MODE) return (DEMO_TRANSACTIONS as Tx[]).find((t) => t.id === id) ?? null;
      const r = await fetch(`/api/transactions/${encodeURIComponent(id)}`);
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("transaction");
      const j = await r.json();
      return (j?.data ?? null) as Tx | null;
    },
  });

  const recategorize = useMutation({
    mutationFn: async (category: CategoryKey) => {
      if (DEMO_MODE) return;
      const r = await fetch(`/api/transactions/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.error?.message || "Couldn't update the category");
    },
    onMutate: (category) => qc.setQueryData<Tx | null>(["transaction", id], (old) => (old ? { ...old, category } : old)),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["transaction", id] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  const tx = q.data;
  const back = { href: "/app/activity", label: "Activity" };

  if (q.isLoading) {
    return (
      <FlowScreen title="Transaction" back={back}>
        <LoadingRows rows={5} label="Loading transaction" />
      </FlowScreen>
    );
  }
  if (q.isError) {
    return (
      <FlowScreen title="Transaction" back={back}>
        <ErrorState onRetry={() => q.refetch()} />
      </FlowScreen>
    );
  }
  if (!tx) {
    return (
      <FlowScreen title="Transaction" back={back}>
        <div className="py-8 text-center">
          <p className="text-[16px] font-semibold text-forest">We couldn&apos;t find that transaction</p>
          <p className="mt-1 text-[14px] text-forest/65">It may belong to a different account or organisation.</p>
          <ButtonLink href="/app/activity" variant="secondary" size="sm" className="mt-5">
            Back to activity
          </ButtonLink>
        </div>
      </FlowScreen>
    );
  }

  const meta = txMeta(tx.txType);
  const status = txStatus(tx.status);
  const m = tx.metadata ?? {};
  const receipt = (m.receipt ?? {}) as Receipt;
  const reference = m.payment_reference as string | undefined;
  const returnCode = m.return_code as string | undefined;
  const reason = (m.return_reason ?? m.failure_reason) as string | undefined;
  const account = (accounts.data ?? []).find((a) => a.id === tx.accountId);
  const isIn = meta.direction === "in";

  const feeRows: DetailRow[] = [
    { label: "Transfer fee", value: receipt.dakota_fee },
    { label: "Platform fee", value: receipt.client_fee ?? receipt.developer_fee },
    { label: "Network fee", value: receipt.gas_fee },
  ]
    .filter((f) => f.value && Number(f.value) > 0)
    .map((f) => ({ label: f.label, value: formatUsd(Number(f.value)) }));

  const rows: DetailRow[] = [
    { label: "Status", value: status.label },
    ...(account ? [{ label: isIn ? "To" : "From", value: accountName(account) }] : []),
    ...(receipt.initial_amount
      ? [{ label: "Amount sent", value: `${formatUsd(Number(receipt.initial_amount))} ${receipt.input_currency ?? ""}`.trim() }]
      : []),
    ...(receipt.outgoing_amount
      ? [{ label: "Amount received", value: `${formatUsd(Number(receipt.outgoing_amount))} ${receipt.output_currency ?? ""}`.trim() }]
      : []),
    ...(receipt.exchange_rate ? [{ label: "Exchange rate", value: receipt.exchange_rate }] : []),
    ...(feeRows.length
      ? feeRows
      : tx.txType === "internal_in" || tx.txType === "internal_out"
        ? [{ label: "Fee", value: "No fee" }]
        : []),
    ...(reference ? [{ label: "Reference", value: <span className="font-mono">{reference}</span> }] : []),
    ...(receipt.imad ? [{ label: "Wire IMAD", value: <span className="font-mono text-[12.5px]">{receipt.imad}</span> }] : []),
    ...(receipt.omad ? [{ label: "Wire OMAD", value: <span className="font-mono text-[12.5px]">{receipt.omad}</span> }] : []),
    { label: "Started", value: when(tx.createdAt) },
    { label: "Last update", value: when(tx.updatedAt) },
  ];

  const hashUrl = tx.transactionHash ? explorerUrl(tx.transactionHash, tx.sourceNetwork ?? tx.destinationNetwork) : null;
  const steps = ["Started", "Processing", status.tone === "problem" ? status.label : "Completed"];
  const reached = status.tone === "done" ? 3 : status.tone === "problem" ? 3 : tx.status === "processing" ? 2 : 1;

  return (
    <FlowScreen
      title={meta.label}
      back={back}
      aside={
        <HelpCard title="Something not right?">
          <p>If you don&apos;t recognise this, or it&apos;s taking longer than expected, contact support and quote the transaction ID below.</p>
          <p className="break-all font-mono text-[12px] text-forest/65">{tx.id}</p>
        </HelpCard>
      }
    >
      <div className="flex flex-col items-center text-center">
        <IconDisc name={meta.glyph} size={52} />
        <div
          className={cn(
            "tabular mt-4 text-[34px] font-semibold tracking-[-0.02em]",
            isIn ? "text-turquoise-700" : "text-forest",
            status.tone === "problem" && "text-forest/40 line-through decoration-forest/30"
          )}
        >
          {signedMoney(Number(tx.sourceAmount || 0), meta.direction)}
        </div>
        <span
          className={cn(
            "mt-2 rounded-full px-3 py-1 text-[12.5px] font-semibold",
            status.tone === "done" && "bg-turquoise-50 text-turquoise-700",
            status.tone === "pending" && "bg-[#fff7e6] text-[#8a5a00]",
            status.tone === "problem" && "bg-[#c4363b]/[0.08] text-[#b42f34]"
          )}
        >
          {status.label}
        </span>
      </div>

      {RETURNED.has(tx.status ?? "") && (
        <Notice tone="warning" className="mt-5" title={isIn ? "This deposit was returned" : "This transfer didn't complete"}>
          {isIn
            ? `The sending bank returned it${returnCode ? ` (code ${returnCode})` : ""}, so it's been removed from your balance.`
            : `It was returned${returnCode ? ` (code ${returnCode})` : ""} and the amount is back in your account.`}
          {reason ? ` Reason: ${reason}.` : ""}
        </Notice>
      )}
      {(tx.status === "failed" || tx.status === "canceled") && !RETURNED.has(tx.status) && (
        <Notice tone="error" className="mt-5" title="This didn't go through">
          {reason ? `${reason}. ` : ""}Any money held for it has been returned to your account.
        </Notice>
      )}

      <ol aria-label="Progress" className="mt-6 flex items-center gap-2">
        {steps.map((s, i) => {
          const on = i < reached;
          const bad = status.tone === "problem" && i === 2;
          return (
            <li key={s} className="flex flex-1 flex-col items-center gap-1.5">
              <span className={cn("h-1.5 w-full rounded-full", bad ? "bg-[#c4363b]/60" : on ? "bg-turquoise" : "bg-forest/10")} />
              <span className={cn("text-[11.5px] font-medium", on ? "text-forest" : "text-forest/40")}>
                {s}
                {on && <span className="sr-only"> (done)</span>}
              </span>
            </li>
          );
        })}
      </ol>

      <DetailList rows={rows} className="mt-4" />

      {hashUrl && (
        <a
          href={hashUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex items-center justify-between gap-3 border-t border-forest/[0.07] py-3 text-[14px]"
        >
          <span className="text-forest/65">On-chain record</span>
          <span className="font-mono text-[12.5px] font-medium text-turquoise-700 hover:text-forest">
            {tx.transactionHash!.slice(0, 10)}…{tx.transactionHash!.slice(-8)} ↗
          </span>
        </a>
      )}

      <div className="mt-2 border-t border-forest/[0.07] pt-4">
        <label className="flex items-center justify-between gap-4">
          <span className="text-[14px] text-forest/65">Category</span>
          <select
            value={(tx.category as CategoryKey) ?? "other"}
            onChange={(e) => recategorize.mutate(e.target.value as CategoryKey)}
            className="h-10 rounded-[10px] bg-[#f3f5f4] px-3 text-[14px] font-medium text-forest outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
          >
            {CATEGORY_KEYS.map((k) => (
              <option key={k} value={k}>
                {CATEGORIES[k].label}
              </option>
            ))}
          </select>
        </label>
        {recategorize.isError && <p className="mt-2 text-[13px] text-[#b42f34]">{(recategorize.error as Error).message}</p>}
      </div>

      <Link
        href={`/app/more/help?tx=${encodeURIComponent(tx.id)}`}
        className="mt-2 flex items-center justify-between gap-3 border-t border-forest/[0.07] pt-4 text-[14px] font-medium text-turquoise-700 hover:text-forest"
      >
        Report a problem with this payment
        <span aria-hidden>→</span>
      </Link>
    </FlowScreen>
  );
}

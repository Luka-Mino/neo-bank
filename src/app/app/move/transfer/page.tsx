"use client";

// Transfer between your own accounts — /app version of (dashboard)/transfer-internal.
// Same APIs: POST /api/transfers/internal (+ POST /api/transfers/recurring
// for "Repeat"), standing orders listed/cancelled via /api/transfers/recurring.
//
// Fixes vs the old screen:
//  • a transfer held for approval (maker/checker) says so, instead of
//    "Transfer complete"
//  • if the transfer succeeds but the repeat can't be scheduled, we report
//    the transfer as done and the repeat as failed (money did move)

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlowScreen, HelpCard } from "@/components/app/flow-screen";
import { AmountInput } from "@/components/app/amount-input";
import { AccountPicker, accountName, useActiveAccounts, useDefaultAccount } from "@/components/app/account-picker";
import { Segmented, TextField } from "@/components/app/fields";
import { ReviewSheet } from "@/components/app/review-sheet";
import { Notice, SuccessState } from "@/components/app/states";
import { postJson } from "@/components/app/api";
import { Button, ButtonLink } from "@/components/brand/button";
import { Icon } from "@/components/brand/icon";
import type { AccountRow } from "@/components/account/use-accounts";
import { checkAmount, formatUsd, parseAmount, toApiAmount } from "@/lib/money-input";
import { queryKeys } from "@/lib/queries";
import { DEMO_MODE } from "@/lib/demo-data";

type Repeat = "once" | "weekly" | "biweekly" | "monthly";
const REPEAT_LABEL: Record<Repeat, string> = {
  once: "Just once",
  weekly: "Every week",
  biweekly: "Every 2 weeks",
  monthly: "Every month",
};

type Done =
  | { kind: "complete"; amount: number; from: string; to: string; repeat: Repeat; repeatFailed?: string }
  | { kind: "approval"; amount: number; from: string; to: string; required?: number };

export default function TransferPage() {
  const qc = useQueryClient();
  const { accounts } = useActiveAccounts();
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [repeat, setRepeat] = useState<Repeat>("once");
  const [showErrors, setShowErrors] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const preferFrom = useSearchParams()?.get("from");
  const setFrom = useCallback((id: string) => setFromId(id), []);
  useDefaultAccount(fromId, setFrom, { preferId: preferFrom });
  const setTo = useCallback((id: string) => setToId(id), []);
  useDefaultAccount(toId, setTo, { exclude: fromId, enabled: !!fromId });

  const from = accounts.find((a) => a.id === fromId);
  const to = accounts.find((a) => a.id === toId);
  const amountCheck = checkAmount(amount, { available: from ? Number(from.balance) : undefined });
  const errors = {
    from: !from ? "Choose where the money comes from" : undefined,
    to: !to ? "Choose where it goes" : from && to && from.id === to.id ? "Pick a different account" : undefined,
    amount: amountCheck.ok ? undefined : amountCheck.message,
  };
  const valid = !errors.from && !errors.to && !errors.amount;

  function changeFrom(id: string) {
    setFromId(id);
    if (id === toId) setToId("");
  }

  async function transfer() {
    if (!from || !to) return;
    const value = parseAmount(amount);
    const base = { amount: value, from: accountName(from), to: accountName(to) };
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 700));
      qc.setQueryData<AccountRow[]>(queryKeys.accounts.list, (old) =>
        (old ?? []).map((a) =>
          a.id === from.id
            ? { ...a, balance: (Number(a.balance) - value).toFixed(2) }
            : a.id === to.id
              ? { ...a, balance: (Number(a.balance) + value).toFixed(2) }
              : a
        )
      );
      setReviewing(false);
      setDone({ kind: "complete", ...base, repeat });
      return;
    }

    const payload = {
      fromAccountId: from.id,
      toAccountId: to.id,
      amount: toApiAmount(amount),
      note: note.trim() || undefined,
    };
    const res = await postJson<{ status?: string; requiredApprovals?: number }>("/api/transfers/internal", payload);
    qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
    qc.invalidateQueries({ queryKey: ["transactions"] });

    if (res?.status === "pending_approval") {
      qc.invalidateQueries({ queryKey: ["approvals"] });
      setReviewing(false);
      setDone({ kind: "approval", ...base, required: res.requiredApprovals });
      return;
    }

    let repeatFailed: string | undefined;
    if (repeat !== "once") {
      try {
        await postJson("/api/transfers/recurring", { ...payload, frequency: repeat });
        qc.invalidateQueries({ queryKey: ["recurring-transfers"] });
      } catch (e) {
        repeatFailed = e instanceof Error ? e.message : "We couldn't set up the repeat.";
      }
    }
    setReviewing(false);
    setDone({ kind: "complete", ...base, repeat, repeatFailed });
  }

  function reset() {
    setDone(null);
    setAmount("");
    setNote("");
    setRepeat("once");
    setShowErrors(false);
  }

  return (
    <FlowScreen
      title="Transfer between accounts"
      subtitle="Move money between your Moneta accounts. Arrives in seconds, free."
      back={{ href: "/app/move", label: "Move money" }}
      aside={
        <>
          {!DEMO_MODE && <StandingOrders />}
          <HelpCard title="Good to know">
            <p>Transfers between your own accounts arrive in seconds and are free.</p>
            <p>Choose a repeat to move the same amount on a schedule, for example putting money toward a goal every payday.</p>
          </HelpCard>
        </>
      }
    >
      {done ? (
        done.kind === "approval" ? (
          <SuccessState
            title="Sent for approval"
            amount={formatUsd(done.amount)}
            body={`This transfer needs ${done.required && done.required > 1 ? `${done.required} approvals` : "approval"} from your team before it moves. We'll let you know when it's done.`}
            rows={[
              { label: "From", value: done.from },
              { label: "To", value: done.to },
            ]}
            actions={
              <>
                <ButtonLink href="/app/more/approvals" block>
                  View approvals
                </ButtonLink>
                <Button variant="secondary" block onClick={reset}>
                  New transfer
                </Button>
              </>
            }
          />
        ) : (
          <>
            <SuccessState
              title="Transfer complete"
              amount={formatUsd(done.amount)}
              body={`Moved from ${done.from} to ${done.to}.`}
              rows={[
                { label: "From", value: done.from },
                { label: "To", value: done.to },
                { label: "Repeats", value: done.repeatFailed ? "Not set up" : REPEAT_LABEL[done.repeat] },
                { label: "Fee", value: "No fee" },
              ]}
              actions={
                <>
                  <ButtonLink href="/app" block>
                    Done
                  </ButtonLink>
                  <Button variant="secondary" block onClick={reset}>
                    New transfer
                  </Button>
                </>
              }
            />
            {done.repeatFailed && (
              <Notice tone="warning" title="The transfer went through, but the repeat wasn't set up" className="mx-auto max-w-[420px]">
                {done.repeatFailed} You can try setting it up again with a new transfer.
              </Notice>
            )}
          </>
        )
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setShowErrors(true);
            if (valid) setReviewing(true);
          }}
          className="space-y-6"
        >
          <div className="relative space-y-3">
            <AccountPicker label="From" value={fromId} onChange={changeFrom} error={showErrors ? errors.from : undefined} />
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setFromId(toId);
                  setToId(fromId);
                }}
                aria-label="Swap from and to accounts"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-forest ring-1 ring-forest/15 transition hover:ring-forest/35 outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]"
              >
                <Icon name="transfer" size={18} className="rotate-90" />
              </button>
            </div>
            <AccountPicker label="To" value={toId} onChange={setToId} exclude={fromId} error={showErrors ? errors.to : undefined} />
          </div>

          <AmountInput
            value={amount}
            onChange={setAmount}
            available={from ? Number(from.balance) : undefined}
            error={showErrors ? errors.amount : undefined}
          />

          <TextField
            label="Note (optional)"
            placeholder="e.g. Rainy day fund"
            maxLength={120}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <Segmented<Repeat>
            label="Repeat"
            value={repeat}
            onChange={setRepeat}
            options={[
              { value: "once", label: "Once" },
              { value: "weekly", label: "Weekly" },
              { value: "biweekly", label: "2 weeks" },
              { value: "monthly", label: "Monthly" },
            ]}
          />

          <Button type="submit" block arrow size="lg">
            Review
          </Button>
        </form>
      )}

      {from && to && (
        <ReviewSheet
          open={reviewing}
          onOpenChange={setReviewing}
          title="Review transfer"
          amount={parseAmount(amount)}
          caption={
            <>
              {accountName(from)} → {accountName(to)}
            </>
          }
          rows={[
            { label: "From", value: `${accountName(from)} · ${formatUsd(Number(from.balance))}` },
            { label: "To", value: accountName(to) },
            { label: "Arrives", value: "In seconds" },
            { label: "Repeats", value: REPEAT_LABEL[repeat] },
            ...(note.trim() ? [{ label: "Note", value: note.trim() }] : []),
          ]}
          fee={{ kind: "none" }}
          confirmLabel={`Transfer ${formatUsd(parseAmount(amount))}`}
          onConfirm={transfer}
        />
      )}
    </FlowScreen>
  );
}

type RecurringRule = {
  id: string;
  amount: string;
  note: string | null;
  frequency: string;
  nextRunAt: string;
  fromLabel: string | null;
  fromType: string;
  toLabel: string | null;
  toType: string;
};

function StandingOrders() {
  const qc = useQueryClient();
  const [confirming, setConfirming] = useState<string | null>(null);
  const { data } = useQuery({
    queryKey: ["recurring-transfers"],
    queryFn: async () => {
      const r = await fetch("/api/transfers/recurring");
      if (!r.ok) throw new Error("recurring");
      return ((await r.json())?.data?.data ?? []) as RecurringRule[];
    },
  });
  const cancel = useMutation({
    mutationFn: (id: string) => postJson(`/api/transfers/recurring/${encodeURIComponent(id)}`, {}, { method: "DELETE" }),
    onSettled: () => qc.invalidateQueries({ queryKey: ["recurring-transfers"] }),
  });
  const rules = data ?? [];
  if (rules.length === 0) return null;

  return (
    <div className="rounded-[18px] bg-white p-5 shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)]">
      <h2 className="text-[14px] font-semibold text-forest">Standing orders</h2>
      <ul className="mt-2 divide-y divide-forest/[0.06]">
        {rules.map((r) => (
          <li key={r.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-forest">
                <span className="tabular">{formatUsd(Number(r.amount))}</span> · {r.fromLabel || r.fromType} → {r.toLabel || r.toType}
              </p>
              <p className="mt-0.5 text-[12.5px] text-forest/65">
                {r.frequency === "biweekly" ? "Every 2 weeks" : r.frequency === "weekly" ? "Every week" : "Every month"} · next{" "}
                {new Date(r.nextRunAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {r.note ? ` · ${r.note}` : ""}
              </p>
            </div>
            <Button
              size="sm"
              variant={confirming === r.id ? "danger" : "quiet"}
              loading={cancel.isPending && cancel.variables === r.id}
              onClick={() => {
                if (confirming === r.id) {
                  cancel.mutate(r.id);
                  setConfirming(null);
                } else {
                  setConfirming(r.id);
                  setTimeout(() => setConfirming((c) => (c === r.id ? null : c)), 4000);
                }
              }}
            >
              {confirming === r.id ? "Confirm cancel" : "Cancel"}
            </Button>
          </li>
        ))}
      </ul>
      {cancel.isError && <p className="mt-2 text-[13px] text-[#b42f34]">{(cancel.error as Error).message}</p>}
    </div>
  );
}

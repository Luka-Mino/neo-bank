"use client";

// Account management for /app (2.7): rename, savings goal, set primary,
// close, and opening a new account. Same APIs as (dashboard)/accounts:
// PATCH /api/accounts/[id] { nickname | goalAmount | setPrimary },
// DELETE /api/accounts/[id] (soft close — the server enforces the rules),
// POST /api/accounts { accountType, nickname }.

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppSheet } from "@/components/app/sheet";
import { AmountInput } from "@/components/app/amount-input";
import { Segmented, TextField } from "@/components/app/fields";
import { Notice } from "@/components/app/states";
import { postJson } from "@/components/app/api";
import { accountName } from "@/components/app/account-picker";
import type { AccountRow } from "@/components/account/use-accounts";
import { Button } from "@/components/brand/button";
import { Icon, type IconName } from "@/components/brand/icon";
import { DEMO_MODE } from "@/lib/demo-data";
import { formatUsd, parseAmount, toApiAmount } from "@/lib/money-input";
import { queryKeys } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Sheet = null | "rename" | "goal" | "close";

function useAccountsCache() {
  const qc = useQueryClient();
  return {
    patchDemo: (id: string, patch: Partial<AccountRow>) =>
      qc.setQueryData<AccountRow[]>(queryKeys.accounts.list, (old) => (old ?? []).map((a) => (a.id === id ? { ...a, ...patch } : a))),
    refresh: () => qc.invalidateQueries({ queryKey: queryKeys.accounts.all }),
  };
}

export function GoalProgress({ balance, goal }: { balance: number; goal: number }) {
  const pct = Math.min(100, Math.round((balance / goal) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="font-semibold text-forest">{pct}% of {formatUsd(goal)}</span>
        <span className="text-forest/65">{balance >= goal ? "Goal reached" : `${formatUsd(goal - balance)} to go`}</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Savings goal progress"
        className="mt-2 h-2 overflow-hidden rounded-full bg-forest/[0.08]"
      >
        <div className="h-full rounded-full bg-turquoise transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function AccountManage({ account }: { account: AccountRow }) {
  const router = useRouter();
  const { patchDemo, refresh } = useAccountsCache();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [nickname, setNickname] = useState(account.nickname ?? "");
  const [goal, setGoal] = useState(account.goalAmount ?? "");
  const [error, setError] = useState<string | null>(null);
  const goalNum = account.goalAmount ? Number(account.goalAmount) : 0;
  const balance = Number(account.balance);

  const patch = useMutation({
    mutationFn: async (body: { nickname?: string; goalAmount?: string | null; setPrimary?: true }) => {
      if (DEMO_MODE) {
        patchDemo(account.id, {
          ...(body.nickname !== undefined ? { nickname: body.nickname } : {}),
          ...(body.goalAmount !== undefined ? { goalAmount: body.goalAmount } : {}),
        });
        return;
      }
      await postJson(`/api/accounts/${encodeURIComponent(account.id)}`, body, { method: "PATCH" });
    },
    onMutate: () => setError(null),
    onSuccess: () => setSheet(null),
    onError: (e) => setError(e instanceof Error ? e.message : "That didn't work."),
    onSettled: refresh,
  });

  const close = useMutation({
    mutationFn: async () => {
      if (DEMO_MODE) {
        patchDemo(account.id, { status: "closed" });
        return;
      }
      await postJson(`/api/accounts/${encodeURIComponent(account.id)}`, {}, { method: "DELETE" });
    },
    onMutate: () => setError(null),
    onSuccess: () => {
      toast.success(`${accountName(account)} closed`);
      router.push("/app");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "We couldn't close this account."),
    onSettled: refresh,
  });

  const open = (s: Sheet) => {
    setError(null);
    setNickname(account.nickname ?? "");
    setGoal(account.goalAmount ?? "");
    setSheet(s);
  };

  const actions: { icon: IconName; label: string; hint?: string; onClick: () => void; hidden?: boolean; danger?: boolean }[] = [
    { icon: "accounts", label: "Rename", hint: accountName(account), onClick: () => open("rename") },
    {
      icon: "goals",
      label: goalNum > 0 ? "Edit savings goal" : "Set a savings goal",
      hint: goalNum > 0 ? formatUsd(goalNum) : "Watch a fund grow",
      onClick: () => open("goal"),
    },
    { icon: "reserve", label: "Make this my primary account", hint: "Deposits land here", onClick: () => patch.mutate({ setPrimary: true }), hidden: account.isPrimary },
    { icon: "withdraw", label: "Close account", onClick: () => open("close"), hidden: account.isPrimary, danger: true },
  ];

  return (
    <div className="mx-4 mt-5 space-y-4 lg:mx-0">
      {goalNum > 0 && (
        <div className="rounded-[18px] bg-white p-4 shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)]">
          <GoalProgress balance={balance} goal={goalNum} />
        </div>
      )}
      <ul className="overflow-hidden rounded-[18px] bg-white shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)]">
        {actions
          .filter((a) => !a.hidden)
          .map((a) => (
            <li key={a.label} className="border-b border-forest/[0.06] last:border-b-0">
              <button
                type="button"
                onClick={a.onClick}
                disabled={patch.isPending && a.icon === "reserve"}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-forest/[0.02] outline-none focus-visible:bg-turquoise-50/60"
              >
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", a.danger ? "bg-[#c4363b]/[0.08] text-[#b42f34]" : "bg-turquoise-50 text-forest")}>
                  <Icon name={a.icon} size={18} className={a.danger ? "[--icon-signal:#b42f34]" : undefined} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[14.5px] font-semibold", a.danger ? "text-[#b42f34]" : "text-forest")}>{a.label}</span>
                  {a.hint && <span className="mt-0.5 block truncate text-[12.5px] text-forest/65">{a.hint}</span>}
                </span>
              </button>
            </li>
          ))}
      </ul>
      {error && sheet === null && <Notice tone="error">{error}</Notice>}

      <AppSheet
        open={sheet === "rename"}
        onOpenChange={(o) => !o && setSheet(null)}
        title="Rename account"
        busy={patch.isPending}
        footer={
          <Button block loading={patch.isPending} disabled={!nickname.trim() || nickname.trim() === account.nickname} onClick={() => patch.mutate({ nickname: nickname.trim() })}>
            Save
          </Button>
        }
      >
        <TextField label="Name" maxLength={40} value={nickname} onChange={(e) => setNickname(e.target.value)} autoFocus />
        {error && <Notice tone="error" className="mt-3">{error}</Notice>}
      </AppSheet>

      <AppSheet
        open={sheet === "goal"}
        onOpenChange={(o) => !o && setSheet(null)}
        title={goalNum > 0 ? "Edit savings goal" : "Set a savings goal"}
        description="We'll show how close this account is to your target."
        busy={patch.isPending}
        footer={
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
            {goalNum > 0 && (
              <Button variant="quiet" block disabled={patch.isPending} onClick={() => patch.mutate({ goalAmount: null })} className="sm:w-auto sm:flex-none">
                Remove goal
              </Button>
            )}
            <Button block loading={patch.isPending} disabled={parseAmount(goal) <= 0} onClick={() => patch.mutate({ goalAmount: toApiAmount(goal) })} className="sm:flex-1">
              Save goal
            </Button>
          </div>
        }
      >
        <AmountInput label="Target" value={goal} onChange={setGoal} presets={[1000, 5000, 10000]} />
        {error && <Notice tone="error" className="mt-3">{error}</Notice>}
      </AppSheet>

      <AppSheet
        open={sheet === "close"}
        onOpenChange={(o) => !o && setSheet(null)}
        title={`Close ${accountName(account)}?`}
        description="You can't reopen a closed account. Move any money out first."
        busy={close.isPending}
        footer={
          <Button block variant="danger" loading={close.isPending} onClick={() => close.mutate()}>
            Close account
          </Button>
        }
      >
        <div className="rounded-[14px] bg-[#f3f5f4] px-4 py-3 text-[14px] text-forest/75">
          Balance: <span className="font-semibold text-forest">{formatUsd(balance)}</span>
        </div>
        {balance > 0 && (
          <Notice tone="warning" className="mt-3">
            This account still has money in it. Transfer it to another account before closing.
          </Notice>
        )}
        {error && <Notice tone="error" className="mt-3">{error}</Notice>}
      </AppSheet>
    </div>
  );
}

export function OpenAccountButton({ className }: { className?: string }) {
  const qc = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"checking" | "savings">("savings");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: async () => {
      const name = nickname.trim() || (type === "savings" ? "Savings" : "Checking");
      if (DEMO_MODE) {
        const fresh: AccountRow = {
          id: `acct-${Date.now()}`,
          accountType: type,
          nickname: name,
          accountNumber: `40${Math.floor(Math.random() * 1e12)}`,
          currency: "USD",
          balance: "0.00",
          status: "active",
          isPrimary: false,
        };
        qc.setQueryData<AccountRow[]>(queryKeys.accounts.list, (old) => [...(old ?? []), fresh]);
        return fresh;
      }
      return postJson<AccountRow>("/api/accounts", { accountType: type, nickname: name });
    },
    onMutate: () => setError(null),
    onSuccess: (acct) => {
      setOpen(false);
      setNickname("");
      toast.success(`${accountName(acct)} is open`);
      if (acct?.id) router.push(`/app/accounts/${encodeURIComponent(acct.id)}`);
    },
    onError: (e) => setError(e instanceof Error ? e.message : "We couldn't open the account."),
    onSettled: () => !DEMO_MODE && qc.invalidateQueries({ queryKey: queryKeys.accounts.all }),
  });

  return (
    <>
      <Button variant="secondary" size="sm" className={className} onClick={() => setOpen(true)}>
        Open an account
      </Button>
      <AppSheet
        open={open}
        onOpenChange={setOpen}
        title="Open an account"
        description="Free to open, no minimum balance."
        busy={create.isPending}
        footer={
          <Button block loading={create.isPending} onClick={() => create.mutate()} arrow>
            Open account
          </Button>
        }
      >
        <div className="space-y-5">
          <Segmented<"checking" | "savings">
            label="Type"
            value={type}
            onChange={setType}
            options={[
              { value: "savings", label: "Savings" },
              { value: "checking", label: "Checking" },
            ]}
          />
          <TextField label="Name (optional)" placeholder={type === "savings" ? "e.g. Holiday fund" : "e.g. Bills"} maxLength={40} value={nickname} onChange={(e) => setNickname(e.target.value)} />
          {error && <Notice tone="error">{error}</Notice>}
        </div>
      </AppSheet>
    </>
  );
}

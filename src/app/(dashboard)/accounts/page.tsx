"use client";

// /accounts — list & manage the caller's accounts.
//
// Per-row actions: rename, set primary, view details (deep-links into
// dashboard scoped to that account), close (stub — server enforces
// zero-balance + no-cards rules; we surface them in the toast).

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Wallet,
  PiggyBank,
  Star,
  Plus,
  MoreHorizontal,
  Pencil,
  ArrowRight,
  X,
  Check,
  Loader2,
  Target,
} from "lucide-react";
import { fetchApi, queryKeys } from "@/lib/queries";
import {
  useSelectedAccount,
  useAccountBalances,
} from "@/components/account/use-accounts";
import { useNewAccountDialog } from "@/components/account/new-account-dialog-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AccountRow } from "@/components/account/use-accounts";

function fmtUsd(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function maskAccountNumber(n: string): string {
  return `••${n.slice(-4)}`;
}

export default function AccountsPage() {
  const { openAccounts, isLoading } = useSelectedAccount();
  const { open: openDialog } = useNewAccountDialog();
  const balancesQ = useAccountBalances();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Accounts
          </h1>
          <p className="text-muted-foreground">
            Organize your money. Open as many accounts as you need — they all
            share your underlying stablecoin wallet.
          </p>
        </div>
        <Button onClick={() => openDialog()} size="lg" className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Open new account
        </Button>
      </div>

      {/* Totals strip */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryStat
          label="Total balance"
          value={fmtUsd(balancesQ.data?.totalUsd)}
        />
        <SummaryStat
          label="Open accounts"
          value={openAccounts.length.toString()}
        />
        <SummaryStat
          label="Primary"
          value={
            openAccounts.find((a) => a.isPrimary)?.nickname ??
            openAccounts.find((a) => a.isPrimary)?.accountType ??
            "—"
          }
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading && openAccounts.length === 0 && (
          <div className="rounded-card border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading accounts…
          </div>
        )}
        {!isLoading && openAccounts.length === 0 && (
          <div className="rounded-card border border-dashed border-border bg-muted/30 p-10 text-center">
            <p className="text-sm font-medium">No accounts yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Open your first account to start organizing your money.
            </p>
            <Button onClick={() => openDialog()} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Open new account
            </Button>
          </div>
        )}
        {openAccounts.map((acc) => (
          <AccountRowCard key={acc.id} account={acc} />
        ))}
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-border bg-card p-4">
      <div className="eyebrow text-foreground/50">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function AccountRowCard({ account }: { account: AccountRow }) {
  const queryClient = useQueryClient();
  const [renaming, setRenaming] = useState(false);
  const [settingGoal, setSettingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState("");
  const [nicknameDraft, setNicknameDraft] = useState(account.nickname ?? "");

  const TypeIcon = account.accountType === "savings" ? PiggyBank : Wallet;

  const patch = useMutation({
    mutationFn: async (body: {
      nickname?: string;
      goalAmount?: string | null;
      setPrimary?: true;
    }) => {
      const res = await fetchApi<{ success: true; data: AccountRow }>(
        `/api/accounts/${account.id}`,
        { method: "PATCH", body: JSON.stringify(body) }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Could not update account");
    },
  });

  const close = useMutation({
    mutationFn: async () => {
      const res = await fetchApi<{ success: true; data: AccountRow }>(
        `/api/accounts/${account.id}`,
        { method: "DELETE" }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success("Account closed");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Could not close account");
    },
  });

  function commitGoal() {
    const value = goalDraft.trim();
    setSettingGoal(false);
    if (!value) return;
    if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
      toast.error("Enter a positive goal amount");
      return;
    }
    patch.mutate({ goalAmount: value });
  }

  function commitRename() {
    const value = nicknameDraft.trim();
    if (!value || value === account.nickname) {
      setRenaming(false);
      setNicknameDraft(account.nickname ?? "");
      return;
    }
    patch.mutate({ nickname: value });
    setRenaming(false);
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-card border border-border bg-card px-4 py-4",
        account.isPrimary && "ring-1 ring-primary/30"
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <TypeIcon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {renaming ? (
            <Input
              autoFocus
              value={nicknameDraft}
              onChange={(e) => setNicknameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") {
                  setRenaming(false);
                  setNicknameDraft(account.nickname ?? "");
                }
              }}
              maxLength={40}
              className="h-7 max-w-[16rem] text-sm"
            />
          ) : (
            <p className="truncate text-sm font-semibold">
              {account.nickname || account.accountType}
            </p>
          )}
          {account.isPrimary && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
              <Star className="h-3 w-3" />
              Primary
            </span>
          )}
        </div>
        <p className="text-[12px] text-muted-foreground capitalize">
          {account.accountType} · {maskAccountNumber(account.accountNumber)}
        </p>
        {settingGoal ? (
          <div className="mt-2 flex items-center gap-2">
            <Input
              autoFocus
              inputMode="decimal"
              placeholder="Goal amount, e.g. 5000"
              value={goalDraft}
              onChange={(e) => setGoalDraft(e.target.value.replace(/[^0-9.]/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitGoal();
                if (e.key === "Escape") setSettingGoal(false);
              }}
              className="h-7 max-w-[10rem] text-sm tabular-nums"
            />
            <Button size="icon-sm" variant="ghost" onClick={commitGoal} aria-label="Save goal">
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => setSettingGoal(false)} aria-label="Cancel goal">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          account.goalAmount &&
          Number(account.goalAmount) > 0 && (
            <div className="mt-2 max-w-[240px]">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Goal {fmtUsd(account.goalAmount)}</span>
                <span className="tabular-nums">
                  {Math.min(
                    100,
                    Math.round((Number(account.balance) / Number(account.goalAmount)) * 100)
                  )}
                  %
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{
                    width: `${Math.min(100, (Number(account.balance) / Number(account.goalAmount)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )
        )}
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums">
          {fmtUsd(account.balance)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {account.currency}
        </p>
      </div>

      {renaming ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={commitRename}
            disabled={patch.isPending}
            aria-label="Save nickname"
          >
            {patch.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => {
              setRenaming(false);
              setNicknameDraft(account.nickname ?? "");
            }}
            aria-label="Cancel rename"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="shrink-0 rounded-full p-1.5 text-foreground/50 hover:bg-muted hover:text-foreground"
            aria-label="Account actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem
              onClick={() => {
                setRenaming(true);
                setNicknameDraft(account.nickname ?? "");
              }}
            >
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Rename
            </DropdownMenuItem>
            {!account.isPrimary && (
              <DropdownMenuItem
                onClick={() => patch.mutate({ setPrimary: true })}
                disabled={patch.isPending}
              >
                <Star className="mr-2 h-3.5 w-3.5" />
                Set as primary
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                setGoalDraft(account.goalAmount ?? "");
                setSettingGoal(true);
              }}
            >
              <Target className="mr-2 h-3.5 w-3.5" />
              {account.goalAmount ? "Edit savings goal" : "Set savings goal"}
            </DropdownMenuItem>
            {account.goalAmount && (
              <DropdownMenuItem onClick={() => patch.mutate({ goalAmount: null })}>
                <X className="mr-2 h-3.5 w-3.5" />
                Clear goal
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              render={
                <Link
                  href={`/transactions?account=${account.id}`}
                />
              }
            >
              <ArrowRight className="mr-2 h-3.5 w-3.5" />
              View transactions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                if (Number(account.balance) > 0) {
                  toast.error(
                    "Move funds out before closing — this account isn't empty"
                  );
                  return;
                }
                close.mutate();
              }}
              disabled={close.isPending}
            >
              <X className="mr-2 h-3.5 w-3.5" />
              Close account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

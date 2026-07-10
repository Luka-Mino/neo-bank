"use client";

// AccountSwitcher — sidebar trigger that shows the currently-scoped account
// (or "All accounts") with its balance, and a dropdown to switch.
//
// Sits at the top of the sidebar above the OVERVIEW group. Clicking an item
// updates ?account=<id> via the URL hook (router.replace, so history isn't
// polluted). "+ Open new account" defers to the NewAccountDialog provider.

import { Check, ChevronsUpDown, Plus, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSelectedAccount, type AccountRow } from "./use-accounts";
import { useNewAccountDialog } from "./new-account-dialog-provider";

function fmtUsd(amount: string | number | null | undefined): string {
  const n = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function aggregate(accounts: AccountRow[]): number {
  return accounts.reduce((s, a) => s + Number(a.balance ?? 0), 0);
}

export function AccountSwitcher() {
  const { account, mode, openAccounts, isLoading, select } =
    useSelectedAccount();
  const { open: openNewAccountDialog } = useNewAccountDialog();

  const isAll = mode === "all";
  const triggerLabel = isAll
    ? "All accounts"
    : account
      ? account.nickname || account.accountType
      : "Select account";
  const triggerSub = isAll
    ? fmtUsd(aggregate(openAccounts))
    : account
      ? fmtUsd(account.balance)
      : isLoading
        ? "Loading…"
        : "—";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group/switcher mx-3 flex items-center gap-3 rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left",
          "transition hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise/40"
        )}
      >
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
            isAll
              ? "bg-white/10 text-white/85"
              : "bg-turquoise text-forest-900"
          )}
        >
          {isAll ? <Layers className="h-4 w-4" /> : initialOf(triggerLabel)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-medium text-white">
            {triggerLabel}
          </span>
          <span className="block truncate text-[11px] text-white/55 tabular-nums">
            {triggerSub}
          </span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-white/45 transition group-hover/switcher:text-white/70" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="min-w-[14rem]"
        sideOffset={6}
      >
        <div className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
          Switch account
        </div>

        <DropdownMenuItem
          onClick={() => select(null)}
          className="flex items-center gap-3"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground/70">
            <Layers className="h-3.5 w-3.5" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-medium">All accounts</span>
            <span className="block text-[11px] text-foreground/55 tabular-nums">
              {fmtUsd(aggregate(openAccounts))}
            </span>
          </span>
          {isAll && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {openAccounts.map((a) => {
          const active = !isAll && account?.id === a.id;
          const label = a.nickname || a.accountType;
          return (
            <DropdownMenuItem
              key={a.id}
              onClick={() => select(a.id)}
              className="flex items-center gap-3"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary text-[11px] font-semibold">
                {initialOf(label)}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium">
                  {label}
                  {a.isPrimary && (
                    <span className="ml-1.5 rounded bg-muted px-1 py-px text-[9px] font-medium uppercase tracking-wide text-foreground/55">
                      Primary
                    </span>
                  )}
                </span>
                <span className="block text-[11px] text-foreground/55 tabular-nums">
                  {fmtUsd(a.balance)}
                </span>
              </span>
              {active && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}

        {openAccounts.length > 0 && <DropdownMenuSeparator />}

        <DropdownMenuItem
          onClick={() => openNewAccountDialog()}
          className="flex items-center gap-3"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground/65">
            <Plus className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-medium">Open new account</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function initialOf(label: string): string {
  return label.charAt(0).toUpperCase();
}

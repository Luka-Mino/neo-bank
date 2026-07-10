"use client";

// SourceAccountPicker — reusable picker for "from which account?" on Send,
// Deposit, Withdraw, and Transfer-internal forms.
//
// Caller controls value through `value` + `onChange`. The picker doesn't
// auto-initialize because two pickers on the same page (transfer-internal)
// would both default to the same scoped account and collide. Use
// `useDefaultSourceAccount` for single-picker pages that want the
// URL-scoped (or primary) account as the initial value.

import { useEffect } from "react";
import { Wallet, PiggyBank, Check } from "lucide-react";
import { useSelectedAccount } from "./use-accounts";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AccountRow } from "./use-accounts";

function fmtUsd(n: string | number): string {
  const v = typeof n === "string" ? Number(n) : n;
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export type SourceAccountPickerProps = {
  /** The account id currently chosen in this form. */
  value: string | undefined;
  onChange: (id: string) => void;
  /**
   * If true, show as inline read-only chip (used on confirm steps). Caller
   * stays responsible for rendering the actual selected row state.
   */
  disabled?: boolean;
  /** Filter the list (e.g. exclude an already-selected source on a transfer). */
  filter?: (a: AccountRow) => boolean;
  /** Optional label override. */
  label?: string;
};

export function SourceAccountPicker({
  value,
  onChange,
  disabled,
  filter,
  label = "From account",
}: SourceAccountPickerProps) {
  const { openAccounts, isLoading } = useSelectedAccount();

  const items = filter ? openAccounts.filter(filter) : openAccounts;
  const current = items.find((a) => a.id === value);
  // Caller is responsible for initializing `value` — see useDefaultSourceAccount.

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled || items.length <= 1}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl bg-card px-3 py-2.5 text-left ring-1 ring-border transition",
            "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            (disabled || items.length <= 1) && "cursor-default hover:bg-card"
          )}
        >
          <AccountAvatar account={current} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {current
                ? current.nickname || current.accountType
                : isLoading
                  ? "Loading…"
                  : "Select an account"}
            </p>
            {current && (
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {fmtUsd(current.balance)} available
              </p>
            )}
          </div>
          {items.length > 1 && !disabled && (
            <span className="text-xs text-muted-foreground">Change</span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={4} className="min-w-[18rem]">
          {items.map((a) => {
            const active = a.id === value;
            return (
              <DropdownMenuItem
                key={a.id}
                onClick={() => onChange(a.id)}
                className="flex items-center gap-3"
              >
                <AccountAvatar account={a} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {a.nickname || a.accountType}
                    {a.isPrimary && (
                      <span className="ml-1.5 rounded bg-muted px-1 py-px text-[9px] font-medium uppercase tracking-wide text-foreground/55">
                        Primary
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    {fmtUsd(a.balance)}
                  </p>
                </div>
                {active && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Initialize a single source-account picker's value to the URL-scoped account
 * (or primary fallback). Use on Send/Deposit/Withdraw — pages with one picker.
 * On pages with two pickers (transfer-internal), manage init at the page level
 * to avoid collisions.
 */
export function useDefaultSourceAccount(
  value: string | undefined,
  setValue: (id: string) => void
) {
  const { account: selected, openAccounts, isLoading } = useSelectedAccount();
  useEffect(() => {
    if (value) return;
    if (isLoading) return;
    const fallback = selected ?? openAccounts[0];
    if (fallback) setValue(fallback.id);
  }, [value, isLoading, selected, openAccounts, setValue]);
}

function AccountAvatar({
  account,
  size = "md",
}: {
  account: AccountRow | undefined;
  size?: "sm" | "md";
}) {
  const Icon = account?.accountType === "savings" ? PiggyBank : Wallet;
  const px = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        px,
        "bg-primary/15 text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

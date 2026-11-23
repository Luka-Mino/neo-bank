"use client";

// "From / To account" picker for /app money screens. Only ACTIVE accounts
// can move money (frozen and closed are left out); the server re-checks.

import { useEffect, useMemo } from "react";
import { Picker } from "@/components/app/picker";
import { GlyphBadge } from "@/components/app/states";
import { useAccountsQuery, type AccountRow } from "@/components/account/use-accounts";
import { accountTypeLabel, maskNumber } from "@/components/app/data";
import { formatUsd } from "@/lib/money-input";

export function accountName(a: Pick<AccountRow, "nickname" | "accountType">): string {
  return a.nickname || accountTypeLabel(a.accountType);
}

export function useActiveAccounts() {
  const q = useAccountsQuery();
  const accounts = useMemo(() => (q.data ?? []).filter((a) => a.status === "active"), [q.data]);
  return { accounts, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
}

/** Pick a sensible default once accounts load: `preferId` (e.g. ?from=), else primary, else first. */
export function useDefaultAccount(
  value: string,
  setValue: (id: string) => void,
  { preferId, exclude }: { preferId?: string | null; exclude?: string } = {}
) {
  const { accounts, isLoading } = useActiveAccounts();
  useEffect(() => {
    if (value || isLoading) return;
    const pool = accounts.filter((a) => a.id !== exclude);
    const pick = pool.find((a) => a.id === preferId) ?? pool.find((a) => a.isPrimary) ?? pool[0];
    if (pick) setValue(pick.id);
  }, [value, isLoading, accounts, preferId, exclude, setValue]);
}

export function AccountPicker({
  label,
  value,
  onChange,
  exclude,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  /** Hide one account (the other side of a transfer). */
  exclude?: string;
  disabled?: boolean;
  error?: string;
}) {
  const { accounts, isLoading } = useActiveAccounts();
  const options = accounts
    .filter((a) => a.id !== exclude)
    .map((a) => ({
      id: a.id,
      title: accountName(a),
      subtitle:
        accountName(a) === accountTypeLabel(a.accountType)
          ? maskNumber(a.accountNumber)
          : `${accountTypeLabel(a.accountType)} ${maskNumber(a.accountNumber)}`,
      trailing: formatUsd(Number(a.balance)),
      leading: <GlyphBadge name={a.accountType === "savings" ? "goals" : "accounts"} />,
    }));
  return (
    <Picker
      label={label}
      sheetTitle={`${label} account`}
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Choose an account"
      loading={isLoading}
      disabled={disabled}
      error={error}
      empty="You don't have another active account."
    />
  );
}

"use client";

// URL-param account selection.
//
// Reads `?account=<id>` from the current URL and writes back via router.replace
// (no history pollution). `?account=all` is the explicit aggregate sentinel;
// missing param resolves to the user's primary account.
//
// Self-correcting: if `?account=` is set to an id the user no longer has
// (closed/missing/foreign), we replace the URL with the primary account's id
// so the bad param doesn't stick in the address bar (shareable links).

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAccountsQuery, type AccountRow } from "./use-accounts";

const PARAM = "account";
const ALL = "all";

export type SelectionMode = "one" | "all";

export type SelectedAccount = {
  /** The resolved account row when mode === "one"; null when mode === "all". */
  account: AccountRow | null;
  /** "one" → specific account selected; "all" → aggregate view. */
  mode: SelectionMode;
  /** All open accounts (status !== "closed"). Stable for switcher / pickers. */
  openAccounts: AccountRow[];
  /** Loading the underlying account list. */
  isLoading: boolean;
  /** Switch the URL param. Pass null for the aggregate view. */
  select: (id: string | null) => void;
};

export function useSelectedAccountUrl(): SelectedAccount {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const accountsQ = useAccountsQuery();
  const accounts = accountsQ.data ?? [];
  const openAccounts = useMemo(
    () => accounts.filter((a) => a.status !== "closed"),
    [accounts]
  );
  const primary = useMemo(
    () => openAccounts.find((a) => a.isPrimary) ?? openAccounts[0] ?? null,
    [openAccounts]
  );

  const raw = searchParams?.get(PARAM) ?? null;

  // Resolve the raw param into account/mode. Self-correct bad ids via effect.
  const { account, mode, status } = useMemo<{
    account: AccountRow | null;
    mode: SelectionMode;
    status: "ok" | "default" | "invalid";
  }>(() => {
    if (raw === ALL) return { account: null, mode: "all", status: "ok" };
    if (raw && raw.length > 0) {
      const found = openAccounts.find((a) => a.id === raw);
      if (found) return { account: found, mode: "one", status: "ok" };
      // Param present but doesn't match — fall back AND clean URL.
      return { account: primary, mode: "one", status: "invalid" };
    }
    // No param: default to primary, mode "one".
    return { account: primary, mode: "one", status: "default" };
  }, [raw, openAccounts, primary]);

  // Clean the URL when the persisted id doesn't resolve. router.replace so
  // history isn't polluted; only fires once accounts have loaded so we don't
  // strip a valid id mid-fetch.
  useEffect(() => {
    if (status !== "invalid") return;
    if (accountsQ.isLoading) return;
    if (openAccounts.length === 0) return;
    if (!primary) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set(PARAM, primary.id);
    router.replace(`${pathname}?${params.toString()}`);
  }, [
    status,
    accountsQ.isLoading,
    openAccounts.length,
    primary,
    pathname,
    router,
    searchParams,
  ]);

  const select = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (id === null) params.set(PARAM, ALL);
      else params.set(PARAM, id);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return {
    account,
    mode,
    openAccounts,
    isLoading: accountsQ.isLoading,
    select,
  };
}

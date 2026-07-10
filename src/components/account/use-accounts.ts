"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi, queryKeys } from "@/lib/queries";
import { DEMO_MODE, DEMO_ACCOUNTS, DEMO_CARDS } from "@/lib/demo-data";

export type AccountRow = {
  id: string;
  userId?: string;
  accountType: string;
  nickname: string | null;
  accountNumber: string;
  currency: string;
  balance: string;
  status: "active" | "frozen" | "closed";
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AccountBalanceRow = Pick<
  AccountRow,
  | "id"
  | "accountType"
  | "nickname"
  | "currency"
  | "balance"
  | "status"
  | "isPrimary"
>;

type ListResp = { success: true; data: { data: AccountRow[] } };
type BalancesResp = {
  success: true;
  data: { data: { totalUsd: string; accounts: AccountBalanceRow[] } };
};

export function useAccountsQuery() {
  return useQuery<AccountRow[]>({
    queryKey: queryKeys.accounts.list,
    queryFn: async () => {
      if (DEMO_MODE) return DEMO_ACCOUNTS as unknown as AccountRow[];
      const res = await fetchApi<ListResp>("/api/accounts");
      return res.data.data;
    },
  });
}

export function useAccountBalances() {
  return useQuery({
    queryKey: queryKeys.accounts.balances,
    queryFn: async () => {
      if (DEMO_MODE) {
        const accts = DEMO_ACCOUNTS as unknown as AccountBalanceRow[];
        const totalUsd = accts
          .reduce((s, a) => s + Number(a.balance), 0)
          .toFixed(2);
        return { totalUsd, accounts: accts };
      }
      const res = await fetchApi<BalancesResp>("/api/accounts/balances");
      return res.data.data;
    },
  });
}

// useSelectedAccount lives in ./use-selected-account-url. Re-export for
// back-compat with existing callers that still import from here.
export { useSelectedAccountUrl as useSelectedAccount } from "./use-selected-account-url";

// ─── Cards ──────────────────────────────────────────────────────────────────

export type CardRow = {
  id: string;
  userId?: string;
  accountId: string;
  cardType: "debit" | "credit" | "virtual" | "physical";
  last4: string;
  status: "active" | "frozen" | "replaced" | "canceled";
  nickname: string | null;
  expMonth: number;
  expYear: number;
  network: "visa" | "mastercard";
  createdAt?: string;
  updatedAt?: string;
};

type CardsListResp = { success: true; data: { data: CardRow[] } };

export function useCardsQuery() {
  return useQuery<CardRow[]>({
    queryKey: queryKeys.cards.list,
    queryFn: async () => {
      if (DEMO_MODE) return DEMO_CARDS as unknown as CardRow[];
      const res = await fetchApi<CardsListResp>("/api/cards");
      return res.data.data;
    },
  });
}

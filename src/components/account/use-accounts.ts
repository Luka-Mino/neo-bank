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
  status: "opening" | "active" | "frozen" | "closed"; // "opening": a side account whose wallet is being created
  isPrimary: boolean;
  goalAmount?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ListResp = { success: true; data: { data: AccountRow[] } };

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

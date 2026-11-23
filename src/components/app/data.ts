"use client";

// Data + formatting helpers for the mobile-first /app preview.
//
// Reads the same sources as the desktop dashboard (accounts, cards,
// transactions — demo or real) so the two can be compared side by side with
// identical numbers. The transactions query deliberately shares the
// dashboard's ["transactions"] cache key.

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Repeat,
  Send,
  type LucideIcon,
} from "lucide-react";
import { DEMO_MODE, DEMO_SESSION, DEMO_TRANSACTIONS } from "@/lib/demo-data";

export function useDisplayName(): { firstName: string; initials: string } {
  const { data: realSession } = useSession();
  const session = DEMO_MODE ? DEMO_SESSION : realSession;
  const name = session?.user?.name ?? "";
  return {
    firstName: name.split(" ")[0] || "there",
    initials:
      name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase() || "M",
  };
}

export type AppTx = {
  id: string;
  accountId?: string;
  txType?: string;
  status?: string;
  sourceAmount?: string;
  sourceAsset?: string;
  destinationAsset?: string;
  createdAt?: string;
};

export function useTransactions() {
  const q = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetch("/api/transactions").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });
  const raw: AppTx[] = DEMO_MODE
    ? (DEMO_TRANSACTIONS as AppTx[])
    : q.data?.data?.data || q.data?.data || [];
  const sorted = [...raw].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
  );
  return { txs: sorted, isLoading: !DEMO_MODE && q.isLoading };
}

// Same type → label/direction mapping as txMeta in dashboard/page.tsx and
// transactions/page.tsx, so a given type reads the same everywhere.
export function txMeta(t: string | undefined): {
  label: string;
  direction: "in" | "out";
  icon: LucideIcon;
} {
  switch (t) {
    case "onramp":
      return { label: "Deposit", direction: "in", icon: ArrowDownToLine };
    case "offramp":
      return { label: "Withdrawal to bank", direction: "out", icon: ArrowUpFromLine };
    case "send":
      return { label: "Money sent", direction: "out", icon: Send };
    case "internal_in":
      return { label: "Transfer in", direction: "in", icon: Repeat };
    case "internal_out":
      return { label: "Transfer out", direction: "out", icon: Repeat };
    default:
      return { label: "Transaction", direction: "out", icon: ArrowUpFromLine };
  }
}

export function money(n: number): string {
  return Math.abs(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function signedMoney(n: number, direction: "in" | "out"): string {
  return `${direction === "in" ? "+" : "−"}${money(n)}`;
}

export function maskNumber(acct: string | undefined): string {
  if (!acct) return "••••";
  return `•••• ${acct.slice(-4)}`;
}

export function accountTypeLabel(t: string | undefined): string {
  if (!t) return "Account";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function dayLabel(iso: string | undefined): string {
  if (!iso) return "Earlier";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function shortDate(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

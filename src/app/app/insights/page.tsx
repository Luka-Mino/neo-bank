import type { Metadata } from "next";
import { InsightsView } from "./insights-view";

export const metadata: Metadata = { title: "Insights · Moneta" };

// ?account=<id> scopes insights to one account (same convention as Activity).
export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const account = Array.isArray(sp.account) ? sp.account[0] : sp.account;
  return <InsightsView accountId={account ?? null} />;
}

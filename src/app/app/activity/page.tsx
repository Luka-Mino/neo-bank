import type { Metadata } from "next";
import { ActivityList } from "./activity-list";

export const metadata: Metadata = { title: "Activity · Moneta" };

// ?account=<id> scopes the list to one account (linked from account pages).
export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const account = Array.isArray(sp.account) ? sp.account[0] : sp.account;
  return <ActivityList accountId={account ?? null} />;
}

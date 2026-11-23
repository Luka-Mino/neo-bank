import type { Metadata } from "next";
import { SendFlow } from "./send-flow";

export const metadata: Metadata = { title: "Send money · Moneta" };

// ?from=<accountId> preselects the source (e.g. from an account's page);
// ?to=<recipientId> preselects who to pay (e.g. from Recipients).
export default async function SendPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
  return <SendFlow fromId={one(sp.from)} toId={one(sp.to)} />;
}

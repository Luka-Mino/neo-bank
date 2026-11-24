import type { Metadata } from "next";
import { SupportFlow } from "./support-flow";

export const metadata: Metadata = { title: "Help & support · Moneta" };

// ?tx=<transactionId> links the request to a payment (e.g. "Report a problem"
// on a transaction's page). The server checks it belongs to the caller's org.
export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
  const tx = one(sp.tx);
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return <SupportFlow transactionId={tx && uuid.test(tx) ? tx : null} />;
}

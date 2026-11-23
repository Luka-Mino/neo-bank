import type { Metadata } from "next";
import { NewRecipient } from "./new-recipient";

export const metadata: Metadata = { title: "Add someone · Moneta" };

// ?recipient=<id>&name=<name> attaches a wallet to someone already saved.
export default async function NewRecipientPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
  return <NewRecipient existingId={one(sp.recipient)} existingName={one(sp.name)} />;
}

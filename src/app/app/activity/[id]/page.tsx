import type { Metadata } from "next";
import { TransactionDetail } from "./transaction-detail";

export const metadata: Metadata = { title: "Transaction · Moneta" };

export default async function TransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TransactionDetail id={id} />;
}

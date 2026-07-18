import type { Metadata } from "next";
import { auth } from "@/lib/auth/config";
import { PricingPage } from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing — Moneta",
  description:
    "Honest pricing with every fee on the receipt. Start free; upgrade only for higher limits and perks.",
};

export default async function Pricing() {
  const session = await auth();
  return <PricingPage isAuthenticated={!!session} />;
}

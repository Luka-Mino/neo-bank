"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Plan ladder — mirrors the neobank standard (free core → paid tiers that raise
// limits and add perks). Features listed are grounded in what our rails deliver
// (accounts, cards, ACH/wire, cashback fundable by interchange) — no yield or
// investing claims until confirmed. See GROWTH-PLAN.md.

interface Tier {
  name: string;
  price: string;
  cadence?: string;
  tagline: string;
  features: string[];
  cta: string;
  featured?: boolean;
  soon?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "/month",
    tagline: "Everything you need to hold, send, and spend.",
    features: [
      "US account & routing numbers",
      "Free ACH deposits & withdrawals",
      "Virtual + physical card",
      "Instant transfers to anyone on Moneta",
      "Every fee shown on the receipt",
    ],
    cta: "Open an account",
  },
  {
    name: "Plus",
    price: "$3.99",
    cadence: "/month",
    tagline: "Higher limits and more control.",
    features: [
      "Everything in Free",
      "Higher transfer & spending limits",
      "Multiple virtual cards",
      "Priority support",
    ],
    cta: "Choose Plus",
    soon: true,
  },
  {
    name: "Premium",
    price: "$9.99",
    cadence: "/month",
    tagline: "For people who move money often.",
    features: [
      "Everything in Plus",
      "Same-day wire withdrawals included",
      "Cashback on card spending",
      "Higher ATM limits",
    ],
    cta: "Choose Premium",
    featured: true,
    soon: true,
  },
  {
    name: "Metal",
    price: "$16.99",
    cadence: "/month",
    tagline: "The top of the line.",
    features: [
      "Everything in Premium",
      "Metal card",
      "Best cashback rate",
      "Concierge support",
    ],
    cta: "Choose Metal",
    soon: true,
  },
];

export function PricingTiers() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {TIERS.map((tier) => (
        <div
          key={tier.name}
          className={cn(
            "relative flex flex-col rounded-2xl p-6 ring-1 transition",
            tier.featured
              ? "bg-white/[0.07] ring-[#4ac280]/50"
              : "bg-white/[0.03] ring-white/10"
          )}
        >
          {tier.featured && (
            <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-b from-[#59cf8e] to-[#3fb073] px-3 py-1 text-[11px] font-semibold text-[#08221c]">
              Most popular
            </span>
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-white">{tier.name}</h3>
            {tier.soon && (
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50 ring-1 ring-white/10">
                Coming soon
              </span>
            )}
          </div>

          <div className="mt-4 flex items-baseline gap-1">
            <span className="font-display text-3xl font-semibold text-white">{tier.price}</span>
            {tier.cadence && <span className="text-sm text-white/50">{tier.cadence}</span>}
          </div>
          <p className="mt-2 text-sm text-white/60">{tier.tagline}</p>

          <ul className="mt-6 flex-1 space-y-3">
            {tier.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-white/75">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#4ac280]" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/register"
            className={cn(
              "mt-8 inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold transition",
              tier.featured
                ? "bg-gradient-to-b from-[#59cf8e] to-[#3fb073] text-[#08221c] shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_8px_20px_-10px_rgba(74,194,128,0.6)] hover:brightness-105"
                : "bg-white/[0.06] text-white ring-1 ring-white/15 hover:bg-white/[0.1]"
            )}
          >
            {tier.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}

import {
  ArrowDownToLine,
  Globe,
  BadgeDollarSign,
  Coins,
  Sparkles,
  CreditCard,
} from "lucide-react";

const features = [
  {
    icon: ArrowDownToLine,
    title: "Instant deposits",
    description:
      "ACH and wire deposits that hit your account the same day, auto-converted to USDC.",
    accent: "#4ac280",
  },
  {
    icon: Globe,
    title: "Global transfers",
    description:
      "Send to anyone, anywhere — dollars that settle on-chain in seconds, not days.",
    accent: "#22d3ee",
  },
  {
    icon: BadgeDollarSign,
    title: "Zero hidden fees",
    description: "No monthly fees. No minimums. No fine print.",
    accent: "#ff9500",
  },
  {
    icon: Coins,
    title: "Dollar-backed digital",
    description:
      "Every dollar is backed 1:1 by regulated, audited stablecoins — held at FDIC partner banks.",
    accent: "#8b5cf6",
  },
  {
    icon: CreditCard,
    title: "Real-time card controls",
    description:
      "Freeze, set limits, toggle channels — all instantly from the Moneta app.",
    accent: "#2f80ed",
  },
  {
    icon: Sparkles,
    title: "AI spending insights",
    description:
      "Smart budgets, category breakdowns, and proactive nudges so your money compounds.",
    accent: "#ff3b30",
  },
] as const;

export function FeaturesGrid() {
  return (
    <section id="features" className="bg-[#0a1c1c] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#4ac280]">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Built for how money actually works
          </h2>
          <p className="mt-4 text-white/60">
            No legacy banking baggage. Just the tools you need to move, save,
            and grow your money.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10 transition hover:bg-white/[0.06]"
            >
              <div
                className="absolute inset-x-0 top-0 h-px"
                style={{ backgroundColor: feature.accent, opacity: 0.6 }}
              />
              <div
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${feature.accent}1f`,
                  color: feature.accent,
                }}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm text-white/55">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { Wifi, SlidersHorizontal, Snowflake } from "lucide-react";
import { MonetaCard } from "@/components/account/moneta-card";

const cardFeatures = [
  {
    icon: Snowflake,
    title: "Instant freeze",
    description: "Lock and unlock the card from the app — no hold music.",
  },
  {
    icon: SlidersHorizontal,
    title: "Smart limits",
    description: "Daily and monthly caps, by channel and by merchant.",
  },
  {
    icon: Wifi,
    title: "Contactless",
    description: "Tap to pay anywhere Visa is accepted, worldwide.",
  },
];

export function CardShowcase() {
  return (
    <section
      id="card"
      className="relative overflow-hidden bg-[#0a1c1c] py-16 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#4ac280]/15 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#4ac280]">
              Moneta card
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              The only card you&apos;ll need
            </h2>
            <p className="mt-3 max-w-md text-lg text-white/60">
              Forest-green, contactless, accepted everywhere. No annual fee,
              full app control.
            </p>

            <div className="mt-8 flex flex-col gap-5">
              {cardFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#4ac280] ring-1 ring-white/10">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/50">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-0 -z-10 translate-y-6 scale-95 rounded-3xl bg-[#4ac280]/15 blur-2xl" />
              <MonetaCard
                size="lg"
                variant="forest"
                holder="Alex Morgan"
                card={{
                  last4: "7891",
                  cardType: "virtual",
                  status: "active",
                  expMonth: 12,
                  expYear: 2028,
                  network: "visa",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

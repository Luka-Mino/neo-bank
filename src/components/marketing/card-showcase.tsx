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
    <section id="card" className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f8f5c]">
              Moneta card
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[#122e2e] md:text-4xl">
              Spend the balance directly
            </h2>
            <p className="mt-3 max-w-md text-lg text-[#5b6b6b]">
              Contactless, accepted everywhere Visa is. No annual fee, full
              control from the app.
            </p>

            <div className="mt-8 flex flex-col gap-5">
              {cardFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4ac280]/10 text-[#2f8f5c] ring-1 ring-[#4ac280]/20">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#122e2e]">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#5b6b6b]">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* soft brand glow grounds the card on the light field */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 mx-auto h-[70%] w-[80%] translate-y-6 rounded-full bg-[#4ac280]/[0.10] blur-[80px]"
              />
              <div className="drop-shadow-[0_30px_50px_rgba(18,46,46,0.22)]">
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
      </div>
    </section>
  );
}

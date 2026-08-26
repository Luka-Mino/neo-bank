"use client";

import Image from "next/image";
import { Wifi, SlidersHorizontal, Snowflake } from "lucide-react";
import { MonetaCard } from "@/components/account/moneta-card";
import { TiltCard } from "./tilt-card";

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
    <section id="card" className="relative overflow-hidden scroll-mt-24 bg-[#0a1c1c] py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4ac280]">
              Moneta card
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[#f6f6f6] md:text-4xl">
              Spend the balance directly
            </h2>
            <p className="mt-3 max-w-md text-lg text-white/65">
              Contactless, accepted everywhere Visa is. No annual fee, full
              control from the app.
            </p>

            <div className="mt-8 flex flex-col gap-5">
              {cardFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4ac280]/10 text-[#4ac280] ring-1 ring-[#4ac280]/20">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#f6f6f6]">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/55">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-full max-w-md pb-14">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 mx-auto h-[70%] w-[80%] translate-y-6 rounded-full bg-[#4ac280]/[0.16] blur-[90px]"
              />
              <div className="relative overflow-hidden rounded-[26px] shadow-[0_40px_70px_-32px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.08]">
                <Image
                  src="/images/photos/card-tap.jpg"
                  alt="Paying by tapping a card at a café counter"
                  width={1600}
                  height={2000}
                  className="h-[440px] w-full object-cover object-center"
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0a1c1c]/70 to-transparent"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 w-[80%] max-w-[330px] -translate-x-1/2 drop-shadow-[0_28px_50px_rgba(0,0,0,0.6)]">
                <TiltCard hint={false}>
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
                </TiltCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

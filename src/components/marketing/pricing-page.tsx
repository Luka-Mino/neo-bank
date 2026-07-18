"use client";

import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { CtaSection } from "./cta-section";
import { PricingTiers } from "./pricing-tiers";
import { FeeTransparency } from "./fee-transparency";

interface PricingPageProps {
  isAuthenticated: boolean;
}

export function PricingPage({ isAuthenticated }: PricingPageProps) {
  return (
    <div className="min-h-screen bg-deep-forest text-[#f6f6f6]">
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="h-16" aria-hidden />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 -z-10 h-[380px] w-[480px] rounded-full bg-[#4ac280]/[0.06] blur-[120px]"
          />
          <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4ac280]">
              Pricing
            </p>
            <h1 className="font-display mx-auto mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Honest pricing. No surprises.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65">
              Start free and stay free for everything most people need. Upgrade
              only if you want higher limits and perks — and see every fee before
              you ever confirm.
            </p>
          </div>
        </section>

        {/* Tiers */}
        <section className="pb-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <PricingTiers />
            <p className="mt-6 text-center text-xs text-white/40">
              The Free plan is available at launch. Paid plans roll out as we grow —
              prices shown are targets, kept deliberately in line with the market.
            </p>
          </div>
        </section>

        <FeeTransparency />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}

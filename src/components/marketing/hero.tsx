"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Zap } from "lucide-react";
import { MonetaCard } from "@/components/account/moneta-card";
import { TiltCard } from "@/components/marketing/tilt-card";

interface HeroProps {
  isAuthenticated?: boolean;
}

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Topographic contour texture — faint depth on the flat forest ground.
          Masked to fade toward the content so it never fights the type. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage: "url(/images/patterns/pattern-topographic.png)",
          backgroundSize: "440px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 70% 40%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 70% 40%, black 20%, transparent 75%)",
        }}
      />
      {/* Soft brand glow behind the card, low and wide — not a blob-halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 -z-10 h-[420px] w-[520px] rounded-full bg-[#4ac280]/[0.07] blur-[120px]"
      />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="hero-seq flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/70 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ac280]" />
              Stablecoin banking, regulated rails
            </span>

            <h1 className="font-display mt-5 text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-[3.6rem] lg:leading-[1.05]">
              Real dollars,{" "}
              <span className="text-[#4ac280]">moving in real time</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65 md:text-xl lg:mx-0">
              Hold, send, and spend dollar-backed digital cash that settles
              on-chain in seconds — with the protection of regulated banking
              partners.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href={isAuthenticated ? "/dashboard" : "/register"} className="cta-primary">
                {isAuthenticated ? "Open the app" : "Open an account"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="cta-secondary">
                See how it works
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              {[
                { icon: ShieldCheck, label: "FDIC pass-through to $250K" },
                { icon: Lock, label: "Bank-grade encryption" },
                { icon: Zap, label: "Settles in seconds" },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70 ring-1 ring-white/10"
                >
                  <chip.icon className="h-3.5 w-3.5 text-[#4ac280]" />
                  {chip.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: the card is the protagonist */}
          <div className="hero-card w-full flex-1">
            <div className="relative mx-auto w-full max-w-[420px]">
              <TiltCard>
                <MonetaCard
                  card={{
                    last4: "7891",
                    cardType: "physical",
                    status: "active",
                    expMonth: 8,
                    expYear: 29,
                    network: "visa",
                  }}
                  holder="ALEX RIVERA"
                  size="lg"
                />
              </TiltCard>
              <p className="mt-6 text-center text-xs text-white/40">
                Your dollars, on a card that settles in seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

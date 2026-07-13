"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { MonetaCard } from "@/components/account/moneta-card";
import { TiltCard } from "@/components/marketing/tilt-card";

interface HeroProps {
  isAuthenticated?: boolean;
}

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="hero-seq flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/70 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ac280]" />
              Stablecoin banking, regulated rails
            </span>

            <h1 className="font-display mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-[3.6rem] lg:leading-[1.05]">
              Money that moves at{" "}
              <span className="text-[#4ac280]">internet speed</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65 md:text-xl lg:mx-0">
              Hold, send, and spend dollar-backed digital cash that settles
              on-chain in seconds — with the protection of regulated banking
              partners.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 bg-[#4ac280] px-8 text-base text-[#0a1c1c] hover:bg-[#5ed092]"
                  )}
                >
                  Open the app
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 bg-[#4ac280] px-8 text-base text-[#0a1c1c] hover:bg-[#5ed092]"
                  )}
                >
                  Open an account
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              )}
              <a
                href="#features"
                className="h-12 inline-flex items-center justify-center rounded-md border border-white/15 bg-white/5 px-8 text-sm font-medium text-white transition hover:bg-white/10"
              >
                See features
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/50 lg:justify-start">
              <span>FDIC pass-through up to $250K</span>
              <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
              <span>SOC 2 Type II</span>
              <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
              <span>Settles on-chain in seconds</span>
            </div>
          </div>

          {/* Right: the card is the protagonist */}
          <div className="hero-card flex-1">
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Zap, ArrowUpRight, Check } from "lucide-react";

interface HeroProps {
  isAuthenticated?: boolean;
}

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#0a1c1c]">
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8%] top-[-10%] -z-0 h-[560px] w-[640px] rounded-full bg-[#4ac280]/[0.10] blur-[140px]"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center gap-14 lg:flex-row lg:gap-16">
          {/* Left: the thesis */}
          <div className="hero-seq flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#4ac280]/[0.12] px-3 py-1 text-xs font-medium text-[#4ac280] ring-1 ring-[#4ac280]/25">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ac280]" />
              Stablecoin banking · regulated rails
            </span>

            <h1 className="font-display mt-5 text-balance text-4xl font-semibold tracking-tight text-[#f6f6f6] md:text-5xl lg:text-[3.6rem] lg:leading-[1.04]">
              Real dollars,{" "}
              <span className="text-[#4ac280]">moving in real time</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg text-white/65 md:text-xl lg:mx-0">
              Hold, send, and settle dollar-backed digital cash on-chain in
              seconds — with the protection of regulated banking partners.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href={isAuthenticated ? "/dashboard" : "/register"} className="cta-primary">
                {isAuthenticated ? "Open the app" : "Open an account"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="cta-secondary">
                See how it works
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
              {[
                { icon: ShieldCheck, label: "FDIC pass-through to $250K" },
                { icon: Lock, label: "Bank-grade encryption" },
                { icon: Zap, label: "Settles in seconds" },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-2 text-sm font-medium text-white/70"
                >
                  <chip.icon className="h-4 w-4 text-[#4ac280]" />
                  {chip.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: a warm scene, with the product settling over it */}
          <div className="hero-card w-full flex-1">
            <div className="relative mx-auto w-full max-w-[520px] pb-16 pl-4 sm:pb-10 sm:pl-0">
              <div className="relative overflow-hidden rounded-[26px] shadow-[0_40px_80px_-32px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.08]">
                <Image
                  src="/images/photos/trust-friends.jpg"
                  alt="Two friends catching up over coffee, phone in hand"
                  width={1600}
                  height={1067}
                  priority
                  className="h-[380px] w-full object-cover object-center sm:h-[440px]"
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a1c1c]/50 to-transparent"
                />
              </div>

              <SettledCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SettledCard() {
  return (
    <div className="absolute bottom-0 left-0 w-[290px] rounded-2xl bg-[#12302e] p-5 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.10] sm:left-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4ac280]/15 text-[#4ac280] ring-1 ring-[#4ac280]/25">
            <ArrowUpRight className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-[#f6f6f6]">Payment settled</span>
        </div>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4ac280]/15 text-[#4ac280]">
          <Check className="h-3 w-3" />
        </span>
      </div>

      <p className="font-display mt-4 text-[26px] font-semibold leading-none tabular-nums text-[#f6f6f6]">
        $250,000<span className="text-white/35">.00</span>
      </p>

      <div className="mt-3 flex items-center justify-between text-[11px] font-medium">
        <span className="tabular-nums text-white/50">Sent 14:22:07</span>
        <span className="tabular-nums text-[#4ac280]">Settled 14:22:09</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="settle-bar h-full w-full rounded-full bg-gradient-to-r from-[#4ac280] to-[#2f8f5c]" />
      </div>

      <p className="mt-3 font-mono text-[11px] tabular-nums text-white/45">
        1.8s · $0.00 fee · regulated rails
      </p>
    </div>
  );
}

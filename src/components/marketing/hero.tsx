"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, Zap, ArrowUpRight, Check } from "lucide-react";

interface HeroProps {
  isAuthenticated?: boolean;
}

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* One faint brand wash, low and wide — never a blob-halo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8%] top-[-10%] -z-10 h-[520px] w-[620px] rounded-full bg-[#4ac280]/[0.06] blur-[130px]"
      />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="flex flex-col items-center gap-14 lg:flex-row lg:gap-16">
          {/* Left: the thesis */}
          <div className="hero-seq flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#4ac280]/[0.08] px-3 py-1 text-xs font-medium text-[#2f8f5c] ring-1 ring-[#4ac280]/20">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ac280]" />
              Stablecoin banking · regulated rails
            </span>

            <h1 className="font-display mt-5 text-balance text-4xl font-semibold tracking-tight text-[#122e2e] md:text-5xl lg:text-[3.6rem] lg:leading-[1.04]">
              Real dollars,{" "}
              <span className="text-[#2f8f5c]">moving in real time</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg text-[#5b6b6b] md:text-xl lg:mx-0">
              Hold, send, and settle dollar-backed digital cash on-chain in
              seconds — with the protection of regulated banking partners.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href={isAuthenticated ? "/dashboard" : "/register"} className="cta-primary">
                {isAuthenticated ? "Open the app" : "Open an account"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="cta-ghost">
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
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#122e2e]/70"
                >
                  <chip.icon className="h-4 w-4 text-[#2f8f5c]" />
                  {chip.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: a payment settling in real time — the product, not a metaphor */}
          <div className="hero-card w-full flex-1">
            <div className="relative mx-auto w-full max-w-[440px]">
              {/* faint stacked card behind, for depth */}
              <div
                aria-hidden
                className="absolute -right-3 -top-3 h-full w-full rounded-[22px] bg-[#122e2e]/[0.04] ring-1 ring-[#122e2e]/[0.05]"
              />
              <SettlementPanel />
              <p className="mt-5 text-center text-xs text-[#122e2e]/40">
                A payment settling on-chain, in real time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SettlementPanel() {
  return (
    <div className="relative rounded-[22px] bg-white p-6 shadow-[0_1px_2px_rgba(18,46,46,0.05),0_30px_60px_-30px_rgba(18,46,46,0.28)] ring-1 ring-[#122e2e]/[0.07]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#122e2e] text-[#4ac280]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-[#122e2e]">Outbound payment</span>
        </div>
        <span className="rounded-full bg-[#f6f6f6] px-2.5 py-1 text-[11px] font-semibold text-[#5b6b6b]">
          SEPA · EUR
        </span>
      </div>

      <p className="font-display mt-5 text-4xl font-semibold tabular-nums text-[#122e2e]">
        $250,000<span className="text-[#122e2e]/35">.00</span>
      </p>
      <p className="mt-1 text-sm text-[#5b6b6b]">
        To <span className="font-medium text-[#122e2e]">Acme GmbH</span> · verified beneficiary
      </p>

      {/* settlement rail — the one animated moment */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-medium text-[#5b6b6b]">
          <span className="tabular-nums">Sent 14:22:07</span>
          <span className="tabular-nums text-[#2f8f5c]">Settled 14:22:09</span>
        </div>
        <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-[#eef0ef]">
          <div className="settle-bar h-full w-full rounded-full bg-gradient-to-r from-[#4ac280] to-[#2f8f5c]" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#122e2e]/[0.08] pt-5">
        {[
          { k: "Settlement", v: "1.8s" },
          { k: "Network fee", v: "$0.00" },
          { k: "Rails", v: "Regulated" },
        ].map((s) => (
          <div key={s.k}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#122e2e]/40">
              {s.k}
            </p>
            <p className="mt-0.5 font-mono text-sm font-medium tabular-nums text-[#122e2e]">
              {s.v}
            </p>
          </div>
        ))}
      </div>

      {/* settled stamp */}
      <div className="settle-dot absolute -right-3 top-16 flex items-center gap-1.5 rounded-full bg-[#122e2e] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
        <Check className="h-3.5 w-3.5 text-[#4ac280]" />
        Settled
      </div>
    </div>
  );
}

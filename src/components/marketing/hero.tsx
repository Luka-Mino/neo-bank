"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Send,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Eye,
  PiggyBank,
  Coffee,
  ShoppingBag,
} from "lucide-react";

interface HeroProps {
  isAuthenticated?: boolean;
}

const previewActions = [
  { name: "Send", icon: Send },
  { name: "Deposit", icon: ArrowDownToLine },
  { name: "Withdraw", icon: ArrowUpFromLine },
  { name: "Exchange", icon: ArrowLeftRight },
];

const previewFeed = [
  {
    name: "Salary — Acme Co.",
    when: "Today",
    amount: "+$3,500.00",
    color: "text-[#9be3b8]",
    icon: PiggyBank,
    strip: "bg-[#4ac280]",
  },
  {
    name: "Blue Bottle Coffee",
    when: "Today",
    amount: "−$6.40",
    color: "text-white",
    icon: Coffee,
    strip: "bg-[#ff9500]",
  },
  {
    name: "Tesco Express",
    when: "Yesterday",
    amount: "−$34.50",
    color: "text-white",
    icon: ShoppingBag,
    strip: "bg-[#8b5cf6]",
  },
];

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#4ac280]/25 blur-[120px]" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-[#22d3ee]/15 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/70 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ac280]" />
              Stablecoin banking, regulated rails
            </span>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
              Money that moves at{" "}
              <span className="text-[#4ac280]">internet speed</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65 md:text-xl lg:mx-0">
              Hold, send, and spend dollar-backed digital cash across six
              networks — with the protection of regulated banking partners.
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
              <span>Six on-chain networks</span>
            </div>
          </div>

          {/* Right: stylized phone preview */}
          <div className="relative flex-1">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute inset-0 -z-10 translate-y-6 scale-95 rounded-[2.4rem] bg-[#4ac280]/15 blur-2xl" />
              <div className="rounded-[2rem] bg-gradient-to-br from-[#1f4040] to-[#0a1c1c] p-3 shadow-[0_30px_80px_-30px_rgba(74,194,128,0.45)] ring-1 ring-white/10">
                <div className="space-y-4 rounded-[1.5rem] bg-[#0a1c1c] p-5 ring-1 ring-white/5">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>Good morning, Alex</span>
                    <Eye className="h-3 w-3" />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Total balance
                    </p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
                      $12,458.32
                    </p>
                    <p className="text-xs text-[#9be3b8]">+$3,500 this month</p>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {previewActions.map((a) => (
                      <div
                        key={a.name}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4ac280] text-[#0a1c1c]">
                          <a.icon className="h-4 w-4" />
                        </span>
                        <span className="text-[10px] text-white/60">
                          {a.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    {previewFeed.map((row) => (
                      <div
                        key={row.name}
                        className="relative overflow-hidden rounded-lg bg-white/[0.04] py-2 pr-3 pl-3"
                      >
                        <span
                          className={cn("absolute inset-y-0 left-0 w-0.5", row.strip)}
                        />
                        <div className="flex items-center gap-2 pl-1.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70">
                            <row.icon className="h-3 w-3" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-white/90">
                              {row.name}
                            </p>
                            <p className="text-[10px] text-white/45">
                              {row.when}
                            </p>
                          </div>
                          <p
                            className={cn(
                              "text-xs font-semibold tabular-nums",
                              row.color
                            )}
                          >
                            {row.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

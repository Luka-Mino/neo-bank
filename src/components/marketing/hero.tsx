"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroProps {
  isAuthenticated?: boolean;
}

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient blob background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Banking without{" "}
            <span className="text-primary">the bank</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Stablecoin-powered accounts with zero fees, instant transfers, and
            full control over your money. Welcome to the future of finance.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 px-8 text-base"
                )}
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 px-8 text-base"
                )}
              >
                Get Started
              </Link>
            )}
            <a
              href="#features"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 px-8 text-base"
              )}
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

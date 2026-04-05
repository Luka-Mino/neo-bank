"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Ready to get started?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Open your account in minutes. No paperwork, no branch visits, no
          hassle.
        </p>
        <div className="mt-8">
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 px-8 text-base"
            )}
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </section>
  );
}

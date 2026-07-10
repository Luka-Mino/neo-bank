"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#0a1c1c] py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#4ac280]/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-moneta-hero relative overflow-hidden rounded-3xl p-10 ring-1 ring-white/10 sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#4ac280]/30 blur-3xl" />
          <div className="relative text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
              Open your account in minutes
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
              No paperwork. No branch visits. Just you and your money — moving
              at internet speed.
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-1.5 rounded-md bg-[#4ac280] px-8 text-base font-medium text-[#0a1c1c] transition hover:bg-[#5ed092]"
              >
                Get started — it&apos;s free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

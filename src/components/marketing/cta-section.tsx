"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Closing band — a confident invitation on an elevated dark panel.

export function CtaSection() {
  return (
    <section className="bg-[#0a1c1c] py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="reveal relative overflow-hidden rounded-[28px] bg-[#12302e] px-8 py-16 text-center shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.08] sm:px-14">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-30%] -z-0 h-[300px] w-[440px] -translate-x-1/2 rounded-full bg-[#4ac280]/[0.16] blur-[110px]"
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Open your account in minutes
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-white/65">
              No paperwork, no branch visits — just you and your money, moving in
              real time.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/register" className="cta-primary">
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

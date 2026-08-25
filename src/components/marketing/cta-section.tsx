"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Closing band — a clean, confident invitation on marble. No photography;
// the whitespace and one lit CTA carry it.

export function CtaSection() {
  return (
    <section className="bg-[#f6f6f6] py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="reveal relative overflow-hidden rounded-[28px] bg-white px-8 py-16 text-center shadow-[0_1px_2px_rgba(18,46,46,0.05),0_40px_80px_-40px_rgba(18,46,46,0.25)] ring-1 ring-[#122e2e]/[0.07] sm:px-14">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-30%] -z-0 h-[300px] w-[440px] -translate-x-1/2 rounded-full bg-[#4ac280]/[0.10] blur-[100px]"
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#122e2e] md:text-4xl">
              Open your account in minutes
            </h2>
            <p className="mx-auto mt-4 max-w-md text-lg text-[#5b6b6b]">
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

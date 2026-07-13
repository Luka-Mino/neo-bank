"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Closing band: an everyday scene (market, real light) under a forest
// grade — the product's promise is ordinary life with money handled.

export function CtaSection() {
  return (
    <section className="bg-[#0a1c1c] py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10">
          <Image
            src="/images/photos/cta-market.jpg"
            alt="A couple shopping at a farmers market"
            width={1600}
            height={1067}
            className="h-[420px] w-full object-cover saturate-[0.8] sm:h-[460px]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-[#0a1c1c]/90 via-[#0a1c1c]/55 to-[#0a1c1c]/25"
          />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-md p-10 sm:p-14">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Open your account in minutes
              </h2>
              <p className="mt-4 text-lg text-white/75">
                No paperwork. No branch visits. Just you and your money &mdash;
                moving at internet speed.
              </p>
              <div className="mt-8">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center gap-1.5 rounded-full bg-[#4ac280] px-8 text-base font-semibold text-[#0a1c1c] shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:bg-[#5ed092]"
                >
                  Get started &mdash; it&apos;s free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

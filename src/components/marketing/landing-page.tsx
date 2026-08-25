"use client";

import { useEffect } from "react";
import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { ProductStory } from "./product-story";
import { CardShowcase } from "./card-showcase";
import { TrustSection } from "./trust-section";
import { CtaSection } from "./cta-section";
import { Footer } from "./footer";

interface LandingPageProps {
  isAuthenticated: boolean;
}

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  // Scroll-reveal: reveal each `.reveal` block once as it enters the viewport.
  // Fails open — no IntersectionObserver or reduced-motion → everything shows.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (els.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#122e2e]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[#4ac280] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#122e2e]"
      >
        Skip to content
      </a>
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="h-16" aria-hidden />
      <main id="main">
        <Hero isAuthenticated={isAuthenticated} />
        <ProductStory />
        <CardShowcase />
        <TrustSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

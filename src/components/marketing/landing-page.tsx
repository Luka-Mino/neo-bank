"use client";

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

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
    <div className="min-h-screen bg-deep-forest text-[#f6f6f6]">
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="h-16" aria-hidden />
      <Hero isAuthenticated={isAuthenticated} />
      <ProductStory />
      <CardShowcase />
      <TrustSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

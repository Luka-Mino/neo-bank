"use client";

import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { FeaturesGrid } from "./features-grid";
import { TrustSection } from "./trust-section";
import { CtaSection } from "./cta-section";
import { Footer } from "./footer";

interface LandingPageProps {
  isAuthenticated: boolean;
}

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isAuthenticated={isAuthenticated} />
      <div className="h-16" aria-hidden />
      <Hero isAuthenticated={isAuthenticated} />
      <FeaturesGrid />
      <TrustSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

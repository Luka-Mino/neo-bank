import { MonetaCardPair } from "@/components/brand/moneta-card-art";

// Source for src/app/opengraph-image.png (1200 × 630). Internal design page:
// /design is sign-in-gated in production. Regenerate the PNG by screenshotting
// this frame at 1200 × 630 (see LAUNCH-READINESS-PLAN 3.5).
export default function OgFrame() {
  return (
    <div
      className="relative flex h-[630px] w-[1200px] items-center overflow-hidden text-forest"
      style={{ background: "radial-gradient(ellipse 75% 70% at 60% 55%, #f8faf9 0%, #e6ece9 70%, #dce4e0 100%)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "url(/images/patterns/topo-forest.svg)", backgroundSize: "900px", backgroundPosition: "center top" }}
      />
      <div className="relative w-[600px] pl-[80px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/moneta-full-forest.svg" alt="Moneta" className="h-auto w-[170px]" />
        <h1 className="mt-10 font-display text-[60px] font-semibold leading-[1.04] tracking-[-0.02em]">
          Money that keeps up with you
        </h1>
        <p className="mt-6 max-w-[30ch] text-[24px] leading-snug text-forest/70">
          Checking, savings and a debit card, built on regulated infrastructure.
        </p>
      </div>
      <div className="relative -mr-6 w-[560px]">
        <MonetaCardPair tint="smoked" />
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MonetaCard } from "@/components/account/moneta-card";

// Hero variations — a review page (not linked from nav). Each direction fixes
// the "AI-generated" tells a different way: flat buttons, distinctive display
// type (Bricolage), restrained green, real photography, and no floating-glass-
// card-on-a-glow. Open /design/hero to compare, then we promote the winner.

const FLAT_BTN =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#4ac280] px-7 text-[15px] font-semibold text-[#08221c] transition-colors hover:bg-[#5cd699]";
const GHOST_BTN =
  "inline-flex h-12 items-center justify-center rounded-full px-6 text-[15px] font-medium text-white/80 ring-1 ring-white/20 transition hover:bg-white/5";

function Label({ id, title, note }: { id: string; title: string; note: string }) {
  return (
    <div id={id} className="scroll-mt-14 border-b border-white/10 bg-[#0a1717] px-6 py-3">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-white/50">{note}</p>
    </div>
  );
}

/* ── A — Editorial photo (Monzo/Mercury path): one real full-bleed photo,
   bold type over it, flat button, green only on the CTA ─────────────────── */
function VariantA() {
  return (
    <section className="relative min-h-[620px] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/photos/trust-friends.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1717] via-[#0a1717]/80 to-[#0a1717]/20" />
      <div className="relative mx-auto flex min-h-[620px] max-w-6xl flex-col justify-center px-6 py-20 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4ac280]">
          Regulated stablecoin banking
        </p>
        <h1 className="font-display mt-5 max-w-2xl text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-6xl lg:text-7xl">
          Money that holds its value, and moves in seconds.
        </h1>
        <p className="mt-6 max-w-lg text-lg text-white/70">
          Hold real dollars, send them anywhere, spend them on your card — on
          rails that settle in seconds, not days.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/register" className={FLAT_BTN}>
            Open an account <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/#features" className={GHOST_BTN}>
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── B — Typography-first (Wise path): the headline IS the hero. No image,
   no card. Big Bricolage type, one flat CTA, restrained green ───────────── */
function VariantB() {
  return (
    <section className="relative flex min-h-[620px] items-center bg-deep-forest">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:px-10">
        <h1 className="font-display max-w-4xl text-6xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-[5.5rem]">
          Real dollars.
          <br />
          <span className="text-[#4ac280]">Real time.</span>
        </h1>
        <p className="mt-8 max-w-xl text-xl text-white/65">
          A bank account, a card, and instant transfers — built on regulated
          stablecoin rails. Dollars that settle in seconds.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/register" className={FLAT_BTN}>
            Open an account <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-sm text-white/45">
            FDIC pass-through · Bank-grade encryption · No hidden fees
          </span>
        </div>
      </div>
    </section>
  );
}

/* ── C — Refined product (evolution of current): keeps the card, but flat.
   No tilt, no glow, no pattern, solid button, big type, restrained green ── */
function VariantC() {
  return (
    <section className="relative min-h-[620px] bg-deep-forest">
      <div className="mx-auto grid min-h-[620px] max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4ac280]">
            Stablecoin banking, regulated rails
          </p>
          <h1 className="font-display mt-5 text-5xl font-semibold leading-[1.03] tracking-tight text-white md:text-6xl">
            Real dollars, moving in real time.
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/70">
            Hold, send, and spend dollar-backed digital cash that settles
            on-chain in seconds — with regulated banking partners behind it.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/register" className={FLAT_BTN}>
              Open an account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/#features" className={GHOST_BTN}>
              See how it works
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[380px]">
          <MonetaCard
            card={{
              last4: "7891",
              cardType: "physical",
              status: "active",
              expMonth: 8,
              expYear: 29,
              network: "visa",
            }}
            holder="ALEX RIVERA"
            size="lg"
          />
        </div>
      </div>
    </section>
  );
}

/* ── D — Split editorial: bold type left, a real card photo in a clean frame
   right. No glassmorphism, flat button ──────────────────────────────────── */
function VariantD() {
  return (
    <section className="relative min-h-[620px] bg-[#0e2323]">
      <div className="mx-auto grid min-h-[620px] max-w-6xl grid-cols-1 items-center gap-10 px-6 py-20 lg:grid-cols-2 lg:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4ac280]">
            The card that spends dollars, instantly
          </p>
          <h1 className="font-display mt-5 text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-6xl">
            Tap. Settled. Done.
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/70">
            Your balance is real, dollar-backed digital cash. Spend it anywhere
            — every payment clears in seconds, every fee on the receipt.
          </p>
          <div className="mt-9">
            <Link href="/register" className={FLAT_BTN}>
              Get your card <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/photos/card-tap.jpg"
            alt="Tapping a Moneta card to pay"
            className="h-[420px] w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default function HeroLab() {
  return (
    <div className="min-h-screen bg-[#0a1717] text-white">
      <header className="sticky top-0 z-50 flex items-center gap-4 border-b border-white/10 bg-[#0a1717]/95 px-6 py-3 backdrop-blur">
        <span className="text-sm font-semibold">Hero variations</span>
        <nav className="flex gap-3 text-xs text-white/60">
          <a href="#a" className="hover:text-white">A · Photo</a>
          <a href="#b" className="hover:text-white">B · Type</a>
          <a href="#c" className="hover:text-white">C · Refined card</a>
          <a href="#d" className="hover:text-white">D · Split</a>
        </nav>
        <span className="ml-auto text-xs text-white/40">flat buttons · big display type · restrained green · real photos</span>
      </header>

      <Label id="a" title="Variation A — Editorial photo" note="Monzo/Mercury path: one real full-bleed photo, bold type over it. Human, warm, zero effects." />
      <VariantA />

      <Label id="b" title="Variation B — Typography-first" note="Wise path: the headline is the hero. No image, no card — type and confidence do the work." />
      <VariantB />

      <Label id="c" title="Variation C — Refined product" note="Evolution of what we have: keeps the card, but flat — no tilt, no glow, no pattern, solid button." />
      <VariantC />

      <Label id="d" title="Variation D — Split editorial" note="Bold type + a real photo of the card being tapped, in a clean frame. No glassmorphism." />
      <VariantD />

      <div className="px-6 py-10 text-center text-sm text-white/40">
        End of variations — tell me which direction (or mix) to promote to the real homepage.
      </div>
    </div>
  );
}

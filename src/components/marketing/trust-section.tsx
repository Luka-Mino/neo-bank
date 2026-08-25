import { ShieldCheck, Lock, Scale, Coins } from "lucide-react";

// The one dark band on the page — deliberately. Trust is where a money product
// earns gravitas, so the compliance proof gets the deep-forest ground and a
// precise grid, no lifestyle photography.

const trustItems = [
  {
    icon: ShieldCheck,
    title: "FDIC pass-through",
    description: "Up to $250,000 in pass-through insurance via partner banks.",
  },
  {
    icon: Coins,
    title: "Backed 1:1",
    description: "Every digital dollar is redeemable for a real one, held at partner banks.",
  },
  {
    icon: Lock,
    title: "Bank-grade encryption",
    description: "256-bit AES end-to-end, two-factor authentication, continuous monitoring.",
  },
  {
    icon: Scale,
    title: "Regulated & compliant",
    description: "Licensed transmitter network, with full KYC / AML compliance.",
  },
] as const;

const marks = ["$250K pass-through", "256-bit AES", "KYC / AML", "24/7 monitoring"];

export function TrustSection() {
  return (
    <section id="trust" className="scroll-mt-24 bg-[#122e2e] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4ac280]">
            Security &amp; compliance
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Security you don&apos;t have to think about
          </h2>
          <p className="mt-4 max-w-xl text-white/60">
            Regulated partners, insured deposits, and enterprise-grade protection
            built into every transaction — so trust is the default, not a feature
            you have to check.
          </p>
        </div>

        <div className="reveal mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-2">
          {trustItems.map((item) => (
            <div key={item.title} className="flex gap-4 bg-[#122e2e] p-7">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4ac280]/12 text-[#4ac280] ring-1 ring-[#4ac280]/20">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/55">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
          {marks.map((m) => (
            <span
              key={m}
              className="rounded-full bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70 ring-1 ring-white/10"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

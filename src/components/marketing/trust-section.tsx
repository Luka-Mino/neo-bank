import Image from "next/image";
import { ShieldCheck, Lock, Scale } from "lucide-react";

// Trust: real people, real registrations. Photo carries the human warmth;
// the claims stand quietly beside it — no icon-grid theater.

const trustItems = [
  {
    icon: ShieldCheck,
    title: "FDIC pass-through",
    description: "Up to $250,000 in pass-through insurance via partner banks.",
  },
  {
    icon: Lock,
    title: "Bank-grade encryption",
    description: "256-bit AES, end-to-end. SOC 2 Type II environment.",
  },
  {
    icon: Scale,
    title: "Regulated & compliant",
    description: "Licensed transmitter network. Full KYC / AML compliance.",
  },
] as const;

export function TrustSection() {
  return (
    <section id="trust" className="bg-[#122e2e] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
          {/* Photo — graded toward the forest palette with an overlay */}
          <div className="w-full flex-1">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl">
              <Image
                src="/images/photos/trust-friends.jpg"
                alt="Two friends at a caf\u00e9 table, laughing over a phone"
                width={1600}
                height={1067}
                className="h-auto w-full object-cover saturate-[0.85]"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#122e2e]/45 via-transparent to-transparent"
              />
              <div className="absolute bottom-4 left-4 rounded-full bg-[#122e2e]/70 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                Money handled. Life, continued.
              </div>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#4ac280]">
              Security
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Security you don&apos;t have to think about
            </h2>
            <p className="mt-3 max-w-md text-white/60">
              Enterprise-grade protection, built into every transaction &mdash; so
              the app disappears into the background of your day.
            </p>

            <div className="mt-8 space-y-5">
              {trustItems.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4ac280]/15 text-[#4ac280]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-white/55">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { ShieldCheck, Lock, Scale } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "FDIC pass-through",
    description:
      "Up to $250,000 in pass-through insurance via partner banks.",
  },
  {
    icon: Lock,
    title: "Bank-grade encryption",
    description: "256-bit AES, end-to-end. SOC 2 Type II environment.",
  },
  {
    icon: Scale,
    title: "Regulated &amp; compliant",
    description: "Licensed transmitter network. Full KYC / AML compliance.",
  },
] as const;

export function TrustSection() {
  return (
    <section id="trust" className="bg-[#122e2e] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 flex max-w-md flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4ac280]/15 text-[#4ac280]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#4ac280]">
            Security
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Security you don&apos;t have to think about
          </h2>
          <p className="mt-3 text-white/60">
            Enterprise-grade protection, built into every transaction.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4ac280]/15 text-[#4ac280]">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">
                {item.title}
              </h3>
              <p
                className="mt-1 text-sm text-white/55"
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

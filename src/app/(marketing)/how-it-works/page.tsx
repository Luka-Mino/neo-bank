import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Globe, Receipt } from "lucide-react";

export const metadata: Metadata = {
  title: "How it works — Moneta",
  description:
    "How Moneta works: open an account, add money that converts to fully-backed digital dollars, and send or spend it — settling on regulated rails in seconds.",
};

const steps = [
  { n: "01", title: "Open your account", body: "Verify your identity in minutes and get real US account and routing numbers in your name — no branch, no paperwork." },
  { n: "02", title: "Add money", body: "Send a deposit to your details and it converts to digital dollars automatically — fully backed, and spendable the moment it settles." },
  { n: "03", title: "Send, spend, settle", body: "Pay with the Moneta card or send money in seconds. Transfers settle any day, any hour — with the exact fee shown before you confirm." },
];

const faster = [
  { icon: Clock, title: "Seconds, not days", body: "No cut-off times, no weekends, no “pending” limbo. Payments settle while you watch." },
  { icon: Globe, title: "Borders don't slow it down", body: "The same rails move money across the world as fast as across town." },
  { icon: Receipt, title: "The cost is on the receipt", body: "No spread hidden in the exchange rate — you see the exact total before and after." },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-[#0a1c1c]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4ac280]">
            How it works
          </p>
          <h1 className="font-display mt-4 text-balance text-4xl font-semibold tracking-tight text-[#f6f6f6] md:text-5xl">
            Digital dollars that move at internet speed
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65">
            Moneta holds your money as fully-backed digital dollars and moves it on
            regulated rails — so sending money feels less like a bank transfer and
            more like sending a message.
          </p>
        </div>
      </section>

      <section className="bg-[#0e2322] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="reveal grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="hover-lift rounded-2xl bg-[#12302e] p-7 ring-1 ring-white/[0.08]">
                <span className="font-mono text-sm font-semibold tabular-nums text-[#4ac280]">
                  {s.n}
                </span>
                <h3 className="font-display mt-3 text-xl font-semibold text-[#f6f6f6]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0a1c1c] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4ac280]">
              Why it&apos;s faster
            </p>
            <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[#f6f6f6] md:text-3xl">
              Old rails wait for business hours. Ours don&apos;t.
            </h2>
          </div>
          <div className="reveal mt-10 grid gap-5 sm:grid-cols-3">
            {faster.map((f) => (
              <div key={f.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4ac280]/10 text-[#4ac280] ring-1 ring-[#4ac280]/20">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#f6f6f6]">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#12302e] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
            It&apos;s money, not a bet
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/65">
            Your balance is dollars — fully reserved, redeemable any time. Stablecoins
            are just the rail underneath: no trading, no speculation, no watching a
            chart. The dollar you deposit is the dollar you spend.
          </p>
        </div>
      </section>

      <section className="bg-[#0a1c1c] py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#f6f6f6] md:text-4xl">
            Try it with your first dollar
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-white/65">
            Open an account in minutes and send your first payment the same day.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/register" className="cta-primary">
              Open an account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

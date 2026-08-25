import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Globe, Receipt } from "lucide-react";

export const metadata: Metadata = {
  title: "How it works — Moneta",
  description:
    "How Moneta works: open an account, add money that converts to fully-backed digital dollars, and send or spend it — settling on regulated rails in seconds.",
};

const steps = [
  {
    n: "01",
    title: "Open your account",
    body: "Verify your identity in minutes and get real US account and routing numbers in your name — no branch, no paperwork.",
  },
  {
    n: "02",
    title: "Add money",
    body: "Send a deposit to your details and it converts to digital dollars automatically — fully backed, and spendable the moment it settles.",
  },
  {
    n: "03",
    title: "Send, spend, settle",
    body: "Pay with the Moneta card or send on-chain. Transfers settle in seconds, any day, any hour — with the exact fee shown before you confirm.",
  },
];

const faster = [
  {
    icon: Clock,
    title: "Seconds, not days",
    body: "No cut-off times, no weekends, no “pending” limbo. Payments settle while you watch.",
  },
  {
    icon: Globe,
    title: "Borders don't slow it down",
    body: "The same rails move money across the world as fast as across town.",
  },
  {
    icon: Receipt,
    title: "The cost is on the receipt",
    body: "No spread hidden in the exchange rate — you see the exact total before and after.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Intro */}
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f8f5c]">
            How it works
          </p>
          <h1 className="font-display mt-4 text-balance text-4xl font-semibold tracking-tight text-[#122e2e] md:text-5xl">
            Digital dollars that move at internet speed
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[#5b6b6b]">
            Moneta holds your money as fully-backed digital dollars and moves it on
            regulated rails — so sending money feels less like a bank transfer and
            more like sending a message.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-[#f6f6f6] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl bg-white p-7 shadow-[0_1px_2px_rgba(18,46,46,0.04)] ring-1 ring-[#122e2e]/[0.07]"
              >
                <span className="font-mono text-sm font-semibold tabular-nums text-[#2f8f5c]">
                  {s.n}
                </span>
                <h3 className="font-display mt-3 text-xl font-semibold text-[#122e2e]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5b6b6b]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it's faster */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2f8f5c]">
              Why it&apos;s faster
            </p>
            <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[#122e2e] md:text-3xl">
              Old rails wait for business hours. Ours don&apos;t.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {faster.map((f) => (
              <div key={f.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4ac280]/10 text-[#2f8f5c] ring-1 ring-[#4ac280]/20">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#122e2e]">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#5b6b6b]">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Money, not crypto — the honest framing */}
      <section className="bg-[#122e2e] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
            It&apos;s money, not a bet
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/65">
            Your balance is dollars — backed 1:1, redeemable any time. Stablecoins
            are just the rail underneath: no trading, no speculation, no watching a
            chart. The dollar you deposit is the dollar you spend.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#122e2e] md:text-4xl">
            Try it with your first dollar
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-[#5b6b6b]">
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

import type { Metadata } from "next";
import { Clock, Globe, Receipt } from "lucide-react";
import {
  ClosingCta,
  IconCard,
  PageHero,
  SectionHeading,
} from "@/components/bank-site/page-parts";

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
      <PageHero
        crumb="How it works"
        eyebrow="How it works"
        title="Digital dollars that move at internet speed"
        lead="Moneta holds your money as fully-backed digital dollars and moves it on regulated rails — so sending money feels less like a bank transfer and more like sending a message."
      />

      <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
        <SectionHeading eyebrow="Three steps" title="From sign-up to first payment" />
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.n}
              className="relative rounded-[18px] border border-forest/[0.08] bg-white p-7 shadow-[0_1px_0_rgba(18,46,46,0.04),0_10px_30px_-24px_rgba(18,46,46,0.3)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest font-mono text-[14px] font-semibold text-turquoise">
                {s.n}
              </span>
              <h3 className="mt-4 font-display text-[21px] font-semibold">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-forest/65">{s.body}</p>
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-3 top-12 hidden h-px w-6 bg-turquoise/50 md:block"
                />
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-marble">
        <div className="mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Why it's faster"
            title="Old rails wait for business hours. Ours don't."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {faster.map((f) => (
              <IconCard key={f.title} icon={f.icon} title={f.title}>
                {f.body}
              </IconCard>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-forest text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-turquoise/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
          <SectionHeading
            tone="dark"
            title="It's money, not a bet"
            lead="Your balance is dollars — fully reserved, redeemable any time. Stablecoins are just the rail underneath: no trading, no speculation, no watching a chart. The dollar you deposit is the dollar you spend."
          />
        </div>
      </section>

      <ClosingCta
        title="Try it with your first dollar"
        body="Open an account in minutes and send your first payment the same day."
      />
    </>
  );
}

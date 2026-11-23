import type { Metadata } from "next";
import {
  ClosingCta,
  IconCard,
  PageHero,
  SectionHeading,
} from "@/components/bank-site/page-parts";
import type { IconName } from "@/components/brand/icon";

export const metadata: Metadata = {
  title: "How it works — Moneta",
  description:
    "How Moneta works: open an account, add money that converts to fully reserved digital dollars, and send it to people you know in seconds.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  { n: "01", title: "Open your account", body: "Verify your identity in minutes and get your own US account and routing numbers for deposits — no branch, no paperwork." },
  { n: "02", title: "Add money", body: "Send a deposit to your details and it converts to digital dollars automatically — fully reserved, and ready to use the moment it settles." },
  { n: "03", title: "Send and spend", body: "Send money to people you've saved in seconds, any day of the week, or pay online with your virtual Moneta card. Every fee is itemised on your receipt." },
];

const faster: { icon: IconName; title: string; body: string }[] = [
  { icon: "send", title: "Seconds, not days", body: "Payments to people you've saved settle in seconds. No cut-off times, and no waiting for Monday." },
  { icon: "transfer", title: "Instant between your accounts", body: "Move money between your own Moneta accounts instantly, any time, for free." },
  { icon: "fees", title: "The cost is on the receipt", body: "No spread hidden in an exchange rate. Every fee is itemised on your receipt." },
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
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest font-mono text-[14px] font-semibold text-copper-light">
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

      <section className="bg-smoke relative overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-turquoise/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
          <SectionHeading
            tone="dark"
            title="It's money, not a bet"
            lead="Your balance is held as USDC, a digital dollar fully reserved by its issuer. Stablecoins are just the rail underneath: no trading, no speculation, no watching a chart."
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

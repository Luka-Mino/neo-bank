import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Snowflake,
  BellRing,
  ShieldAlert,
  UserCheck,
  Coins,
  Landmark,
  Scale,
  ChevronRight,
  KeyRound,
} from "lucide-react";
import {
  ClosingCta,
  IconCard,
  PageHero,
  SectionHeading,
} from "@/components/bank-site/page-parts";
import { Ph } from "@/components/bank-site/placeholder";

export const metadata: Metadata = {
  title: "Security & trust — Moneta",
  description:
    "How Moneta protects your account and where your money is actually held — regulated infrastructure, fully-backed digital dollars, and safeguards on from day one.",
};

const protections = [
  { icon: UserCheck, title: "Two-factor authentication", body: "An authenticator-app code on sign-in, and required again before any money moves." },
  { icon: Snowflake, title: "Freeze in one tap", body: "Lock your card instantly from the app the moment something feels off." },
  { icon: Lock, title: "Encrypted end to end", body: "256-bit encryption in transit and at rest — secrets are never stored in the clear." },
  { icon: BellRing, title: "New sign-in alerts", body: "We flag logins from unfamiliar devices, so you always know who's in." },
  { icon: ShieldAlert, title: "Brute-force protection", body: "Automated rate-limiting stops password-guessing before it can start." },
  { icon: ShieldCheck, title: "Verified identity", body: "Full identity checks on every account, and a verified email before you can transact." },
];

const custody = [
  { icon: Coins, title: "Held as digital dollars", body: "Your balance is fully dollar-backed and redeemable 1:1 for US dollars — not a volatile asset." },
  { icon: Landmark, title: "On regulated rails", body: "Moneta runs on Dakota's regulated infrastructure; funds are held at established partner banks, not by us." },
  { icon: ShieldCheck, title: "Plainly disclosed", body: "Your balance is USDC, fully reserved with cash and short-term US government securities. It isn't a bank deposit, so it isn't FDIC-insured — and we'll always say so." },
  { icon: Scale, title: "Fully reserved", body: "Every dollar in your balance is backed by a real one at partner banks, and redeemable any time." },
];

const yourPart = [
  { icon: KeyRound, title: "Turn on two-factor sign-in", body: "It takes a minute in Settings and is the single best thing you can do." },
  { icon: ShieldAlert, title: "Never share a code", body: "Moneta will never ask for your password or one-time codes by phone, text or email." },
  { icon: Snowflake, title: "Freeze first, ask later", body: "If your card goes missing, freeze it straight away — you can unfreeze it any time." },
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        crumb="Security centre"
        eyebrow="Security & trust"
        title="Your money, protected by default"
        lead="Moneta runs on regulated infrastructure, your balance is held as fully-backed digital dollars, and every safeguard is on from the moment you open an account."
        aside={<ReportPanel />}
      />

      <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
        <SectionHeading title="How we protect your account" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {protections.map((p) => (
            <IconCard key={p.title} icon={p.icon} title={p.title}>
              {p.body}
            </IconCard>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-forest text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-turquoise/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
          <SectionHeading
            tone="dark"
            eyebrow="Where your money actually sits"
            title="Not with us — with regulated partner banks"
            lead={
              <>
                &ldquo;Digital dollars&rdquo; isn&apos;t a metaphor. Your balance
                is a fully-reserved claim on real US dollars, held on regulated
                rails and redeemable at any time.
              </>
            }
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {custody.map((c) => (
              <div
                key={c.title}
                className="flex gap-4 rounded-[18px] border border-white/10 bg-white/[0.05] p-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-turquoise/15 text-turquoise ring-1 ring-turquoise/30">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[17px] font-semibold">{c.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-white/70">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-[14px] leading-relaxed text-white/65">
            If something ever looks wrong, you can freeze your card instantly from
            the app and reach our support team — no waiting on hold.
          </p>
        </div>
      </section>

      <section className="bg-marble">
        <div className="mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Protect yourself"
            title="Three habits that stop most fraud"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {yourPart.map((y) => (
              <IconCard key={y.title} icon={y.icon} title={y.title}>
                {y.body}
              </IconCard>
            ))}
          </div>
        </div>
      </section>

      <ClosingCta
        title="Money you can trust, by design"
        body="Open an account in minutes — every safeguard on this page is there from your first dollar."
      />
    </>
  );
}

function ReportPanel() {
  return (
    <aside className="rounded-[20px] bg-forest p-6 text-white shadow-[0_20px_50px_-30px_rgba(18,46,46,0.6)]">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-turquoise">
        <ShieldAlert className="h-4 w-4" />
        Think you&apos;ve been targeted?
      </div>
      <ol className="mt-4 space-y-3 text-[14px] text-white/80">
        <li className="flex gap-3">
          <span className="font-mono text-turquoise">1</span>
          Freeze your card from your account straight away.
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-turquoise">2</span>
          Change your password and check your two-factor settings.
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-turquoise">3</span>
          <span>
            Contact us: <Ph className="text-[12px]">24/7 fraud line</Ph>
          </span>
        </li>
      </ol>
      <Link
        href="/login"
        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-turquoise px-4 py-2 text-[13px] font-semibold text-forest-900 transition hover:bg-turquoise-600"
      >
        <Snowflake className="h-3.5 w-3.5" />
        Sign in to freeze your card
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </aside>
  );
}

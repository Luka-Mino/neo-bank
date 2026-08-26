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
  ArrowRight,
} from "lucide-react";

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
  { icon: ShieldCheck, title: "FDIC pass-through", body: "Balances at partner banks are eligible for pass-through insurance up to $250,000." },
  { icon: Scale, title: "Backed 1:1, always", body: "Every digital dollar is fully reserved and redeemable — no fractional games, no surprises." },
];

export default function SecurityPage() {
  return (
    <>
      <section className="bg-[#0a1c1c]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4ac280]">
            Security &amp; trust
          </p>
          <h1 className="font-display mt-4 text-balance text-4xl font-semibold tracking-tight text-[#f6f6f6] md:text-5xl">
            Your money, protected by default
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/65">
            Moneta runs on regulated infrastructure, your balance is held as
            fully-backed digital dollars, and every safeguard is on from the
            moment you open an account.
          </p>
        </div>
      </section>

      <section className="bg-[#0e2322] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[#f6f6f6] md:text-3xl">
            How we protect your account
          </h2>
          <div className="reveal mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {protections.map((p) => (
              <div key={p.title} className="hover-lift rounded-2xl bg-[#12302e] p-6 ring-1 ring-white/[0.08]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4ac280]/10 text-[#4ac280] ring-1 ring-[#4ac280]/20">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#f6f6f6]">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0a1c1c] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4ac280]">
              Where your money actually sits
            </p>
            <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[#f6f6f6] md:text-3xl">
              Not with us — with regulated partner banks
            </h2>
            <p className="mt-4 text-white/65">
              &ldquo;Digital dollars&rdquo; isn&apos;t a metaphor. Your balance is
              a fully-reserved claim on real US dollars, held on regulated rails
              and redeemable at any time.
            </p>
          </div>

          <div className="reveal mt-10 grid gap-5 sm:grid-cols-2">
            {custody.map((c) => (
              <div key={c.title} className="hover-lift flex gap-4 rounded-2xl bg-[#12302e] p-6 ring-1 ring-white/[0.08]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4ac280]/10 text-[#4ac280] ring-1 ring-[#4ac280]/20">
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#f6f6f6]">{c.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">{c.body}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/55">
            If something ever looks wrong, you can freeze your card instantly from
            the app and reach our support team — no waiting on hold.
          </p>
        </div>
      </section>

      <section className="bg-[#0e2322] py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#f6f6f6] md:text-4xl">
            Money you can trust, by design
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-white/65">
            Open an account in minutes — every safeguard on this page is there from
            your first dollar.
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

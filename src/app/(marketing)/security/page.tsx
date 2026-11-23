import type { Metadata } from "next";
import {
  ClosingCta,
  IconCard,
  PageHero,
  SectionHeading,
} from "@/components/bank-site/page-parts";
import { Ph } from "@/components/bank-site/placeholder";
import { Icon, IconDisc, type IconName } from "@/components/brand/icon";
import { ButtonLink } from "@/components/brand/button";

export const metadata: Metadata = {
  title: "Security & trust — Moneta",
  description:
    "How Moneta protects your account and where your money is actually held: regulated infrastructure, fully reserved digital dollars, and safeguards you can see.",
  alternates: { canonical: "/security" },
};

// Every claim below is checked against the code (LAUNCH-READINESS-PLAN 3.4):
//  2FA gate → lib/auth/verification.ts assertMfaEnabled; encryption →
//  lib/crypto/field.ts + lib/auth/totp.ts (AES-256-GCM), bcrypt passwords;
//  sign-in alerts → lib/auth/login-devices.ts; rate limits → lib/rate-limit.ts;
//  verified email → assertEmailVerified (enforced whenever email is configured).
const protections: { icon: IconName; title: string; body: string }[] = [
  { icon: "two-step", title: "Two-step sign-in", body: "A code from your authenticator app or email at sign-in. No money can move until two-step sign-in is on." },
  { icon: "freeze", title: "Freeze in one tap", body: "Lock your card from your account the moment something feels off, and unlock it when you're ready." },
  { icon: "security", title: "Encrypted in transit and at rest", body: "Every connection is encrypted. Sensitive details like your two-step secret are encrypted with AES-256 before they're stored, and passwords are only ever stored as a secure hash." },
  { icon: "alerts", title: "New sign-in alerts", body: "We let you know when your account is signed in from a new device, so you always know who's in." },
  { icon: "protection", title: "Brute-force protection", body: "Sign-in attempts are rate-limited, so repeated password guesses get locked out." },
  { icon: "accounts", title: "Verified identity", body: "Full identity checks before any money can move, and a verified email address before you can transact." },
];

// COUNSEL REVIEW (D6): custody wording rewritten to match what the build does
// (USDC in a Dakota wallet for the account). Approve before launch.
const custody: { icon: IconName; title: string; body: string }[] = [
  { icon: "reserve", title: "Held as digital dollars", body: "Your balance is USDC, a stablecoin designed to hold a steady value of one US dollar. It isn't a volatile asset." },
  { icon: "transfer", title: "On regulated rails", body: "Deposits, withdrawals and transfers run on Dakota's regulated infrastructure and its banking partners." },
  { icon: "protection", title: "Plainly disclosed", body: "USDC isn't a bank deposit, so it isn't FDIC-insured. We'll always say so plainly." },
  { icon: "fees", title: "Fully reserved", body: "USDC is backed by cash and short-term US government securities held by its issuer, and you can withdraw to your bank whenever you like." },
];

const yourPart: { icon: IconName; title: string; body: string }[] = [
  { icon: "two-step", title: "Turn on two-step sign-in", body: "It takes a minute in Settings and is the single best thing you can do." },
  { icon: "protection", title: "Never share a code", body: "Moneta will never ask for your password or one-time codes by phone, text or email." },
  { icon: "freeze", title: "Freeze first, ask later", body: "If your card goes missing, freeze it straight away. You can unfreeze it any time." },
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        crumb="Security centre"
        eyebrow="Security & trust"
        title="Your money, protected by default"
        lead="Moneta runs on regulated infrastructure, your balance is held as fully reserved digital dollars, and no money can move until two-step sign-in is on."
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

      <section className="bg-smoke relative overflow-hidden text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-turquoise/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-[1200px] px-4 py-16 lg:px-8 lg:py-20">
          <SectionHeading
            tone="dark"
            eyebrow="Where your money actually sits"
            title="Held as USDC, on regulated infrastructure"
            lead={
              <>
                Your balance is held as USDC, a digital dollar fully reserved
                by its issuer with cash and short-term US government
                securities, in a wallet for your account on Dakota&apos;s
                regulated infrastructure.
              </>
            }
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {custody.map((c) => (
              <div
                key={c.title}
                className="flex gap-4 rounded-[18px] border border-white/10 bg-white/[0.05] p-6"
              >
                <IconDisc name={c.icon} size={44} className="ring-1 ring-turquoise/30" />
                <div>
                  <h3 className="text-[17px] font-semibold">{c.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-white/70">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-[14px] leading-relaxed text-white/65">
            If something ever looks wrong, freeze your card straight away from
            your account, then contact our support team.
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
      <div className="flex items-center gap-2 text-[13px] font-semibold text-turquoise [--icon-signal:#4ac280]">
        <Icon name="protection" size={17} className="text-white" />
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
            Contact us: <Ph className="text-[12px]">fraud contact (email, and hours)</Ph>
          </span>
        </li>
      </ol>
      <ButtonLink href="/login" variant="on-dark" size="sm" arrow className="mt-5">
        Sign in to freeze your card
      </ButtonLink>
    </aside>
  );
}

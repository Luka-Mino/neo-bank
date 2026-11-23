import { Logo } from "@/components/shared/logo";
import { Ph } from "./placeholder";
import { SectionLink } from "./section-link";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Banking",
    links: [
      { label: "Checking & savings", href: "/personal#accounts" },
      { label: "Debit cards", href: "/personal#cards" },
      { label: "Send & transfer", href: "/personal#transfers" },
      { label: "Spending insights", href: "/personal#insights" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Security centre", href: "/security" },
      { label: "Fees & limits", href: "/personal#help" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help & FAQ", href: "/personal#help" },
      { label: "Report fraud", href: "/personal#help" },
      { label: "Sign in", href: "/login" },
      { label: "Open an account", href: "/register" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-forest-900 text-white/70">
      <div className="mx-auto max-w-[1200px] px-4 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <Logo variant="full" tone="reverse" size={26} />
            <p className="mt-4 max-w-[30ch] text-[13px] leading-relaxed text-white/55">
              Everyday banking built on regulated infrastructure, with funds
              held at partner banks.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[13px] font-semibold text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <SectionLink
                      href={l.href}
                      className="text-[13px] transition-colors hover:text-white"
                    >
                      {l.label}
                    </SectionLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-3 border-t border-white/10 pt-8 text-[11.5px] leading-relaxed text-white/45">
          <p>
            Moneta is a financial technology company, not a bank. Accounts,
            deposits and transfers are powered by Dakota&apos;s regulated
            infrastructure and its banking partners.
          </p>
          <p>
            Your balance is held as USDC, a dollar-backed digital currency
            fully reserved by its issuer with cash and short-term US government
            securities. It is not a bank deposit and is not insured by the FDIC
            or any government agency.
          </p>
          <p>
            <Ph className="text-[11px]">
              card issuer disclosure — cards are issued through Dakota&apos;s card
              program; add Dakota&apos;s required Visa/issuer wording when it goes live
            </Ph>
          </p>
          <p className="pt-2 text-white/35">
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
            Moneta. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

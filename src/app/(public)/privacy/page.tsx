import type { Metadata } from "next";
import { Ph } from "@/components/bank-site/placeholder";
import { Clause, LegalPage, LegalSection, LegalSummary, Term, type LegalSection as Section } from "@/components/bank-site/legal-layout";
import { LEGAL_DOCS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy policy — Moneta",
  description: "What information Moneta collects, how we use it, and your choices.",
  alternates: { canonical: "/privacy" },
};

// COUNSEL REVIEW (D6): content carried over from the July draft, moved to the
// legal layout. Changed: "regular security audits" (none yet — pentest is
// Phase 4) now lists the protections that exist; the unverified contact
// address is a placeholder. Retention periods need counsel to confirm.

const S: Section[] = [
  { id: "collect", n: 1, title: "Information we collect" },
  { id: "use", n: 2, title: "How we use it" },
  { id: "share", n: 3, title: "Who we share it with" },
  { id: "retention", n: 4, title: "How long we keep it" },
  { id: "rights", n: 5, title: "Your rights" },
  { id: "security", n: 6, title: "Security" },
  { id: "contact", n: 7, title: "Contact" },
];

const list = "mt-2 list-disc space-y-1 pl-6 marker:text-turquoise";

export default function PrivacyPage() {
  return (
    <LegalPage
      current="/privacy"
      title="Privacy policy"
      subtitle="What we collect, how we use it, and your choices."
      updated={LEGAL_DOCS.privacy.updated}
      draft
      sections={S}
    >
      <LegalSummary>
        <p>
          This policy explains how <Ph>Moneta legal entity name</Ph> (<Term>Moneta</Term>, <Term>we</Term>) handles personal information
          when you use our website and accounts. We don&apos;t sell your personal information.
        </p>
      </LegalSummary>

      <LegalSection section={S[0]}>
        <Clause n="1.1" title="What you give us">
          <span className="block">Information you provide directly:</span>
        </Clause>
        <ul className={list}>
          <li>Name, email address and phone number</li>
          <li>Identity verification documents (for KYC)</li>
          <li>Bank account and financial information</li>
          <li>Transaction history and account activity</li>
        </ul>
        <Clause n="1.2" title="What we collect automatically">
          <span className="block">When you use the Service:</span>
        </Clause>
        <ul className={list}>
          <li>Device information and IP address</li>
          <li>Browser type and operating system</li>
          <li>Usage data and interaction patterns</li>
        </ul>
      </LegalSection>

      <LegalSection section={S[1]}>
        <ul className={list}>
          <li>Provide and maintain the Service</li>
          <li>Process transactions and send notifications</li>
          <li>Verify your identity (KYC/AML compliance)</li>
          <li>Detect and prevent fraud</li>
          <li>Comply with legal and regulatory requirements</li>
          <li>Improve the Service</li>
        </ul>
      </LegalSection>

      <LegalSection section={S[2]}>
        <p>
          We share information with our regulated infrastructure provider (Dakota) and its banking and card-issuing partners to process
          transactions, with identity verification providers for KYC/AML, and where the law requires it. We do not sell your personal
          information.
        </p>
      </LegalSection>

      <LegalSection section={S[3]}>
        <p>
          We keep financial records for at least 7 years, as regulation requires. KYC documents are kept for 5 years after an account is
          closed. You can ask us to delete information we aren&apos;t required to keep at any time.
        </p>
      </LegalSection>

      <LegalSection section={S[4]}>
        <p>You have the right to:</p>
        <ul className={list}>
          <li>Access your personal data</li>
          <li>Ask us to correct inaccurate data</li>
          <li>Ask us to delete it, subject to regulatory requirements</li>
          <li>Export your data in a portable format</li>
          <li>Opt out of marketing communications</li>
        </ul>
      </LegalSection>

      <LegalSection section={S[5]}>
        <p>
          Connections are encrypted, and sensitive details such as two-step sign-in secrets are encrypted with AES-256 before they&apos;re
          stored. Passwords are only stored as a secure hash. Money can&apos;t move until two-step sign-in is on, and sign-in attempts are
          rate-limited.
        </p>
      </LegalSection>

      <LegalSection section={S[6]}>
        <p>
          For privacy questions, email <Ph>privacy contact email</Ph>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}

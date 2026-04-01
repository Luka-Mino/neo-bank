import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: April 1, 2026
      </p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/80">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <p>We collect information you provide directly:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Name, email address, phone number</li>
            <li>Identity verification documents (for KYC)</li>
            <li>Bank account and financial information</li>
            <li>Transaction history and account activity</li>
          </ul>
          <p className="mt-2">We automatically collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Device information and IP address</li>
            <li>Browser type and operating system</li>
            <li>Usage data and interaction patterns</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide and maintain our services</li>
            <li>Process transactions and send notifications</li>
            <li>Verify your identity (KYC/AML compliance)</li>
            <li>Detect and prevent fraud</li>
            <li>Comply with legal and regulatory requirements</li>
            <li>Improve our services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Information Sharing</h2>
          <p>
            We share information with our banking partners for transaction
            processing, identity verification providers, and as required by law.
            We do not sell your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Data Retention</h2>
          <p>
            We retain financial records for a minimum of 7 years as required by
            regulation. KYC documents are retained for 5 years after account
            closure. You may request deletion of non-regulated data at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion (subject to regulatory requirements)</li>
            <li>Export your data in a portable format</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Security</h2>
          <p>
            We implement industry-standard security measures including encryption
            at rest and in transit, multi-factor authentication, and regular
            security audits.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
          <p>
            For privacy inquiries, contact us at privacy@neobank.app.
          </p>
        </section>
      </div>
    </div>
  );
}

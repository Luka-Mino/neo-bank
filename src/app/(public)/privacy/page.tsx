import { PageHero } from "@/components/bank-site/page-parts";

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        crumb="Privacy policy"
        title="Privacy Policy"
        lead={<>Last updated: July 14, 2026</>}
      />
      <div className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8 lg:py-16">

      <div className="prose prose-sm max-w-3xl space-y-6 text-[15px] leading-relaxed text-forest/75 [&_h2]:text-[18px] [&_h2]:text-forest">
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
            We share information with our banking partners and regulated
            infrastructure provider (Dakota) for transaction processing, with
            identity verification providers for KYC/AML, and as required by law.
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
            For privacy inquiries, contact us at privacy@moneta.app.
          </p>
        </section>
      </div>
      </div>
    </>
  );
}

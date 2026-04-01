import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: April 1, 2026
      </p>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground/80">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using NeoBank (&quot;Service&quot;), you agree to be bound by
            these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
          <p>
            NeoBank provides digital banking services including account management,
            fund deposits (on-ramp), withdrawals (off-ramp), and peer-to-peer
            transfers powered by stablecoin infrastructure. NeoBank is not a bank.
            Banking services are provided by our partner financial institutions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Eligibility</h2>
          <p>
            You must be at least 18 years old and a resident of a supported
            jurisdiction. You must complete identity verification (KYC) before
            accessing financial services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Account Security</h2>
          <p>
            You are responsible for maintaining the security of your account
            credentials. Notify us immediately of any unauthorized access. We are
            not liable for losses resulting from unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Deposits and FDIC Insurance</h2>
          <p>
            Deposits may be eligible for FDIC pass-through insurance up to
            $250,000 per depositor through our partner banks, subject to
            applicable requirements. NeoBank itself is not FDIC-insured.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Fees</h2>
          <p>
            Fee schedules are available within the application. We reserve the
            right to modify fees with 30 days&apos; notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Prohibited Activities</h2>
          <p>
            You may not use the Service for illegal activities, money laundering,
            terrorist financing, fraud, or any activity that violates applicable
            laws and regulations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, NeoBank shall not be liable
            for indirect, incidental, special, or consequential damages.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use after changes
            constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
          <p>
            For questions about these terms, contact us at support@neobank.app.
          </p>
        </section>
      </div>
    </div>
  );
}

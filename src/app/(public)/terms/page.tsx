import { PageHero } from "@/components/bank-site/page-parts";

export default function TermsPage() {
  return (
    <>
      <PageHero
        crumb="Terms of service"
        title="Terms of Service"
        lead={<>Last updated: July 14, 2026</>}
      />
      <div className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8 lg:py-16">

      <div className="prose prose-sm max-w-3xl space-y-6 text-[15px] leading-relaxed text-forest/75 [&_h2]:text-[18px] [&_h2]:text-forest">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Moneta (&quot;Service&quot;), you agree to be bound by
            these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
          <p>
            Moneta provides digital banking services including account management,
            fund deposits (on-ramp), withdrawals (off-ramp), and peer-to-peer
            transfers powered by regulated stablecoin infrastructure provided by
            Dakota. Moneta is not a bank. Banking, custody, and money-transmission
            services are provided by our partner financial institutions and
            licensed infrastructure providers.
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
          {/* COUNSEL REVIEW (D6): replaced an FDIC pass-through claim that
              doesn't apply to USDC balances. Wording matches the site-wide
              disclosure in components/bank-site/site-footer.tsx. */}
          <h2 className="text-lg font-semibold text-foreground">5. How Your Balance Is Held</h2>
          <p>
            Your balance is held as USDC, a dollar-backed digital currency
            fully reserved by its issuer with cash and short-term US government
            securities. It is not a bank deposit and is not insured by the FDIC
            or any government agency. Moneta is a financial technology company,
            not a bank.
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
            To the maximum extent permitted by law, Moneta shall not be liable
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
            For questions about these terms, contact us at support@moneta.app.
          </p>
        </section>
      </div>
      </div>
    </>
  );
}

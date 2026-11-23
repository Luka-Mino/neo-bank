import type { Metadata } from "next";
import Link from "next/link";
import { Ph } from "@/components/bank-site/placeholder";
import { Caps, CapsBox, Clause, LegalPage, LegalSection, LegalSummary, Term, type LegalSection as Section } from "@/components/bank-site/legal-layout";

export const metadata: Metadata = {
  title: "Terms of use — Moneta",
  description: "The terms for opening and using a Moneta account.",
  alternates: { canonical: "/terms" },
};

// COUNSEL REVIEW (D6): original draft, written to match what the product does
// today (USDC balances in a wallet for the account on Dakota's infrastructure;
// virtual Visa debit card through Dakota's card program; deposits credit the
// primary account; wallet payments are final; two-step sign-in required to
// move money). <Ph> marks facts only the company can supply. Do not publish
// as final until counsel approves.

const S: Section[] = [
  { id: "acceptance", n: 1, title: "Accepting these Terms" },
  { id: "service", n: 2, title: "The Moneta service" },
  { id: "eligibility", n: 3, title: "Who can use Moneta" },
  { id: "account", n: 4, title: "Your account and security" },
  { id: "moving-money", n: 5, title: "Moving money" },
  { id: "card", n: 6, title: "Your Moneta card" },
  { id: "fees", n: 7, title: "Fees" },
  { id: "partners", n: 8, title: "Partners and third-party services" },
  { id: "prohibited", n: 9, title: "Things you can't do" },
  { id: "risks", n: 10, title: "Risks you should understand" },
  { id: "ip", n: 11, title: "Our intellectual property" },
  { id: "disclaimers", n: 12, title: "Disclaimers" },
  { id: "liability", n: 13, title: "Limits on our liability" },
  { id: "indemnity", n: 14, title: "Indemnity" },
  { id: "closure", n: 15, title: "Suspending or closing accounts" },
  { id: "disputes", n: 16, title: "Disputes and governing law" },
  { id: "general", n: 17, title: "General terms" },
  { id: "contact", n: 18, title: "Contact us" },
];

export default function TermsPage() {
  return (
    <LegalPage
      current="/terms"
      title="Terms of use"
      subtitle="The terms for opening and using a Moneta account."
      updated="November 23, 2026"
      draft
      sections={S}
    >
      <LegalSummary>
        <p>
          These Terms of Use (the <Term>Terms</Term>) are an agreement between you and <Ph>Moneta legal entity name</Ph> (
          <Term>Moneta</Term>, <Term>we</Term> or <Term>us</Term>). They cover your Moneta account, the website and the web app (together,
          the <Term>Service</Term>). <Term>You</Term> means the person using the Service, or the business they act for.
        </p>
        <p>
          In short: Moneta is a technology company. Your balance is held as USDC on regulated infrastructure provided by our partners. Keep
          your sign-in safe, check payments before you confirm them, and use Moneta lawfully.
        </p>
      </LegalSummary>

      <CapsBox>
        Moneta is a financial technology company, not a bank. Accounts, deposits, transfers and cards are provided through Dakota&apos;s
        regulated infrastructure and its banking and card-issuing partners. Your balance is held as USDC, a dollar-backed digital currency.
        It is not a bank deposit and is not insured by the FDIC or any government agency.
      </CapsBox>

      <LegalSection section={S[0]}>
        <Clause n="1.1" title="Agreement">
          By creating an account or using the Service, you agree to these Terms and to our{" "}
          <Link href="/privacy" className="font-medium text-turquoise-700 underline-offset-2 hover:underline">
            Privacy policy
          </Link>
          . If you don&apos;t agree, don&apos;t use the Service.
        </Clause>
        <Clause n="1.2" title="Using Moneta for a business">
          If you open an account for a business, you confirm you&apos;re authorised to bind that business, and these Terms apply to it and to
          everyone you give access to.
        </Clause>
        <Clause n="1.3" title="Electronic communications">
          You agree to receive agreements, notices and statements electronically, by email or in the Service, and that your electronic
          acceptance counts as your signature.
        </Clause>
        <Clause n="1.4" title="Changes">
          We may update these Terms. If a change materially affects you, we&apos;ll tell you before it takes effect. If you keep using the
          Service after that, the updated Terms apply.
        </Clause>
      </LegalSection>

      <LegalSection section={S[1]}>
        <Clause n="2.1" title="What Moneta does">
          Moneta lets you hold money in one or more accounts, add money from a US bank, send money to people you&apos;ve saved, move money
          between your own accounts, withdraw to a linked bank, and use a debit card.
        </Clause>
        <Clause n="2.2" title="How your balance is held">
          Your balance is held as USDC in a digital wallet set up for your account on Dakota&apos;s infrastructure (the{" "}
          <Term>Wallet</Term>). Each account you open in Moneta (a <Term>Moneta Account</Term>) is a ledger of your share of that balance.
          USDC is issued by a third party and is designed to hold a steady value of one US dollar.
        </Clause>
        <Clause n="2.3" title="Our partners">
          Regulated services such as bank transfers, currency conversion and card issuing are provided by Dakota and its banking and
          card-issuing partners (together, <Term>Partners</Term>), not by Moneta.
        </Clause>
        <Clause n="2.4" title="No advice">
          Nothing in the Service is financial, investment, legal or tax advice.
        </Clause>
      </LegalSection>

      <LegalSection section={S[2]}>
        <Clause n="3.1" title="Eligibility">
          You must be at least 18, live in <Ph>supported countries/states</Ph>, and be able to enter into a binding contract.
        </Clause>
        <Clause n="3.2" title="Identity verification">
          Before money can move, you must complete identity verification through our Partner and keep your information accurate. We may ask
          for more information at any time, for example proof of address.
        </Clause>
        <Clause n="3.3" title="Sanctions">
          You can&apos;t use Moneta if you&apos;re subject to sanctions, or on behalf of anyone who is.
        </Clause>
      </LegalSection>

      <LegalSection section={S[3]}>
        <Clause n="4.1" title="Your sign-in">
          Keep your password and sign-in codes private. You&apos;re responsible for activity under your sign-in until you tell us it&apos;s
          been compromised.
        </Clause>
        <Clause n="4.2" title="Two-step sign-in">
          Two-step sign-in, with an authenticator app or emailed codes, must be on before you can send, transfer or withdraw money.
        </Clause>
        <Clause n="4.3" title="Team members">
          On business accounts you can invite <Term>Team Members</Term> and choose what each can do, including whether they can move money,
          approve payments or export data. You&apos;re responsible for what they do with the access you give them. Payments over your
          approval limits wait for another team member&apos;s approval, and nobody can approve their own request.
        </Clause>
        <Clause n="4.4" title="If something looks wrong">
          Freeze your card in the Service and contact us straight away if you think your account has been accessed without permission.
        </Clause>
      </LegalSection>

      <LegalSection section={S[4]}>
        <Clause n="5.1" title="Deposits">
          Money you send to your deposit details by ACH or wire is converted to USDC and credited to your primary Moneta Account when our
          Partner receives it. ACH typically takes 1–3 business days. Deposits may be limited or held, for example until you provide proof of
          address.
        </Clause>
        <Clause n="5.2" title="Payments to saved wallets">
          You can send USDC to a wallet address you&apos;ve saved for a recipient. <strong className="font-semibold text-forest">Payments
          to a wallet are final once confirmed and can&apos;t be reversed</strong>, so check the recipient and address before you confirm.
        </Clause>
        <Clause n="5.3" title="Withdrawals">
          You can withdraw to a US bank account you&apos;ve linked, by ACH or wire. The amount taken from your Moneta Account includes any
          fees, which are itemised on your receipt.
        </Clause>
        <Clause n="5.4" title="Transfers between your accounts">
          Transfers between your own Moneta Accounts are instant and free. Recurring transfers run on the schedule you set until you cancel
          them.
        </Clause>
        <Clause n="5.5" title="When we may hold or decline">
          We or our Partners may delay, hold or decline a payment where the law requires it, to protect you or others, or if we suspect
          fraud or a breach of these Terms. If a payment fails, any money held for it is returned to your Moneta Account.
        </Clause>
      </LegalSection>

      <LegalSection section={S[5]}>
        <Clause n="6.1" title="Issuer terms">
          The Moneta card is a virtual Visa debit card issued through Dakota&apos;s card program. Your use of the card is also governed by
          the cardholder terms of the issuing bank: <Ph>link to the issuer&apos;s cardholder agreement</Ph>. If those terms conflict with
          these Terms on a card matter, the cardholder terms apply.
        </Clause>
        <Clause n="6.2" title="Freezing">
          You can freeze and unfreeze your card at any time in the Service. A frozen card declines new payments.
        </Clause>
      </LegalSection>

      <LegalSection section={S[6]}>
        <Clause n="7.1" title="Our fees">
          Opening an account and moving money between your own Moneta Accounts is free. Our current fees are listed at{" "}
          <Ph>fees page link</Ph>.
        </Clause>
        <Clause n="7.2" title="Partner and network fees">
          Partners may charge fees for transfers, conversion and withdrawals, and blockchain networks charge fees to process payments.
          Fees that apply to a payment are itemised on its receipt.
        </Clause>
        <Clause n="7.3" title="Changes to fees">
          We&apos;ll give you notice before we introduce a new fee or raise an existing one.
        </Clause>
      </LegalSection>

      <LegalSection section={S[7]}>
        <Clause n="8.1" title="Separate terms">
          Some features are provided by Partners under their own terms, which you&apos;ll be asked to accept where needed. For the services
          they cover, those terms take precedence.
        </Clause>
        <Clause n="8.2" title="Availability">
          We don&apos;t control Partner services or blockchain networks and can&apos;t guarantee they&apos;ll always be available.
        </Clause>
      </LegalSection>

      <LegalSection section={S[8]}>
        <Clause n="9.1" title="Prohibited uses">
          You may not use Moneta for anything illegal, including money laundering, terrorist financing, fraud or sanctions evasion; to send
          money that comes from crime; to access accounts that aren&apos;t yours; or to interfere with, reverse-engineer or overload the
          Service.
        </Clause>
      </LegalSection>

      <LegalSection section={S[9]}>
        <Clause n="10.1" title="Stablecoin risk">
          USDC depends on its issuer and its reserves. In rare cases a stablecoin can lose its link to the US dollar, or be frozen by its
          issuer.
        </Clause>
        <Clause n="10.2" title="Network risk">
          Blockchain payments are final, and networks can be delayed or congested.
        </Clause>
        <Clause n="10.3" title="Regulatory change">
          Laws affecting digital currencies may change and could affect how the Service works.
        </Clause>
      </LegalSection>

      <LegalSection section={S[10]}>
        <Clause n="11.1" title="Ownership">
          The Service, including the Moneta name, logos, card designs and software, belongs to Moneta or its licensors. We give you a
          personal, revocable licence to use it under these Terms.
        </Clause>
      </LegalSection>

      <LegalSection section={S[11]}>
        <Caps>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. To the extent the law allows, we make no warranties
          beyond those in these Terms, including warranties of merchantability, fitness for a particular purpose and non-infringement.
        </Caps>
      </LegalSection>

      <LegalSection section={S[12]}>
        <Caps>
          To the extent the law allows, Moneta is not liable for indirect, incidental, special, consequential or punitive damages, or for
          lost profits or data. Our total liability for any claim is limited to <Ph className="normal-case">liability cap</Ph>. Nothing in
          these Terms limits liability that can&apos;t be limited by law.
        </Caps>
      </LegalSection>

      <LegalSection section={S[13]}>
        <Clause n="14.1" title="Indemnity">
          If you breach these Terms or the law, you agree to cover our reasonable losses and costs that result, including reasonable legal
          fees.
        </Clause>
      </LegalSection>

      <LegalSection section={S[14]}>
        <Clause n="15.1" title="Closing your account">
          You can close a Moneta Account in the Service once you&apos;ve moved its money out. Closed accounts can&apos;t be reopened.
        </Clause>
        <Clause n="15.2" title="Our right to suspend or close">
          We may suspend or close your access if the law or our Partners require it, if you breach these Terms, or to prevent fraud. Where
          we&apos;re allowed to, we&apos;ll tell you why and help you withdraw any remaining balance.
        </Clause>
      </LegalSection>

      <LegalSection section={S[15]}>
        <Clause n="16.1" title="Governing law">
          These Terms are governed by the laws of <Ph>governing law (state)</Ph>.
        </Clause>
        <Clause n="16.2" title="Resolving disputes">
          Please contact us first so we can try to fix the problem. <Ph>arbitration and class-action waiver terms, if any</Ph>
        </Clause>
      </LegalSection>

      <LegalSection section={S[16]}>
        <Clause n="17.1" title="Entire agreement">
          These Terms, our Privacy policy and any Partner terms you accept are the whole agreement between us about the Service.
        </Clause>
        <Clause n="17.2" title="Severability">
          If part of these Terms can&apos;t be enforced, the rest still applies.
        </Clause>
        <Clause n="17.3" title="Assignment">
          You can&apos;t transfer your rights under these Terms without our consent. We may transfer ours as part of a merger,
          acquisition or sale of assets.
        </Clause>
      </LegalSection>

      <LegalSection section={S[17]}>
        <Clause n="18.1" title="Questions">
          Email <Ph>support email</Ph> or write to <Ph>mailing address</Ph>.
        </Clause>
      </LegalSection>
    </LegalPage>
  );
}

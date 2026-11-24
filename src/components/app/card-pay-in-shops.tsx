"use client";

// "Pay in shops with your phone": how to add the card to Apple Pay or Google
// Pay. Moneta is a website, so the card is added by typing its details into
// the phone's wallet; one-tap "Add to Apple Wallet" needs a native app
// (NATIVE-APP-PLAN.md).
//
// The real card number is shown by Dakota's Cards.js, inside Dakota's own
// frame, so it never touches Moneta's servers (plan 5.2, needs the sandbox).
// Until that ships this panel only appears in demo mode, with demo details:
// never show steps the customer can't finish.

import { useState } from "react";
import { Segmented } from "@/components/app/fields";
import { Notice } from "@/components/app/states";
import { Button } from "@/components/brand/button";
import { DEMO_MODE } from "@/lib/demo-data";

/** Flip on when the Cards.js card-details reveal is wired (plan 5.2). */
export const CARD_DETAILS_REVEAL_READY = false;

type Phone = "iphone" | "android";

const STEPS: Record<Phone, string[]> = {
  iphone: [
    "Tap Show card details below and keep this screen open.",
    "On your iPhone, open the Wallet app, tap +, then Debit or Credit Card, then Continue.",
    "Choose Enter Card Details Manually and type the card number, expiry date and security code. Follow the prompts to verify.",
    "To pay, hold your iPhone near the card reader and confirm with Face ID or Touch ID.",
  ],
  android: [
    "Tap Show card details below and keep this screen open.",
    "Open Google Wallet, tap Add to Wallet, then Payment card, then New credit or debit card.",
    "Choose to enter the details manually and type the card number, expiry date and security code. Follow the prompts to verify.",
    "To pay, unlock your phone and hold it near the card reader.",
  ],
};

export function CardPayInShops({
  last4,
  expMonth,
  expYear,
}: {
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
}) {
  const [phone, setPhone] = useState<Phone>("iphone");
  const [shown, setShown] = useState(false);

  if (!DEMO_MODE && !CARD_DETAILS_REVEAL_READY) return null;

  const exp =
    expMonth && expYear ? `${String(expMonth).padStart(2, "0")}/${String(expYear).slice(-2)}` : "—";

  return (
    <section className="mt-6 border-t border-forest/[0.07] pt-5" aria-labelledby="pay-in-shops">
      <h2 id="pay-in-shops" className="text-[15px] font-semibold text-forest">
        Pay in shops with your phone
      </h2>
      <p className="mt-1 text-[13.5px] text-forest/70">
        Add your card to Apple Pay or Google Pay once, then tap your phone to pay wherever Visa is accepted.
      </p>

      <div className="mt-4">
        <Segmented<Phone>
          label="Your phone"
          value={phone}
          onChange={setPhone}
          options={[
            { value: "iphone", label: "iPhone" },
            { value: "android", label: "Android" },
          ]}
        />
      </div>

      <ol className="mt-4 space-y-3">
        {STEPS[phone].map((step, i) => (
          <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-forest">
            <span
              aria-hidden
              className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-forest text-[12px] font-semibold text-white"
            >
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4">
        {shown ? (
          <div className="rounded-[16px] bg-forest p-4 text-white">
            {DEMO_MODE && (
              <span className="mb-2 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[12px] font-semibold">Demo details</span>
            )}
            <dl className="grid grid-cols-[1fr_auto_auto] gap-x-6 gap-y-1">
              <dt className="text-[12px] text-white/70">Card number</dt>
              <dt className="text-[12px] text-white/70">Expires</dt>
              <dt className="text-[12px] text-white/70">Security code</dt>
              <dd className="font-mono text-[15px] tracking-wider">4000 0000 0000 {last4 ?? "0000"}</dd>
              <dd className="font-mono text-[15px]">{exp}</dd>
              <dd className="font-mono text-[15px]">123</dd>
            </dl>
            <Button size="sm" variant="on-dark" className="mt-3" onClick={() => setShown(false)}>
              Hide card details
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setShown(true)}>
            Show card details
          </Button>
        )}
      </div>

      <Notice tone="info" className="mt-4">
        {DEMO_MODE && !CARD_DETAILS_REVEAL_READY
          ? "In the live app, your card details appear in a secure frame from our card partner and are never stored by Moneta."
          : "Only you can see your card details. They're shown in a secure frame from our card partner and are never stored by Moneta."}
      </Notice>
    </section>
  );
}

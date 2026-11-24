"use client";

// "Spending" panel on the card screen: what the card can spend right now, and
// what's on hold, from GET /api/cards/spending (Dakota's wallet `card` figures).
// A hold can be bigger than the purchase (tips, fuel), so it says why.

import { useQuery } from "@tanstack/react-query";
import { formatUsd } from "@/lib/money-input";
import { DEMO_MODE } from "@/lib/demo-data";

type Spending =
  | { status: "ok"; available: number; held: number }
  | { status: "unavailable" | "no_wallet" };

// Demo: a restaurant bill of $45 holding $58.50 until the tip is known.
const DEMO_SPENDING: Spending = { status: "ok", available: 12399.82, held: 58.5 };

export function CardSpending({ accountId }: { accountId: string }) {
  const q = useQuery({
    queryKey: ["card-spending", accountId],
    queryFn: async (): Promise<Spending> => {
      const r = await fetch(`/api/cards/spending?accountId=${encodeURIComponent(accountId)}`);
      if (!r.ok) throw new Error("card-spending");
      const j = await r.json();
      return (j?.data ?? j) as Spending;
    },
    enabled: !DEMO_MODE,
    refetchInterval: 60_000,
  });
  const data = DEMO_MODE ? DEMO_SPENDING : q.data;

  // Quietly absent until there's something real to show: cards not enabled
  // yet, a slow read, or an error (the rest of the screen still works).
  if (!data || data.status !== "ok") return null;

  return (
    <div className="mt-5 rounded-[16px] bg-[#f3f5f4] p-4">
      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-[12.5px] text-forest/65">Available to spend</dt>
          <dd className="tabular mt-0.5 text-[20px] font-semibold text-forest">{formatUsd(data.available)}</dd>
        </div>
        <div>
          <dt className="text-[12.5px] text-forest/65">On hold</dt>
          <dd className="tabular mt-0.5 text-[20px] font-semibold text-forest">{formatUsd(data.held)}</dd>
        </div>
      </dl>
      <details className="group mt-3">
        <summary className="cursor-pointer list-none text-[13px] font-semibold text-forest underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-turquoise">
          Why can a hold be more than I spent?
        </summary>
        <div className="mt-2 space-y-2 text-[13px] leading-relaxed text-forest/75">
          <p>
            When you pay, the amount is held until the shop finishes the payment, usually within a few days. Some
            places hold a little extra until the final amount is known:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Restaurants and cafés: up to 30% more, for a tip</li>
            <li>Bars, taxis, salons and parking: up to 20% more</li>
            <li>Hotels and car rentals: about 15% more (car rentals at least $75)</li>
            <li>US fuel pumps: $175 until you finish filling up</li>
            <li>Paying in another currency: 3% more, for exchange-rate changes</li>
          </ul>
          <p>Once the payment completes, only the real amount is taken and the rest is released.</p>
        </div>
      </details>
    </div>
  );
}

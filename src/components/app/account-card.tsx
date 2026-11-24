"use client";

// The card that belongs to an account (SIDE-ACCOUNTS-PLAN.md): one account,
// its own card, and the card only spends that account's money. Shown on the
// account page; offers to issue the card if the account doesn't have one yet.

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCardsQuery, type AccountRow, type CardRow } from "@/components/account/use-accounts";
import { postJson } from "@/components/app/api";
import { Notice } from "@/components/app/states";
import { Button } from "@/components/brand/button";
import { MonetaCardArt } from "@/components/brand/moneta-card-art";
import { DEMO_MODE } from "@/lib/demo-data";
import { queryKeys } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function AccountCard({ account }: { account: AccountRow }) {
  const qc = useQueryClient();
  const cardsQ = useCardsQuery();
  const cards = (cardsQ.data ?? []).filter(
    (c) => c.accountId === account.id && c.status !== "canceled" && c.status !== "replaced"
  );

  const issue = useMutation({
    mutationFn: async () => {
      if (DEMO_MODE) {
        const card: CardRow = {
          id: `card-${Date.now()}`,
          accountId: account.id,
          cardType: "virtual",
          last4: String(1000 + Math.floor(Math.random() * 9000)),
          status: "active",
          nickname: null,
          expMonth: 11,
          expYear: 2030,
          network: "visa",
        };
        qc.setQueryData<CardRow[]>(queryKeys.cards.list, (old) => [...(old ?? []), card]);
        return;
      }
      await postJson("/api/cards", { accountId: account.id, cardType: "virtual" });
    },
    onSuccess: () => toast.success("Your card is ready"),
    onSettled: () => !DEMO_MODE && qc.invalidateQueries({ queryKey: queryKeys.cards.all }),
  });

  if (account.status !== "active" && account.status !== "frozen") return null;

  return (
    <div className="mx-4 mt-4 overflow-hidden rounded-[18px] bg-white shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)] lg:mx-0">
      {cards.length > 0 ? (
        cards.map((c) => {
          const frozen = c.status === "frozen";
          return (
            <Link
              key={c.id}
              href={`/app/card?card=${encodeURIComponent(c.id)}`}
              className="flex items-center gap-3 border-b border-forest/[0.06] px-4 py-4 last:border-b-0 hover:bg-forest/[0.02]"
            >
              <span aria-hidden className={cn("w-14 shrink-0", frozen && "grayscale-[0.6]")}>
                <MonetaCardArt side="front" tint="smoked" last4={c.last4 ?? "••••"} label="" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-forest">This account&apos;s card</div>
                <div className="mt-0.5 text-[12.5px] text-forest/65">
                  <span className="font-mono">•••• {c.last4}</span> · {frozen ? "Frozen" : "Spends only from this account"}
                </div>
              </div>
              <span aria-hidden className="text-forest/40">›</span>
            </Link>
          );
        })
      ) : (
        <div className="px-4 py-4">
          <div className="text-[15px] font-semibold text-forest">No card yet</div>
          <p className="mt-0.5 text-[13px] text-forest/65">Get a virtual card that spends only from this account.</p>
          <Button size="sm" className="mt-3" loading={issue.isPending} onClick={() => issue.mutate()}>
            Get its card
          </Button>
          {issue.isError && (
            <Notice tone="error" className="mt-3">
              {issue.error instanceof Error ? issue.error.message : "We couldn't issue the card right now."}
            </Notice>
          )}
        </div>
      )}
    </div>
  );
}

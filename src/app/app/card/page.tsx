"use client";

// Card — /app version of (dashboard)/card, Dakota-ready.
// Same APIs: GET /api/cards, POST /api/cards (issue a virtual card),
// PATCH /api/cards/[id] { status } (freeze/unfreeze — the issuer is called
// first for Dakota cards and its refusals come back as plain messages),
// PATCH /api/cards/[id]/account (link to another account).
//
// Deliberately NOT carried over from the old screen: the Online /
// Contactless / International switches (they never called an API) and PIN
// (Dakota cards are virtual-only). Showing the full number/CVV needs Dakota's
// Cards.js (LAUNCH-READINESS-PLAN 5.2), so it isn't offered here yet.

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APP_CONTAINER } from "@/components/app/app-shell";
import { Picker } from "@/components/app/picker";
import { DetailList, EmptyState, ErrorState, GlyphBadge, LoadingRows, Notice } from "@/components/app/states";
import { postJson } from "@/components/app/api";
import { accountName, useActiveAccounts } from "@/components/app/account-picker";
import { useDisplayName } from "@/components/app/data";
import { useCardsQuery, type CardRow } from "@/components/account/use-accounts";
import { Button, ButtonLink } from "@/components/brand/button";
import { Icon } from "@/components/brand/icon";
import { MonetaCardArt } from "@/components/brand/moneta-card-art";
import { DEMO_MODE } from "@/lib/demo-data";
import { queryKeys } from "@/lib/queries";
import { cn } from "@/lib/utils";

// Dakota cards can be "pending" with no last4/expiry yet.
type Card = Omit<CardRow, "status" | "last4" | "expMonth" | "expYear"> & {
  status: CardRow["status"] | "pending";
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
};

export default function CardPage() {
  const qc = useQueryClient();
  const cardsQ = useCardsQuery();
  const { accounts } = useActiveAccounts();
  const { firstName } = useDisplayName();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [demoCards, setDemoCards] = useState<Card[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cards = useMemo(
    () => ((demoCards ?? (cardsQ.data as unknown as Card[] | undefined)) ?? []).filter((c) => c.status !== "canceled" && c.status !== "replaced"),
    [cardsQ.data, demoCards]
  );
  const card = cards.find((c) => c.id === selectedId) ?? cards[0];
  const linked = accounts.find((a) => a.id === card?.accountId);

  const refresh = () => qc.invalidateQueries({ queryKey: queryKeys.cards.all });

  const freeze = useMutation({
    mutationFn: async (next: "active" | "frozen") => {
      if (!card) return;
      if (DEMO_MODE) {
        setDemoCards(cards.map((c) => (c.id === card.id ? { ...c, status: next } : c)));
        return;
      }
      await postJson(`/api/cards/${encodeURIComponent(card.id)}`, { status: next }, { method: "PATCH" });
    },
    onMutate: () => setError(null),
    onError: (e) => setError(e instanceof Error ? e.message : "We couldn't update your card."),
    onSettled: refresh,
  });

  const relink = useMutation({
    mutationFn: async (accountId: string) => {
      if (!card) return;
      if (DEMO_MODE) {
        setDemoCards(cards.map((c) => (c.id === card.id ? { ...c, accountId } : c)));
        return;
      }
      await postJson(`/api/cards/${encodeURIComponent(card.id)}/account`, { accountId }, { method: "PATCH" });
    },
    onMutate: () => setError(null),
    onError: (e) => setError(e instanceof Error ? e.message : "We couldn't link the card to that account."),
    onSettled: refresh,
  });

  const issue = useMutation({
    mutationFn: async () => {
      const target = accounts.find((a) => a.isPrimary) ?? accounts[0];
      if (!target) throw new Error("Open an account first, then you can add a card.");
      if (DEMO_MODE) {
        const fresh: Card = {
          id: `card-${Date.now()}`,
          accountId: target.id,
          cardType: "virtual",
          last4: "2207",
          status: "active",
          nickname: null,
          expMonth: 11,
          expYear: 2030,
          network: "visa",
        };
        setDemoCards([...cards, fresh]);
        setSelectedId(fresh.id);
        return;
      }
      const created = await postJson<Card>("/api/cards", { accountId: target.id, cardType: "virtual" });
      if (created?.id) setSelectedId(created.id);
    },
    onMutate: () => setError(null),
    onError: (e) => setError(e instanceof Error ? e.message : "We couldn't issue a card right now."),
    onSettled: refresh,
  });

  const frozen = card?.status === "frozen";
  const pending = card?.status === "pending";

  return (
    <div className="pb-10 lg:pb-16">
      <header className="app-band text-white">
        <div className={cn(APP_CONTAINER, "px-5 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))] lg:pb-32 lg:pt-10")}>
          <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] lg:text-[32px]">Card</h1>
          <p className="mt-1 text-[14px] text-white/65">Your virtual Visa debit card.</p>
        </div>
      </header>

      <div className={cn(APP_CONTAINER, "relative z-[1] -mt-24 lg:-mt-28 lg:grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-start lg:gap-10")}>
        {/* Card visual + switcher */}
        <div className="px-6 lg:px-0">
          {cardsQ.isLoading && !DEMO_MODE ? (
            <div className="aspect-[430/272] w-full animate-pulse rounded-[18px] bg-white/10" />
          ) : card ? (
            <>
              <div className={cn("relative transition", frozen && "grayscale-[0.6]")}>
                <MonetaCardArt side="front" tint="smoked" holder={(firstName || "").toUpperCase()} last4={card.last4 ?? "••••"} />
                {(frozen || pending) && (
                  <span className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-[13px] font-semibold text-forest shadow-lg">
                    <Icon name={frozen ? "freeze" : "card"} size={16} />
                    {frozen ? "Frozen" : "Getting your card ready"}
                  </span>
                )}
              </div>
              {cards.length > 1 && (
                <div role="tablist" aria-label="Your cards" className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {cards.map((c) => (
                    <button
                      key={c.id}
                      role="tab"
                      aria-selected={c.id === card.id}
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        "h-9 shrink-0 rounded-[10px] px-3 text-[13px] font-semibold transition outline-none focus-visible:shadow-[0_0_0_2px_#f3f5f4,0_0_0_4px_#4ac280]",
                        c.id === card.id ? "bg-forest text-marble" : "bg-white text-forest/70 ring-1 ring-forest/10"
                      )}
                    >
                      {c.nickname || (c.cardType === "physical" ? "Physical" : "Virtual")} ···· {c.last4 ?? "—"}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>

        <section className="mx-3 mt-6 rounded-[22px] bg-white p-5 shadow-[0_1px_0_rgba(18,46,46,0.04),0_10px_30px_-16px_rgba(18,46,46,0.25)] sm:mx-4 lg:mx-0 lg:mt-14 lg:p-7">
          {cardsQ.isLoading && !DEMO_MODE ? (
            <LoadingRows rows={3} label="Loading your card" />
          ) : cardsQ.isError && !DEMO_MODE ? (
            <ErrorState onRetry={() => cardsQ.refetch()} />
          ) : !card ? (
            <EmptyState
              icon="card"
              title="Get your Moneta card"
              body="A virtual Visa debit card you can use online as soon as it's issued."
              action={
                <Button loading={issue.isPending} onClick={() => issue.mutate()} arrow>
                  Get a virtual card
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={frozen ? "primary" : "secondary"}
                  disabled={pending}
                  loading={freeze.isPending}
                  onClick={() => freeze.mutate(frozen ? "active" : "frozen")}
                >
                  <Icon name="freeze" size={18} className={frozen ? "[--icon-signal:#4ac280]" : undefined} />
                  {frozen ? "Unfreeze" : "Freeze"}
                </Button>
                <ButtonLink href="/app/activity" variant="secondary">
                  <Icon name="insights" size={18} />
                  Activity
                </ButtonLink>
              </div>
              {frozen && (
                <p className="mt-3 text-[13px] text-forest/65">Frozen cards decline every payment. Unfreeze it any time.</p>
              )}
              {pending && (
                <Notice tone="info" className="mt-4">
                  Your card is being issued. This usually takes a moment, and we&apos;ll let you know when it&apos;s ready.
                </Notice>
              )}

              <DetailList
                className="mt-5"
                rows={[
                  { label: "Type", value: card.cardType === "physical" ? "Physical Visa debit" : "Virtual Visa debit" },
                  { label: "Number", value: <span className="font-mono">···· {card.last4 ?? "—"}</span> },
                  {
                    label: "Expires",
                    value: card.expMonth && card.expYear ? `${String(card.expMonth).padStart(2, "0")}/${String(card.expYear).slice(-2)}` : "—",
                  },
                  { label: "Status", value: pending ? "Being issued" : frozen ? "Frozen" : "Active" },
                ]}
              />

              <div className="mt-4 border-t border-forest/[0.07] pt-4">
                <Picker
                  label="Pays from"
                  sheetTitle="Link this card to"
                  options={accounts.map((a) => ({
                    id: a.id,
                    title: accountName(a),
                    leading: <GlyphBadge name={Number(a.goalAmount ?? 0) > 0 ? "goals" : "accounts"} />,
                  }))}
                  value={card.accountId}
                  onChange={(id) => id !== card.accountId && relink.mutate(id)}
                  loading={relink.isPending}
                  disabled={pending}
                />
                {linked && <p className="mt-2 text-[12.5px] text-forest/65">Card payments come out of {accountName(linked)}.</p>}
              </div>

              {error && (
                <Notice tone="error" className="mt-4" title="That didn't work">
                  {error}
                </Notice>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-forest/[0.07] pt-4">
                <p className="text-[13px] text-forest/65">Lost it or seeing payments you don&apos;t recognise? Freeze it first.</p>
                <Button size="sm" variant="quiet" loading={issue.isPending} onClick={() => issue.mutate()}>
                  Add another virtual card
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

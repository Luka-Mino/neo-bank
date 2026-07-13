"use client";

// /card — multi-card management. Shows the user's cards with the currently-
// selected one at full size, account linkage chip, freeze/reveal/reassign
// actions, and an "Issue card" CTA.
//
// Selection: ?card=<id> via URL (so a deep-link to a specific card scrolls
// straight to it). When ?account= is set, cards are filtered to that account.

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Snowflake,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Wifi,
  Globe,
  ShoppingCart,
  AlertTriangle,
  Flame,
  Plus,
  KeyRound,
  CreditCard,
  ArrowRight,
  ArrowLeftRight,
  Inbox,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { MonetaCard } from "@/components/account/moneta-card";
import {
  useSelectedAccount,
  useCardsQuery,
  useAccountsQuery,
  type CardRow,
  type AccountRow,
} from "@/components/account/use-accounts";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { fetchApi, queryKeys } from "@/lib/queries";
import { withAccountParam } from "@/components/account/with-account-param";

type ControlKey = "online" | "contactless" | "international";

const controlsList: {
  key: ControlKey;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  strip: string;
}[] = [
  {
    key: "online",
    label: "Online payments",
    description: "Enable e-commerce checkout",
    icon: ShoppingCart,
    strip: "strip-purple",
  },
  {
    key: "contactless",
    label: "Contactless",
    description: "Tap-to-pay via NFC",
    icon: Wifi,
    strip: "strip-emerald",
  },
  {
    key: "international",
    label: "International",
    description: "Allow purchases abroad",
    icon: Globe,
    strip: "strip-blue",
  },
];

export default function CardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { account: scopedAccount, mode } = useSelectedAccount();
  const isAggregate = mode === "all";

  const accountsQ = useAccountsQuery();
  const accounts = accountsQ.data ?? [];
  const cardsQ = useCardsQuery();
  const allCards = cardsQ.data ?? [];

  // Active cards in scope. We hide canceled/replaced from the main list.
  const cardsInScope = useMemo(() => {
    const visible = allCards.filter(
      (c) => c.status !== "canceled" && c.status !== "replaced"
    );
    if (isAggregate || !scopedAccount) return visible;
    return visible.filter((c) => c.accountId === scopedAccount.id);
  }, [allCards, isAggregate, scopedAccount]);

  // ?card=<id> selects the active card. Default to first in scope.
  const cardParam = searchParams?.get("card") ?? null;
  const selectedCard = useMemo<CardRow | null>(() => {
    if (cardParam) {
      const found = cardsInScope.find((c) => c.id === cardParam);
      if (found) return found;
    }
    return cardsInScope[0] ?? null;
  }, [cardParam, cardsInScope]);

  // If ?card= is present but doesn't match any visible card (filtered out
  // by ?account= scope, or just stale), drop it.
  useEffect(() => {
    if (!cardParam) return;
    if (cardsQ.isLoading) return;
    if (cardsInScope.find((c) => c.id === cardParam)) return;
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("card");
    router.replace(`${pathname}?${params.toString()}`);
  }, [cardParam, cardsQ.isLoading, cardsInScope, pathname, router, searchParams]);

  function selectCard(id: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("card", id);
    router.replace(`${pathname}?${params.toString()}`);
  }

  // Mutations.
  const freeze = useMutation({
    mutationFn: async (next: "active" | "frozen") => {
      if (!selectedCard) throw new Error("No card selected");
      const res = await fetchApi<{ success: true; data: CardRow }>(
        `/api/cards/${selectedCard.id}`,
        { method: "PATCH", body: JSON.stringify({ status: next }) }
      );
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      toast.success(data.status === "frozen" ? "Card frozen" : "Card unfrozen");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not update card"),
  });

  const reassign = useMutation({
    mutationFn: async (accountId: string) => {
      if (!selectedCard) throw new Error("No card selected");
      const res = await fetchApi<{ success: true; data: CardRow }>(
        `/api/cards/${selectedCard.id}/account`,
        { method: "PATCH", body: JSON.stringify({ accountId }) }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      toast.success("Card reassigned");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not reassign"),
  });

  const issueVirtual = useMutation({
    mutationFn: async () => {
      const targetAccount =
        selectedCard?.accountId ??
        scopedAccount?.id ??
        accounts.find((a) => a.isPrimary)?.id ??
        accounts[0]?.id;
      if (!targetAccount) throw new Error("No active account to issue against");
      const res = await fetchApi<{ success: true; data: CardRow }>(
        "/api/cards",
        {
          method: "POST",
          body: JSON.stringify({
            accountId: targetAccount,
            cardType: "virtual",
          }),
        }
      );
      return res.data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cards.all });
      toast.success("Virtual card issued");
      selectCard(created.id);
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not issue card"),
  });

  // Empty state.
  if (!cardsQ.isLoading && cardsInScope.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Card
          </h1>
          <p className="text-muted-foreground">
            {isAggregate
              ? "You don't have any cards yet."
              : `No cards on ${scopedAccount?.nickname || scopedAccount?.accountType}.`}
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Issue your first card</p>
              <p className="text-xs text-muted-foreground">
                Virtual cards are instant. Tap to pay anywhere Visa is accepted.
              </p>
            </div>
            <Button
              onClick={() => issueVirtual.mutate()}
              disabled={issueVirtual.isPending || accounts.length === 0}
            >
              {issueVirtual.isPending && (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              )}
              <Plus className="mr-2 h-4 w-4" />
              Issue virtual card
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <CardPageInner
      cards={cardsInScope}
      selectedCard={selectedCard}
      selectCard={selectCard}
      accounts={accounts}
      isLoading={cardsQ.isLoading}
      isAggregate={isAggregate}
      onFreeze={(next) => freeze.mutate(next)}
      freezing={freeze.isPending}
      onReassign={(id) => reassign.mutate(id)}
      reassigning={reassign.isPending}
      onIssueVirtual={() => issueVirtual.mutate()}
      issuingVirtual={issueVirtual.isPending}
      searchParams={searchParams}
    />
  );
}

function CardPageInner({
  cards,
  selectedCard,
  selectCard,
  accounts,
  isLoading,
  isAggregate,
  onFreeze,
  freezing,
  onReassign,
  reassigning,
  onIssueVirtual,
  issuingVirtual,
  searchParams,
}: {
  cards: CardRow[];
  selectedCard: CardRow | null;
  selectCard: (id: string) => void;
  accounts: AccountRow[];
  isLoading: boolean;
  isAggregate: boolean;
  onFreeze: (next: "active" | "frozen") => void;
  freezing: boolean;
  onReassign: (accountId: string) => void;
  reassigning: boolean;
  onIssueVirtual: () => void;
  issuingVirtual: boolean;
  searchParams: ReturnType<typeof useSearchParams>;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [controls, setControls] = useState<Record<ControlKey, boolean>>({
    online: true,
    contactless: true,
    international: false,
  });

  function toggleControl(key: ControlKey) {
    setControls((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const label =
        key === "online"
          ? "Online payments"
          : key === "contactless"
            ? "Contactless"
            : "International";
      toast.success(`${label} ${next[key] ? "enabled" : "disabled"}`);
      return next;
    });
  }

  const linkedAccount = accounts.find(
    (a) => a.id === selectedCard?.accountId
  );
  const otherAccounts = accounts.filter(
    (a) => a.id !== selectedCard?.accountId && a.status === "active"
  );
  const frozen = selectedCard?.status === "frozen";

  const quickRows: {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    strip: string;
    onClick: () => void;
    disabled?: boolean;
  }[] = [
    {
      label: "Spending limits",
      description: "Set daily / monthly transaction caps",
      icon: SlidersHorizontal,
      strip: "strip-orange",
      onClick: () => toast.info("Spending limits coming soon"),
    },
    {
      label: "PIN settings",
      description: "View or change your card PIN",
      icon: KeyRound,
      strip: "strip-cyan",
      onClick: () => toast.info("PIN flow coming soon"),
    },
    {
      label: "Add virtual card",
      description: "Disposable cards for online checkout",
      icon: Plus,
      strip: "strip-red",
      onClick: onIssueVirtual,
      disabled: issuingVirtual,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {cards.length > 1 ? "Cards" : "Card"}
          </h1>
          <p className="text-muted-foreground">
            {cards.length > 1
              ? `${cards.length} cards · ${isAggregate ? "all accounts" : `linked to ${linkedAccount?.nickname || linkedAccount?.accountType || "account"}`}`
              : "Virtual & physical cards with real-time controls"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onIssueVirtual}
          disabled={issuingVirtual}
        >
          {issuingVirtual && (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          )}
          <Plus className="mr-2 h-4 w-4" />
          Issue virtual
        </Button>
      </div>

      {/* Card list (top) — small chips you can click to select */}
      {cards.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {cards.map((c) => {
            const acct = accounts.find((a) => a.id === c.accountId);
            const active = c.id === selectedCard?.id;
            const label = c.nickname || c.cardType;
            return (
              <button
                key={c.id}
                onClick={() => selectCard(c.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-left text-xs transition",
                  active
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/40"
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <CreditCard className="h-3 w-3" />
                </span>
                <span className="font-medium capitalize">
                  {label} ··{c.last4}
                </span>
                <span className="text-muted-foreground">
                  · {acct?.nickname || acct?.accountType || "—"}
                </span>
                {c.status === "frozen" && (
                  <Snowflake className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedCard && (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          {/* Card visual */}
          <div className="space-y-4">
            <MonetaCard
              size="md"
              holder="Alex Demo"
              card={{
                last4: selectedCard.last4,
                cardType: selectedCard.cardType,
                status: frozen ? "frozen" : selectedCard.status,
                expMonth: selectedCard.expMonth,
                expYear: selectedCard.expYear,
                network: selectedCard.network,
              }}
              account={
                linkedAccount
                  ? {
                      accountType: linkedAccount.accountType,
                      nickname: linkedAccount.nickname,
                    }
                  : undefined
              }
            />

            {/* Linked account chip + reassign menu */}
            {linkedAccount && (
              <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-border">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Linked to</span>
                  <span className="font-medium">
                    {linkedAccount.nickname || linkedAccount.accountType}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ··{linkedAccount.accountNumber.slice(-4)}
                  </span>
                </div>
                {otherAccounts.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      disabled={reassigning}
                      className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium transition hover:bg-muted"
                    >
                      {reassigning && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      <ArrowLeftRight className="h-3 w-3" />
                      Reassign
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={4}>
                      <div className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
                        Move to account
                      </div>
                      {otherAccounts.map((a) => (
                        <DropdownMenuItem
                          key={a.id}
                          onClick={() => onReassign(a.id)}
                        >
                          <span className="flex-1 text-sm">
                            {a.nickname || a.accountType}
                          </span>
                          <span className="ml-2 text-[10px] text-muted-foreground">
                            ··{a.accountNumber.slice(-4)}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}

            {/* Reveal panel */}
            {showDetails && (
              <div className="rounded-xl border border-border bg-card p-4 text-[13px]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="eyebrow text-foreground/50">Number</div>
                    <div className="mt-1 font-mono">
                      4532 {selectedCard.last4.padStart(4, "0")} 2345{" "}
                      {selectedCard.last4}
                    </div>
                  </div>
                  <div>
                    <div className="eyebrow text-foreground/50">CVV</div>
                    <div className="mt-1 font-mono">428</div>
                  </div>
                </div>
              </div>
            )}

            {/* Status row + reveal toggle */}
            <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-border">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    frozen ? "bg-muted-foreground" : "bg-primary"
                  )}
                />
                <span className="text-sm font-medium">
                  {frozen ? "Frozen" : "Active"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDetails((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                {showDetails ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" /> Hide details
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" /> Reveal details
                  </>
                )}
              </button>
            </div>

            {/* Freeze + Card transactions row */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={frozen ? "default" : "outline"}
                className="h-auto justify-start gap-3 py-3"
                onClick={() => onFreeze(frozen ? "active" : "frozen")}
                disabled={freezing}
              >
                {freezing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : frozen ? (
                  <Flame className="h-4 w-4" />
                ) : (
                  <Snowflake className="h-4 w-4" />
                )}
                <div className="text-left">
                  <p className="text-sm font-medium leading-tight">
                    {frozen ? "Unfreeze" : "Freeze card"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {frozen ? "Restore activity" : "Block all payments"}
                  </p>
                </div>
              </Button>
              <Link
                href={withAccountParam(
                  `/transactions?card=${selectedCard.id}`,
                  searchParams
                )}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-auto justify-start gap-3 py-3"
                )}
              >
                <CreditCard className="h-4 w-4" />
                <div className="text-left">
                  <p className="text-sm font-medium leading-tight">
                    Card transactions
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Filter by this card
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Controls + More */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Toggles
            </p>
            {controlsList.map((c) => (
              <div
                key={c.key}
                className={cn(
                  "flex items-center gap-4 rounded-xl bg-card px-4 py-3 ring-1 ring-border",
                  c.strip
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <c.icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleControl(c.key)}
                  role="switch"
                  aria-checked={controls[c.key]}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full outline-none transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    controls[c.key]
                      ? "bg-primary"
                      : "bg-muted ring-1 ring-inset ring-border"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform",
                      controls[c.key]
                        ? "translate-x-[22px]"
                        : "translate-x-[2px]"
                    )}
                  />
                </button>
              </div>
            ))}

            <Separator className="my-1" />

            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              More
            </p>
            {quickRows.map((row) => (
              <button
                key={row.label}
                type="button"
                onClick={row.onClick}
                disabled={row.disabled}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl bg-card px-4 py-3 text-left ring-1 ring-border transition hover:bg-muted/40 disabled:opacity-60",
                  row.strip
                )}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <row.icon className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Lost your card or seeing fraud?
              </p>
              <p className="text-xs text-muted-foreground">
                We&apos;ll freeze the card instantly and ship a replacement.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              toast.info("Contact support to report a lost or stolen card")
            }
          >
            Report card
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

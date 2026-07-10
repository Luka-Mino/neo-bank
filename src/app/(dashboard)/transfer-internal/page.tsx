"use client";

// /transfer-internal — move funds between two of the user's own accounts.
// Distinct from /send (P2P) and /transfer-out (external bank withdrawals).
// Atomic on the server (book-transfer over a DB transaction); we just
// drive the UI and prevent same-source/destination on the client.

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowDown,
  ArrowLeftRight,
  Info,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import {
  useSelectedAccount,
  type AccountRow,
} from "@/components/account/use-accounts";
import { SourceAccountPicker } from "@/components/account/source-account-picker";
import { fetchApi, queryKeys } from "@/lib/queries";
import { useNewAccountDialog } from "@/components/account/new-account-dialog-provider";
import { DEMO_MODE } from "@/lib/demo-data";

const presetAmounts = [50, 100, 500, 1000];

function fmtUsd(n: string | number): string {
  const v = typeof n === "string" ? Number(n) : n;
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TransferInternalPage() {
  const queryClient = useQueryClient();
  const { openAccounts, account: scopedAccount } = useSelectedAccount();
  const { open: openNewAccountDialog } = useNewAccountDialog();

  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");

  // Initialize from/to defaults once accounts load: From = scoped (or primary),
  // To = first open account that isn't From. Prevents the two pickers from
  // colliding on the same default and ending up with mismatched filters.
  useEffect(() => {
    if (fromId && toId) return;
    if (openAccounts.length < 2) return;
    const initialFrom = fromId || scopedAccount?.id || openAccounts[0].id;
    const initialTo =
      toId || openAccounts.find((a) => a.id !== initialFrom)?.id || "";
    if (!fromId) setFromId(initialFrom);
    if (!toId && initialTo) setToId(initialTo);
  }, [fromId, toId, scopedAccount, openAccounts]);

  const fromAccount = openAccounts.find((a) => a.id === fromId);
  const toAccount = openAccounts.find((a) => a.id === toId);
  const numAmount = parseFloat(amount || "0") || 0;
  const insufficient =
    fromAccount && numAmount > 0 && numAmount > Number(fromAccount.balance);

  const transfer = useMutation({
    mutationFn: async () => {
      if (DEMO_MODE) {
        // No API call — apply the move locally so balances update visibly.
        return { mocked: true };
      }
      const res = await fetchApi<{ success: true; data: unknown }>(
        "/api/transfers/internal",
        {
          method: "POST",
          body: JSON.stringify({
            fromAccountId: fromId,
            toAccountId: toId,
            amount,
            note: note.trim() || undefined,
          }),
        }
      );
      return res.data;
    },
    onSuccess: () => {
      if (DEMO_MODE) {
        // Mutate the cached accounts: debit source, credit dest.
        const amt = Number(amount);
        queryClient.setQueryData<AccountRow[]>(
          queryKeys.accounts.list,
          (old) =>
            (old ?? []).map((a) => {
              if (a.id === fromId) {
                return {
                  ...a,
                  balance: (Number(a.balance) - amt).toFixed(2),
                };
              }
              if (a.id === toId) {
                return {
                  ...a,
                  balance: (Number(a.balance) + amt).toFixed(2),
                };
              }
              return a;
            })
        );
      }
      if (!DEMO_MODE) {
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      }
      toast.success("Transfer complete");
      setAmount("");
      setNote("");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Transfer failed");
    },
  });

  function swap() {
    setFromId(toId);
    setToId(fromId);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromId || !toId) {
      toast.error("Select both source and destination accounts");
      return;
    }
    if (fromId === toId) {
      toast.error("Source and destination must differ");
      return;
    }
    if (numAmount <= 0) {
      toast.error("Enter an amount greater than 0");
      return;
    }
    if (insufficient) {
      toast.error("Insufficient balance");
      return;
    }
    transfer.mutate();
  }

  // No accounts — empty state.
  if (openAccounts.length === 0) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Between accounts
        </h1>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm font-medium">You don't have any accounts yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Open at least two accounts to move funds between them.
            </p>
            <Button onClick={() => openNewAccountDialog()} className="mt-4">
              Open new account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only one account — same problem, different copy.
  if (openAccounts.length === 1) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Between accounts
          </h1>
          <p className="text-muted-foreground">
            Between your own accounts — instant and free
          </p>
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You only have one account. Open another to move funds between them.
          </AlertDescription>
        </Alert>
        <Button onClick={() => openNewAccountDialog()}>
          Open new account
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Between accounts
        </h1>
        <p className="text-muted-foreground">
          Between your own accounts — instant and free
        </p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <SourceAccountPicker
              label="From"
              value={fromId}
              onChange={setFromId}
              filter={(a) => a.id !== toId}
            />

            <div className="flex justify-center">
              <button
                type="button"
                onClick={swap}
                disabled={!fromId || !toId}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/60 transition hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label="Swap from / to"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>

            <SourceAccountPicker
              label="To"
              value={toId}
              onChange={setToId}
              filter={(a) => a.id !== fromId}
            />

            {/* Amount */}
            <div className="rounded-2xl bg-muted/50 p-5">
              <Label
                htmlFor="amount"
                className="text-[11px] uppercase tracking-wider text-muted-foreground"
              >
                Amount
              </Label>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-auto border-none bg-transparent p-0 text-3xl font-semibold tabular-nums shadow-none focus-visible:ring-0 md:text-4xl"
                />
                <span className="text-sm font-medium text-muted-foreground">
                  USD
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {presetAmounts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmount(a.toString())}
                    className="rounded-full bg-background px-3 py-1 text-xs font-medium ring-1 ring-border transition hover:bg-primary hover:text-primary-foreground"
                  >
                    {fmtUsd(a)}
                  </button>
                ))}
                {fromAccount && (
                  <button
                    type="button"
                    onClick={() => setAmount(fromAccount.balance)}
                    className="rounded-full bg-background px-3 py-1 text-xs font-medium ring-1 ring-border transition hover:bg-primary hover:text-primary-foreground"
                  >
                    Max
                  </button>
                )}
              </div>
              {insufficient && (
                <p className="mt-2 text-xs text-destructive">
                  Insufficient balance — {fromAccount && fmtUsd(fromAccount.balance)} available
                </p>
              )}
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-xs uppercase tracking-wider text-muted-foreground">
                Note <span className="normal-case tracking-normal text-foreground/40">(optional)</span>
              </Label>
              <Input
                id="note"
                placeholder="e.g. Vacation savings"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={140}
              />
            </div>

            {/* Summary */}
            {fromAccount && toAccount && numAmount > 0 && (
              <div className="rounded-xl bg-primary/5 p-3 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    Internal transfer · instant · no fee
                  </span>
                  <span className="tabular-nums font-medium text-foreground">
                    {fmtUsd(numAmount)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>{fromAccount.nickname || fromAccount.accountType}</span>
                  <span>→</span>
                  <span>{toAccount.nickname || toAccount.accountType}</span>
                </div>
              </div>
            )}

            <div className="pt-1">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={transfer.isPending || !!insufficient}
              >
                {transfer.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Move {amount ? fmtUsd(numAmount) : "funds"}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Atomic · same-currency only
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium">No on-chain footprint</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Internal transfers are book entries. Your underlying stablecoin
            wallet stays untouched and the move is immediate.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

// Withdraw to a linked bank — /app version of (dashboard)/transfer-out.
// Same API: POST /api/transactions { txType: "offramp", USDC → USD,
// destinationPaymentRail: "ach" | "fedwire" }. Two-leg on the server; the
// total debited (send_amount, fees included) is only known once the transfer
// is created, so review shows the fee as "set at creation" and the receipt
// shows the exact fee. A 202 + warning means leg 2 is unconfirmed: shown as
// "processing", never as done.

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FlowScreen, HelpCard } from "@/components/app/flow-screen";
import { AmountInput } from "@/components/app/amount-input";
import { AccountPicker, accountName, useActiveAccounts, useDefaultAccount } from "@/components/app/account-picker";
import { Picker } from "@/components/app/picker";
import { Segmented } from "@/components/app/fields";
import { ReviewSheet } from "@/components/app/review-sheet";
import { EmptyState, ErrorState, GlyphBadge, LoadingRows, Notice, SuccessState } from "@/components/app/states";
import { postJson } from "@/components/app/api";
import { useCustomer } from "@/components/app/data";
import { Button, ButtonLink } from "@/components/brand/button";
import { LinkBankDialog } from "@/components/account/link-bank-dialog";
import { checkAmount, formatUsd, parseAmount, toApiAmount } from "@/lib/money-input";
import { queryKeys } from "@/lib/queries";
import { DEMO_LINKED_BANKS, DEMO_MODE } from "@/lib/demo-data";

type Rail = "ach" | "fedwire";
const RAIL: Record<Rail, { label: string; arrives: string }> = {
  ach: { label: "ACH", arrives: "1–3 business days" },
  fedwire: { label: "Wire", arrives: "Same business day" },
};

type Bank = { id: string; bankName: string; accountType: string; last4: string };

type Result = {
  amount: number;
  total: number;
  bank: string;
  rail: Rail;
  transactionId: string | null;
  warning?: string;
};

function useLinkedBanks(enabled: boolean) {
  const q = useQuery({
    queryKey: ["destinations", "fiat_us"],
    queryFn: async () => {
      const r = await fetch("/api/destinations?type=fiat_us");
      if (!r.ok) throw new Error("destinations");
      return r.json();
    },
    enabled: !DEMO_MODE && enabled,
  });
  const banks: Bank[] = DEMO_MODE
    ? DEMO_LINKED_BANKS.map((b) => ({ id: b.dakotaRecipientId, bankName: b.bankName, accountType: b.accountType, last4: b.last4 }))
    : (q.data?.data?.data ?? []).map(
        (d: { dakotaDestinationId: string; label: string | null; details?: { bankName?: string; accountType?: string; last4?: string } }) => ({
          id: d.dakotaDestinationId,
          bankName: d.details?.bankName ?? d.label ?? "Bank account",
          accountType: d.details?.accountType ?? "",
          last4: d.details?.last4 ?? "····",
        })
      );
  return { banks, isLoading: !DEMO_MODE && enabled && q.isLoading };
}

export default function WithdrawPage() {
  const qc = useQueryClient();
  const { verified, isLoading: customerLoading, isError: customerError, refetch: refetchCustomer } = useCustomer();
  const { banks, isLoading: banksLoading } = useLinkedBanks(verified);
  const { accounts } = useActiveAccounts();

  const [bankId, setBankId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [rail, setRail] = useState<Rail>("ach");
  const [showErrors, setShowErrors] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const setAcct = useCallback((id: string) => setAccountId(id), []);
  useDefaultAccount(accountId, setAcct);

  const account = accounts.find((a) => a.id === accountId);
  const bank = banks.find((b) => b.id === bankId) ?? (banks.length === 1 && !bankId ? banks[0] : undefined);
  const available = account ? Number(account.balance) : undefined;
  const amountCheck = checkAmount(amount, { available });
  const errors = {
    bank: !bank ? "Choose a bank account" : undefined,
    account: !account ? "Choose an account to withdraw from" : undefined,
    amount: amountCheck.ok ? undefined : amountCheck.message,
  };
  const valid = !errors.bank && !errors.account && !errors.amount;
  const bankLabel = (b: Bank) => `${b.bankName} ····${b.last4}`;

  async function withdraw() {
    if (!bank || !account) return;
    const value = parseAmount(amount);
    let res: { transaction?: { id?: string }; sendAmount?: string; warning?: string } | null = null;
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 900));
      // Demo only: simulate the fee-inclusive debit the real API reports.
      res = { sendAmount: (value + (rail === "fedwire" ? 15 : 0.5)).toFixed(2) };
    } else {
      res = await postJson("/api/transactions", {
        amount: toApiAmount(amount),
        accountId: account.id,
        destinationId: bank.id,
        sourceAsset: "USDC",
        destinationAsset: "USD",
        destinationPaymentRail: rail,
        txType: "offramp",
      });
    }
    qc.invalidateQueries({ queryKey: ["transactions"] });
    qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
    setReviewing(false);
    setResult({
      amount: value,
      total: res?.sendAmount ? Number(res.sendAmount) : value,
      bank: bankLabel(bank),
      rail,
      transactionId: res?.transaction?.id ?? null,
      warning: res?.warning,
    });
  }

  function reset() {
    setResult(null);
    setAmount("");
    setShowErrors(false);
  }

  return (
    <FlowScreen
      title="Withdraw to your bank"
      subtitle="Move money out to a US bank account you've linked."
      back={{ href: "/app/move", label: "Move money" }}
      aside={
        result ? undefined : (
          <>
            <HelpCard title="ACH or wire?">
              <p>
                <span className="font-semibold text-forest">ACH</span> arrives in 1–3 business days.
              </p>
              <p>
                <span className="font-semibold text-forest">Wire</span> usually arrives the same business day, and is better for large amounts.
              </p>
            </HelpCard>
            <HelpCard title="Fees">
              <p>Our payment partner sets the fee when the withdrawal is created. Your receipt shows exactly what was charged.</p>
            </HelpCard>
          </>
        )
      }
    >
      {customerLoading ? (
        <LoadingRows rows={3} />
      ) : customerError ? (
        <ErrorState onRetry={() => refetchCustomer()} />
      ) : !verified ? (
        <EmptyState
          icon="protection"
          title="Verify your identity to withdraw"
          body="We need to verify you before money can leave your account."
          action={
            <ButtonLink href="/app/onboarding" arrow>
              Verify now
            </ButtonLink>
          }
        />
      ) : result ? (
        <>
          <SuccessState
            title={result.warning ? "Withdrawal processing" : "Withdrawal on its way"}
            amount={formatUsd(result.amount)}
            body={`Arrives at ${result.bank} in ${RAIL[result.rail].arrives.toLowerCase()}.`}
            rows={[
              { label: "To", value: result.bank },
              { label: "Method", value: `${RAIL[result.rail].label} · ${RAIL[result.rail].arrives}` },
              { label: "Fee", value: result.total > result.amount ? formatUsd(result.total - result.amount) : "No fee" },
              { label: "Total taken from your account", value: formatUsd(result.total), strong: true },
            ]}
            actions={
              <>
                <ButtonLink href={result.transactionId ? `/app/activity/${result.transactionId}` : "/app"} block>
                  {result.transactionId ? "Track it" : "Done"}
                </ButtonLink>
                <Button variant="secondary" block onClick={reset}>
                  New withdrawal
                </Button>
              </>
            }
          />
          {result.warning && (
            <Notice tone="warning" title="Confirmation is pending" className="mx-auto max-w-[420px]">
              {result.warning} Don&apos;t send it again. Check its status before doing anything else.
            </Notice>
          )}
        </>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setShowErrors(true);
            if (valid) setReviewing(true);
          }}
          className="space-y-6"
        >
          {!banksLoading && banks.length === 0 ? (
            <div className="rounded-[16px] bg-[#f3f5f4] px-5 py-6 text-center">
              <div className="flex justify-center">
                <GlyphBadge name="reserve" />
              </div>
              <p className="mt-3 text-[15px] font-semibold text-forest">Link a bank account first</p>
              <p className="mx-auto mt-1 max-w-[34ch] text-[13.5px] text-forest/60">Add the US bank account you want to withdraw to. It must be in your name.</p>
              <Button size="sm" className="mt-4" onClick={() => setLinkOpen(true)}>
                Link a bank account
              </Button>
            </div>
          ) : (
            <Picker
              label="To"
              sheetTitle="Withdraw to"
              options={banks.map((b) => ({
                id: b.id,
                title: b.bankName,
                subtitle: `${b.accountType ? `${b.accountType[0].toUpperCase()}${b.accountType.slice(1)} ` : ""}····${b.last4}`,
                leading: <GlyphBadge name="reserve" />,
              }))}
              value={bank?.id}
              onChange={setBankId}
              placeholder="Choose a bank account"
              loading={banksLoading}
              error={showErrors ? errors.bank : undefined}
              footer={
                <button
                  type="button"
                  onClick={() => setLinkOpen(true)}
                  className="px-2 text-[14px] font-semibold text-turquoise-700 hover:text-forest"
                >
                  + Link another bank account
                </button>
              }
            />
          )}

          <AccountPicker label="From" value={accountId} onChange={setAccountId} error={showErrors ? errors.account : undefined} />

          <AmountInput
            value={amount}
            onChange={setAmount}
            available={available}
            presets={[100, 500, 1000, 5000]}
            error={showErrors ? errors.amount : undefined}
          />

          <Segmented<Rail>
            label="Speed"
            value={rail}
            onChange={setRail}
            options={[
              { value: "ach", label: "ACH · 1–3 days" },
              { value: "fedwire", label: "Wire · same day" },
            ]}
          />

          <Button type="submit" block arrow size="lg">
            Review
          </Button>
        </form>
      )}

      {bank && account && (
        <ReviewSheet
          open={reviewing}
          onOpenChange={setReviewing}
          title="Review withdrawal"
          amount={parseAmount(amount)}
          caption={<>to {bankLabel(bank)}</>}
          rows={[
            { label: "To", value: bankLabel(bank) },
            { label: "From", value: `${accountName(account)} · ${formatUsd(Number(account.balance))}` },
            { label: "Method", value: `${RAIL[rail].label} · ${RAIL[rail].arrives}` },
          ]}
          fee={{ kind: "at-creation" }}
          confirmLabel={`Withdraw ${formatUsd(parseAmount(amount))}`}
          onConfirm={withdraw}
        />
      )}

      <LinkBankDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        onLinked={(id) => {
          setBankId(id);
          setLinkOpen(false);
        }}
      />
    </FlowScreen>
  );
}

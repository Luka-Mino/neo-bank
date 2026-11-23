"use client";

// Send money (P2P) — /app version of (dashboard)/send.
// Same API as before: POST /api/transactions { txType: "send", USDC → USDC }.
// The server enforces KYC, verified email, 2FA enabled, account + recipient
// ownership, balance incl. fees; this screen mirrors those checks for a
// friendlier path but never relies on them.

import { useCallback, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { FlowScreen, HelpCard } from "@/components/app/flow-screen";
import { AmountInput } from "@/components/app/amount-input";
import { AccountPicker, accountName, useActiveAccounts, useDefaultAccount } from "@/components/app/account-picker";
import { Avatar, Picker } from "@/components/app/picker";
import { ReviewSheet } from "@/components/app/review-sheet";
import { EmptyState, ErrorState, LoadingRows, Notice, SuccessState } from "@/components/app/states";
import { postJson } from "@/components/app/api";
import { useCustomer, useRecipients } from "@/components/app/data";
import { Button, ButtonLink, TextLink } from "@/components/brand/button";
import { checkAmount, formatUsd, parseAmount, toApiAmount } from "@/lib/money-input";
import { queryKeys } from "@/lib/queries";
import { DEMO_MODE } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type Sent = { amount: number; fee: number | null; to: string; from: string; warning?: string };

export function SendFlow({ fromId, toId }: { fromId: string | null; toId: string | null }) {
  const qc = useQueryClient();
  const { verified, isLoading: customerLoading, isError: customerError, refetch: refetchCustomer } = useCustomer();
  const { recipients, isLoading: recipientsLoading } = useRecipients(verified);
  const { accounts } = useActiveAccounts();

  const [recipientId, setRecipientId] = useState(toId ?? "");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);

  const stableSetAccount = useCallback((id: string) => setAccountId(id), []);
  useDefaultAccount(accountId, stableSetAccount, { preferId: fromId });

  const account = accounts.find((a) => a.id === accountId);
  const recipient = recipients.find((r) => r.dakotaRecipientId === recipientId);
  const available = account ? Number(account.balance) : undefined;
  const amountCheck = checkAmount(amount, { available });

  const errors = {
    recipient: !recipient ? "Choose who to pay" : undefined,
    account: !account ? "Choose an account to pay from" : undefined,
    amount: amountCheck.ok ? undefined : amountCheck.message,
  };
  const valid = !errors.recipient && !errors.account && !errors.amount;

  async function send() {
    if (!recipient || !account) return;
    const value = parseAmount(amount);
    let fee: number | null = null;
    let warning: string | undefined;
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 900));
    } else {
      const res = await postJson<{ sendAmount?: string; warning?: string }>("/api/transactions", {
        amount: toApiAmount(amount),
        destinationId: recipient.dakotaRecipientId,
        accountId: account.id,
        sourceAsset: "USDC",
        destinationAsset: "USDC",
        txType: "send",
      });
      if (res?.sendAmount) fee = Math.max(0, Number(res.sendAmount) - value);
      warning = res?.warning;
    }
    qc.invalidateQueries({ queryKey: ["transactions"] });
    qc.invalidateQueries({ queryKey: queryKeys.accounts.all });
    setReviewing(false);
    setSent({ amount: value, fee, to: recipient.name, from: accountName(account), warning });
  }

  function reset() {
    setSent(null);
    setAmount("");
    setShowErrors(false);
  }

  const aside = (
    <>
      <HelpCard title="How sending works">
        <p>Money arrives in seconds, any day of the week. It moves as USDC, a digital dollar, so there are no cut-off times.</p>
        <p>You can only send to people you&apos;ve saved as recipients. That stops a mistyped address from losing your money.</p>
      </HelpCard>
      <HelpCard title="Before you confirm">
        <p>Check the name and amount. Once a payment is sent it can&apos;t be pulled back.</p>
      </HelpCard>
    </>
  );

  return (
    <FlowScreen
      title="Send money"
      subtitle="Pay someone you've saved, in seconds."
      back={{ href: "/app/move", label: "Move money" }}
      aside={sent ? undefined : aside}
    >
      {customerLoading ? (
        <LoadingRows rows={3} />
      ) : customerError ? (
        <ErrorState onRetry={() => refetchCustomer()} />
      ) : !verified ? (
        <EmptyState
          icon="protection"
          title="Verify your identity to send money"
          body="It takes a few minutes. We need it before any money can leave your account."
          action={
            <ButtonLink href="/app/onboarding" arrow>
              Verify now
            </ButtonLink>
          }
        />
      ) : sent ? (
        <>
        <SuccessState
          title={sent.warning ? "Payment processing" : "Money sent"}
          amount={formatUsd(sent.amount)}
          body={sent.warning ? `We're confirming your payment to ${sent.to}.` : `${sent.to} will see it in seconds.`}
          rows={[
            { label: "To", value: sent.to },
            { label: "From", value: sent.from },
            {
              label: "Fee",
              value: sent.fee === null ? "Shown in Activity" : sent.fee === 0 ? "No fee" : formatUsd(sent.fee),
            },
          ]}
          actions={
            <>
              <ButtonLink href="/app" block>
                Done
              </ButtonLink>
              <Button variant="secondary" block onClick={reset}>
                Send more
              </Button>
            </>
          }
        />
        {sent.warning && (
          <Notice tone="warning" title="Confirmation is pending" className="mx-auto max-w-[420px]">
            {sent.warning} Don&apos;t send it again. Check Activity first.
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
          <RecentRecipients
            recipients={recipients.slice(0, 6)}
            selected={recipientId}
            onSelect={setRecipientId}
            loading={recipientsLoading}
          />

          <Picker
            label="To"
            sheetTitle="Who are you paying?"
            options={recipients.map((r) => ({ id: r.dakotaRecipientId, title: r.name, subtitle: "Arrives in seconds" }))}
            value={recipientId}
            onChange={setRecipientId}
            placeholder="Choose a recipient"
            loading={recipientsLoading}
            error={showErrors ? errors.recipient : undefined}
            empty={
              <>
                You haven&apos;t saved anyone yet.
                <div className="mt-3">
                  <TextLink href="/recipients/new">Add a recipient</TextLink>
                </div>
              </>
            }
            footer={<TextLink href="/recipients/new" className="px-2 text-[14px]">Add someone new</TextLink>}
          />

          <AccountPicker
            label="From"
            value={accountId}
            onChange={setAccountId}
            error={showErrors ? errors.account : undefined}
          />

          <AmountInput
            value={amount}
            onChange={setAmount}
            available={available}
            presets={[25, 50, 100, 250]}
            error={showErrors ? errors.amount : undefined}
          />

          <div className="space-y-4 pt-1">
            <Button type="submit" block arrow size="lg">
              Review
            </Button>
            <p className="text-center text-[13px] text-forest/55">
              Paying your own bank account?{" "}
              <Link href="/app/move/withdraw" className="font-semibold text-turquoise-700 hover:text-forest">
                Withdraw instead
              </Link>
            </p>
          </div>
        </form>
      )}

      {recipient && account && (
        <ReviewSheet
          open={reviewing}
          onOpenChange={setReviewing}
          title="Review and send"
          amount={parseAmount(amount)}
          caption={<>to {recipient.name}</>}
          rows={[
            { label: "To", value: recipient.name },
            { label: "From", value: `${accountName(account)} · ${formatUsd(Number(account.balance))}` },
            { label: "Arrives", value: "In seconds" },
          ]}
          fee={{ kind: "at-creation" }}
          confirmLabel={`Send ${formatUsd(parseAmount(amount))}`}
          onConfirm={send}
        />
      )}
    </FlowScreen>
  );
}

function RecentRecipients({
  recipients,
  selected,
  onSelect,
  loading,
}: {
  recipients: { id: string; name: string; dakotaRecipientId: string }[];
  selected: string;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  if (loading || recipients.length === 0) return null;
  return (
    <div>
      <div className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-forest/55">Recent</div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {recipients.map((r) => {
          const active = r.dakotaRecipientId === selected;
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(r.dakotaRecipientId)}
              className="flex w-16 shrink-0 flex-col items-center gap-1.5 rounded-[12px] py-1 outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]"
            >
              <span className={cn("rounded-full ring-2 ring-offset-2 transition", active ? "ring-turquoise" : "ring-transparent")}>
                <Avatar name={r.name} tone={active ? "forest" : "mint"} />
              </span>
              <span className={cn("w-full truncate text-center text-[12px]", active ? "font-semibold text-forest" : "text-forest/60")}>
                {r.name.split(" ")[0]}
              </span>
            </button>
          );
        })}
        <Link
          href="/recipients/new"
          className="flex w-16 shrink-0 flex-col items-center gap-1.5 rounded-[12px] py-1 outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-dashed border-forest/25 text-forest/55">
            <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
              <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-[12px] text-forest/60">New</span>
        </Link>
      </div>
    </div>
  );
}

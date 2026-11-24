"use client";

// Help & support (LAUNCH-READINESS-PLAN 1c.3). Support is ours under Dakota's
// model; card disputes come to us first and we report them to Dakota.
// POST /api/support saves the request and returns a reference; GET lists the
// caller's own requests.

import { useId, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlowScreen, HelpCard } from "@/components/app/flow-screen";
import { TextField } from "@/components/app/fields";
import { ApiError, postJson } from "@/components/app/api";
import { EmptyState, ErrorState, LoadingRows, Notice, SuccessState } from "@/components/app/states";
import { Button } from "@/components/brand/button";
import { DEMO_MODE } from "@/lib/demo-data";
import type { SupportCategory, SupportStatus } from "@/lib/support";
import { cn } from "@/lib/utils";

const CATEGORIES: { value: SupportCategory; label: string; hint: string }[] = [
  { value: "question", label: "A question", hint: "How something works, or help with your account" },
  { value: "complaint", label: "A complaint", hint: "Something went wrong and you're not happy with it" },
  { value: "card_dispute", label: "A card payment I don't recognise", hint: "Or one charged wrongly, or never delivered" },
  { value: "fraud", label: "Fraud or someone else using my account", hint: "We'll treat this as urgent" },
];

const STATUS: Record<SupportStatus, { label: string; tone: string }> = {
  open: { label: "Received", tone: "bg-[#eef3f2] text-forest" },
  in_progress: { label: "In progress", tone: "bg-[#fff7e6] text-[#6b4a00]" },
  forwarded: { label: "With our partner", tone: "bg-[#fff7e6] text-[#6b4a00]" },
  resolved: { label: "Resolved", tone: "bg-turquoise-50 text-forest" },
};

type SupportRow = {
  id: string;
  reference: string;
  category: SupportCategory;
  subject: string;
  status: SupportStatus;
  createdAt: string;
};

const LABEL = "mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-forest/55";

export function SupportFlow({ transactionId }: { transactionId: string | null }) {
  const qc = useQueryClient();
  const messageId = useId();
  const [category, setCategory] = useState<SupportCategory>(transactionId ? "complaint" : "question");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ subject?: string; message?: string }>({});
  const [sent, setSent] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["support-requests"],
    queryFn: async () => {
      const r = await fetch("/api/support");
      if (!r.ok) throw new Error("support");
      return ((await r.json())?.data?.data ?? []) as SupportRow[];
    },
    enabled: !DEMO_MODE,
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 500));
        return { reference: "SUP-DEMO42" };
      }
      return postJson<{ reference: string }>("/api/support", {
        category,
        subject: subject.trim(),
        message: message.trim(),
        ...(transactionId ? { transactionId } : {}),
      });
    },
    onSuccess: (r) => {
      setSent(r.reference);
      setSubject("");
      setMessage("");
      qc.invalidateQueries({ queryKey: ["support-requests"] });
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof fieldErrors = {};
    if (subject.trim().length < 3) errs.subject = "Add a short subject";
    if (message.trim().length < 10) errs.message = "Tell us a little more so we can help";
    setFieldErrors(errs);
    if (Object.keys(errs).length === 0) submit.mutate();
  }

  const aside = (
    <>
      {category === "fraud" && (
        <Notice tone="warning" title="If someone may have your password">
          Change it now and turn on two-step sign-in in{" "}
          <Link href="/app/more/settings" className="font-semibold underline underline-offset-2">
            Settings
          </Link>
          . Then send this form so we can check your recent payments.
        </Notice>
      )}
      <HelpCard title="What happens next">
        <p>You&apos;ll get a reference straight away. We reply by email, and you can see the status of every request below.</p>
        <p>
          Some services, like card payments, are provided by Dakota and its partners. When a request needs them, we pass it on
          and tell you.
        </p>
      </HelpCard>
    </>
  );

  if (sent) {
    return (
      <FlowScreen title="Help & support" back={{ href: "/app/more", label: "More" }}>
        <SuccessState
          title="We've got your request"
          body={`Your reference is ${sent}. We'll reply by email, and you can follow it here.`}
          actions={
            <Button block variant="secondary" onClick={() => setSent(null)}>
              Back to Help &amp; support
            </Button>
          }
        />
      </FlowScreen>
    );
  }

  const error = submit.error;
  return (
    <FlowScreen
      title="Help & support"
      subtitle="Ask a question, raise a complaint or report a problem."
      back={{ href: "/app/more", label: "More" }}
      aside={aside}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <fieldset>
          <legend className={LABEL}>What is it about?</legend>
          <div role="radiogroup" className="space-y-2">
            {CATEGORIES.map((c) => {
              const on = c.value === category;
              return (
                <button
                  key={c.value}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-[14px] px-3.5 py-3 text-left ring-1 transition outline-none focus-visible:ring-2 focus-visible:ring-turquoise",
                    on ? "bg-turquoise-50 ring-turquoise/50" : "bg-white ring-forest/12 hover:ring-forest/30"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full ring-2",
                      on ? "ring-turquoise-700" : "ring-forest/25"
                    )}
                  >
                    {on && <span className="h-2 w-2 rounded-full bg-turquoise-700" />}
                  </span>
                  <span>
                    <span className="block text-[14.5px] font-semibold text-forest">{c.label}</span>
                    <span className="block text-[13px] text-forest/55">{c.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {transactionId && (
          <Notice tone="info">This request will be linked to the payment you came from.</Notice>
        )}

        <TextField
          label="Subject"
          value={subject}
          maxLength={120}
          onChange={(e) => setSubject(e.target.value)}
          error={fieldErrors.subject}
          placeholder="e.g. Withdrawal hasn't arrived"
        />

        <div>
          <label htmlFor={messageId} className={LABEL}>
            Message
          </label>
          <textarea
            id={messageId}
            value={message}
            maxLength={5000}
            rows={6}
            onChange={(e) => setMessage(e.target.value)}
            aria-invalid={fieldErrors.message ? true : undefined}
            aria-describedby={fieldErrors.message ? `${messageId}-err` : undefined}
            placeholder="What happened, when, and the amount if it's about a payment. Never include your password or full card number."
            className={cn(
              "w-full rounded-[14px] bg-white px-3.5 py-3 text-[15px] text-forest ring-1 transition placeholder:text-forest/35",
              "outline-none focus-visible:ring-2 focus-visible:ring-turquoise",
              fieldErrors.message ? "ring-[#c4363b]/50" : "ring-forest/12 hover:ring-forest/30"
            )}
          />
          {fieldErrors.message && (
            <p id={`${messageId}-err`} role="alert" className="mt-1.5 text-[13px] font-medium text-[#b42f34]">
              {fieldErrors.message}
            </p>
          )}
        </div>

        {error && (
          <Notice tone="error">
            {error instanceof ApiError ? error.message : "We couldn't send that. Please try again."}
          </Notice>
        )}

        <Button type="submit" block loading={submit.isPending}>
          Send request
        </Button>
      </form>

      <section className="mt-8 border-t border-forest/[0.07] pt-6">
        <h2 className="text-[15px] font-semibold text-forest">Your requests</h2>
        <div className="mt-3">
          {DEMO_MODE ? (
            <EmptyState icon="support" title="No requests yet" body="Requests you send will appear here with their status." />
          ) : list.isLoading ? (
            <LoadingRows rows={2} label="Loading your requests" />
          ) : list.isError ? (
            <ErrorState onRetry={() => list.refetch()} />
          ) : (list.data ?? []).length === 0 ? (
            <EmptyState icon="support" title="No requests yet" body="Requests you send will appear here with their status." />
          ) : (
            <ul className="divide-y divide-forest/[0.06]">
              {list.data!.map((r) => {
                const s = STATUS[r.status] ?? STATUS.open;
                return (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14.5px] font-semibold text-forest">{r.subject}</p>
                      <p className="mt-0.5 text-[12.5px] text-forest/50">
                        <span className="font-mono">{r.reference}</span> ·{" "}
                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold", s.tone)}>{s.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </FlowScreen>
  );
}

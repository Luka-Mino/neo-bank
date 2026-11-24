"use client";

// Team — /app version of (dashboard)/team (Team access, D4).
// Same APIs and Stage-0 rules: GET /api/orgs/members, POST
// /api/orgs/invitations { email, role, canMoveMoney, canApprove, canExport }.
// Role and money authority are separate (TEAM-RBAC-PLAN.md presets). Invite
// emails aren't sent yet, so we never claim one was.
//
// Fix vs the old screen: it read `data.data` from fetchApi (whose result is
// the whole JSON body), so in real mode it got an object instead of the list.

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { APP_CONTAINER } from "@/components/app/app-shell";
import { AppSheet } from "@/components/app/sheet";
import { Avatar } from "@/components/app/picker";
import { TextField } from "@/components/app/fields";
import { EmptyState, ErrorState, LoadingRows, Notice } from "@/components/app/states";
import { postJson } from "@/components/app/api";
import { Button } from "@/components/brand/button";
import { DEMO_MODE, DEMO_TEAM } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type Member = {
  id: string;
  name: string | null;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  canApprove: boolean;
  canMoveMoney: boolean;
  canExport: boolean;
  status: string;
};

const PRESETS = [
  { key: "admin", label: "Admin", desc: "Full access, and can manage the team", role: "admin", canMoveMoney: true, canApprove: false, canExport: true },
  { key: "initiator", label: "Initiator", desc: "Can move money, with approval over your limits", role: "member", canMoveMoney: true, canApprove: false, canExport: false },
  { key: "accountant", label: "Accountant", desc: "Sees everything and exports, can't move money", role: "member", canMoveMoney: false, canApprove: false, canExport: true },
  { key: "approver", label: "Approver", desc: "Reviews and approves payments", role: "member", canMoveMoney: false, canApprove: true, canExport: false },
  { key: "viewer", label: "Viewer", desc: "Read-only", role: "viewer", canMoveMoney: false, canApprove: false, canExport: false },
] as const;

function Cap({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ring-1",
        on ? "bg-turquoise-50 text-turquoise-700 ring-turquoise/30" : "text-forest/35 ring-forest/10"
      )}
    >
      {on ? "✓" : "–"} {label}
      <span className="sr-only">{on ? "allowed" : "not allowed"}</span>
    </span>
  );
}

export default function TeamPage() {
  const qc = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [demoInvited, setDemoInvited] = useState<Member[]>([]);
  const q = useQuery({
    queryKey: ["org-members"],
    queryFn: async () => {
      const r = await fetch("/api/orgs/members");
      if (!r.ok) throw new Error("members");
      return ((await r.json())?.data?.data ?? []) as Member[];
    },
    enabled: !DEMO_MODE,
  });
  const members = DEMO_MODE ? [...(DEMO_TEAM as Member[]), ...demoInvited] : q.data ?? [];

  return (
    <div className="pb-10 lg:pb-16">
      <header className="app-band text-white">
        <div className={cn(APP_CONTAINER, "px-5 pb-6 pt-[max(1.1rem,env(safe-area-inset-top))] lg:pb-10 lg:pt-8")}>
          <Link href="/app/more" className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-[13.5px] font-medium text-white/70 hover:text-white">
            <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden>
              <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            More
          </Link>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] lg:text-[32px]">Team</h1>
              <p className="mt-1 max-w-[60ch] text-[14px] text-white/65">
                Choose exactly what each person can do. An accountant can see everything without being able to move a cent.
              </p>
            </div>
            <Button variant="on-dark" size="sm" className="shrink-0" onClick={() => setInviteOpen(true)}>
              Invite
            </Button>
          </div>
        </div>
      </header>

      <div className={cn(APP_CONTAINER, "mt-5 lg:mt-8")}>
        <div className="mx-4 overflow-hidden rounded-[18px] bg-white shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)] lg:mx-0 lg:max-w-[880px]">
          {q.isLoading && !DEMO_MODE ? (
            <LoadingRows rows={4} label="Loading team" />
          ) : q.isError && !DEMO_MODE ? (
            <ErrorState onRetry={() => q.refetch()} />
          ) : members.length === 0 ? (
            <EmptyState icon="accounts" title="Just you so far" body="Invite teammates and decide what each can do." />
          ) : (
            <ul className="divide-y divide-forest/[0.06]">
              {members.map((m) => (
                <li key={m.id} className="flex flex-col gap-2.5 px-4 py-3.5 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={m.name ?? m.email} tone={m.role === "owner" ? "forest" : "mint"} />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-[15px] font-semibold text-forest">
                        {m.name ?? m.email}
                        {m.status === "invited" && (
                          <span className="rounded-full bg-[#fff7e6] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-[#8a5a00]">Invited</span>
                        )}
                      </p>
                      <p className="truncate text-[12.5px] text-forest/65">
                        {m.email} · <span className="capitalize">{m.role}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-[52px] sm:pl-0">
                    <Cap on={m.canMoveMoney} label="Move money" />
                    <Cap on={m.canApprove} label="Approve" />
                    <Cap on={m.canExport} label="Export" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <InviteSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={(m) => {
          if (DEMO_MODE && m) setDemoInvited((d) => [...d, m]);
          qc.invalidateQueries({ queryKey: ["org-members"] });
        }}
      />
    </div>
  );
}

function InviteSheet({ open, onOpenChange, onInvited }: { open: boolean; onOpenChange: (o: boolean) => void; onInvited: (m?: Member) => void }) {
  const [email, setEmail] = useState("");
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>(PRESETS[1]);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const invite = useMutation({
    mutationFn: async () => {
      const body = { email: email.trim(), role: preset.role, canMoveMoney: preset.canMoveMoney, canApprove: preset.canApprove, canExport: preset.canExport };
      if (DEMO_MODE) return;
      await postJson("/api/orgs/invitations", body);
    },
    onMutate: () => setError(null),
    onSuccess: () => {
      onInvited(
        DEMO_MODE
          ? { id: `inv-${Date.now()}`, name: null, email: email.trim(), role: preset.role, canApprove: preset.canApprove, canMoveMoney: preset.canMoveMoney, canExport: preset.canExport, status: "invited" }
          : undefined
      );
      setCreated(email.trim());
      setEmail("");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "We couldn't create that invite."),
  });

  return (
    <AppSheet
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setCreated(null);
          setError(null);
        }
        onOpenChange(o);
      }}
      title="Invite a teammate"
      description="They get exactly the access you choose."
      busy={invite.isPending}
      footer={
        created ? (
          <Button block onClick={() => onOpenChange(false)}>
            Done
          </Button>
        ) : (
          <Button block loading={invite.isPending} disabled={!validEmail} onClick={() => invite.mutate()}>
            Create invite
          </Button>
        )
      }
    >
      {created ? (
        <Notice tone="success" title={`Invite created for ${created}`}>
          They&apos;ll show as invited on your team. Invite emails aren&apos;t sent automatically yet, so let them know to sign up with this address.
        </Notice>
      ) : (
        <div className="space-y-5">
          <TextField label="Email" type="email" autoComplete="off" placeholder="teammate@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div>
            <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-forest/65">Access</div>
            <div role="radiogroup" aria-label="Access" className="space-y-2">
              {PRESETS.map((p) => {
                const on = preset.key === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setPreset(p)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-[12px] px-3.5 py-3 text-left ring-1 transition outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]",
                      on ? "bg-turquoise-50/70 ring-turquoise/50" : "ring-forest/12 hover:ring-forest/30"
                    )}
                  >
                    <span>
                      <span className="block text-[14.5px] font-semibold text-forest">{p.label}</span>
                      <span className="block text-[12.5px] text-forest/65">{p.desc}</span>
                    </span>
                    <span className={cn("h-4 w-4 shrink-0 rounded-full ring-2", on ? "bg-forest ring-forest" : "ring-forest/25")} aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
          {error && <Notice tone="error">{error}</Notice>}
        </div>
      )}
    </AppSheet>
  );
}

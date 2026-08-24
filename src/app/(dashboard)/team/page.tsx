"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  UserPlus,
  ShieldCheck,
  Banknote,
  Download,
  MoreHorizontal,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { fetchApi } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { DEMO_MODE, DEMO_TEAM } from "@/lib/demo-data";

type Member = {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  role: "owner" | "admin" | "member" | "viewer";
  canApprove: boolean;
  canMoveMoney: boolean;
  canExport: boolean;
  status: string;
};

const ROLE_STYLE: Record<string, string> = {
  owner: "bg-[#4ac280]/15 text-[#2f8f5c] ring-[#4ac280]/30",
  admin: "bg-[#2f80ed]/12 text-[#2f80ed] ring-[#2f80ed]/25",
  member: "bg-muted text-foreground/70 ring-border",
  viewer: "bg-muted text-muted-foreground ring-border",
};

// Named presets → (role + capability) tuples. See TEAM-RBAC-PLAN.md.
const PRESETS = [
  { key: "admin", label: "Admin", desc: "Full access; manage the team", role: "admin", canMoveMoney: true, canApprove: false, canExport: true },
  { key: "initiator", label: "Initiator", desc: "Can move money, needs approval", role: "member", canMoveMoney: true, canApprove: false, canExport: false },
  { key: "accountant", label: "Accountant", desc: "Sees everything, exports — can't move money", role: "member", canMoveMoney: false, canApprove: false, canExport: true },
  { key: "approver", label: "Approver", desc: "Reviews & approves payments", role: "member", canMoveMoney: false, canApprove: true, canExport: false },
  { key: "viewer", label: "Viewer", desc: "Read-only", role: "viewer", canMoveMoney: false, canApprove: false, canExport: false },
] as const;

function CapChip({ on, icon: Icon, label }: { on: boolean; icon: typeof Banknote; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1",
        on ? "bg-[#4ac280]/10 text-[#2f8f5c] ring-[#4ac280]/25" : "text-muted-foreground/50 ring-border"
      )}
      title={on ? `Can ${label.toLowerCase()}` : `Cannot ${label.toLowerCase()}`}
    >
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

export default function TeamPage() {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["org-members"],
    queryFn: () => fetchApi<{ data: Member[] }>("/api/orgs/members"),
    enabled: !DEMO_MODE,
  });
  const members: Member[] = DEMO_MODE ? (DEMO_TEAM as Member[]) : data?.data ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Team</h1>
          <p className="mt-1 text-muted-foreground">
            Invite teammates and control exactly what each can do — role and money
            authority are separate, so an accountant can see everything without
            being able to move a cent.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="shrink-0">
          <UserPlus className="mr-2 h-4 w-4" /> Invite member
        </Button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[1.6fr_1fr_1.4fr_auto] items-center gap-3 border-b border-border px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Member</span>
          <span>Role</span>
          <span>Capabilities</span>
          <span className="sr-only">Actions</span>
        </div>

        {isLoading && !DEMO_MODE ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading team…
          </div>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[1.6fr_1fr_1.4fr_auto] items-center gap-3 border-b border-border px-5 py-4 last:border-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {(m.name ?? m.email).slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{m.name ?? m.email}</span>
                    {m.status === "invited" && (
                      <span className="rounded-full bg-amber-500/12 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-500">
                        Invited
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{m.email}</div>
                </div>
              </div>

              <div>
                <Badge
                  variant="secondary"
                  className={cn("capitalize ring-1", ROLE_STYLE[m.role])}
                >
                  {m.role}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <CapChip on={m.canMoveMoney} icon={Banknote} label="Money" />
                <CapChip on={m.canApprove} icon={ShieldCheck} label="Approve" />
                <CapChip on={m.canExport} icon={Download} label="Export" />
              </div>

              <button
                className="rounded-lg p-1.5 text-muted-foreground/60 hover:bg-muted hover:text-foreground disabled:opacity-40"
                disabled={m.role === "owner"}
                title={m.role === "owner" ? "Owners can't be edited here" : "Manage member"}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={() => queryClient.invalidateQueries({ queryKey: ["org-members"] })}
      />
    </div>
  );
}

function InviteDialog({
  open,
  onOpenChange,
  onInvited,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onInvited: () => void;
}) {
  const [email, setEmail] = useState("");
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>(PRESETS[1]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (DEMO_MODE) return { inviteToken: "demo-token" };
      return fetchApi<{ inviteToken: string }>("/api/orgs/invitations", {
        method: "POST",
        body: JSON.stringify({
          email,
          role: preset.role,
          canMoveMoney: preset.canMoveMoney,
          canApprove: preset.canApprove,
          canExport: preset.canExport,
        }),
      });
    },
    onSuccess: () => {
      // Email delivery isn't wired yet — don't claim an email was sent. The
      // invite record exists; sharing the accept link is a follow-up.
      toast.success(
        DEMO_MODE ? "Invite created (demo)" : `Invite created for ${email}`
      );
      setEmail("");
      onInvited();
      onOpenChange(false);
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Could not send invite"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            They&apos;ll get access with exactly the permissions you choose.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="teammate@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Access</Label>
            <div className="grid gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPreset(p)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2.5 text-left ring-1 transition",
                    preset.key === p.key
                      ? "bg-[#4ac280]/8 ring-[#4ac280]/40"
                      : "ring-border hover:ring-[#4ac280]/30"
                  )}
                >
                  <div>
                    <div className="text-sm font-medium">{p.label}</div>
                    <div className="text-xs text-muted-foreground">{p.desc}</div>
                  </div>
                  {preset.key === p.key && (
                    <Check className="h-4 w-4 shrink-0 text-[#2f8f5c]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !/^\S+@\S+\.\S+$/.test(email)}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

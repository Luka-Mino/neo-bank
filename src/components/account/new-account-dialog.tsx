"use client";

// NewAccountDialog — POSTs /api/accounts. The first account a user opens
// becomes primary automatically (handled server-side); we don't expose that
// here. Account-number is allocated server-side too.
//
// The dialog is controlled by NewAccountDialogProvider which mounts it once
// at the dashboard root.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchApi, queryKeys } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { Loader2, Wallet, PiggyBank } from "lucide-react";
import type { AccountRow } from "./use-accounts";
import { DEMO_MODE } from "@/lib/demo-data";

const formSchema = z.object({
  accountType: z.enum(["checking", "savings"]),
  nickname: z.string().trim().max(40).optional(),
});
type FormInput = z.infer<typeof formSchema>;

const accountTypes = [
  {
    value: "checking" as const,
    label: "Checking",
    description: "Day-to-day spending and bills",
    icon: Wallet,
  },
  {
    value: "savings" as const,
    label: "Savings",
    description: "Set funds aside, earn no fees",
    icon: PiggyBank,
  },
];

export function NewAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedType, setSelectedType] =
    useState<FormInput["accountType"]>("checking");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: { accountType: "checking", nickname: "" },
  });

  const createAccount = useMutation({
    mutationFn: async (input: FormInput) => {
      // In demo mode we don't hit the API — the displayed accounts are
      // demo data, so the new account would never appear after a real POST.
      // Instead we synthesize a row and prepend it to the cache below.
      if (DEMO_MODE) {
        const fake: AccountRow = {
          id: `acct-${Date.now()}`,
          accountType: input.accountType,
          nickname:
            input.nickname?.trim() ||
            (input.accountType === "savings" ? "Savings" : "Checking"),
          accountNumber: `40${Math.floor(Math.random() * 1e12)
            .toString()
            .padStart(12, "0")}`,
          currency: "USD",
          balance: "0.00",
          status: "active",
          isPrimary: false,
          createdAt: new Date().toISOString(),
        };
        return fake;
      }
      const res = await fetchApi<{ success: true; data: AccountRow }>(
        "/api/accounts",
        {
          method: "POST",
          body: JSON.stringify(input),
        }
      );
      return res.data;
    },
    onSuccess: (created) => {
      // Push into the cache so the dropdown updates immediately. In demo
      // mode we skip the invalidate — the demo queryFn would just re-return
      // the static list and clobber our setQueryData. In real mode the
      // invalidate refetches from the API and gets the canonical row.
      queryClient.setQueryData<AccountRow[]>(
        queryKeys.accounts.list,
        (old) => [...(old ?? []), created]
      );
      if (!DEMO_MODE) {
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      }
      toast.success(
        `Opened ${created.nickname || created.accountType} account`
      );
      // Switch the URL to scope to the new account.
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("account", created.id);
      router.replace(`${pathname}?${params.toString()}`);
      reset();
      onOpenChange(false);
    },
    onError: (e) => {
      const msg = e instanceof Error ? e.message : "Could not open account";
      toast.error(msg);
    },
  });

  function onSubmit(values: FormInput) {
    createAccount.mutate({ ...values, accountType: selectedType });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Open a new account</DialogTitle>
          <DialogDescription>
            Add another account to organize your money. Your underlying
            stablecoin wallet stays the same — balances are tracked per
            account.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Account type
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {accountTypes.map((t) => {
                const active = selectedType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setSelectedType(t.value)}
                    className={cn(
                      "flex items-start gap-2 rounded-lg border bg-card px-3 py-3 text-left transition",
                      active
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground/60"
                      )}
                    >
                      <t.icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {t.label}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {t.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nickname" className="text-xs uppercase tracking-wider text-muted-foreground">
              Nickname{" "}
              <span className="normal-case tracking-normal text-foreground/40">
                (optional)
              </span>
            </Label>
            <Input
              id="nickname"
              placeholder={
                selectedType === "savings" ? "e.g. Vacation fund" : "e.g. Bills"
              }
              maxLength={40}
              {...register("nickname")}
            />
            {errors.nickname && (
              <p className="text-xs text-destructive">
                {errors.nickname.message}
              </p>
            )}
          </div>

          <DialogFooter className="-mx-4 -mb-4 px-4 pb-4 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createAccount.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createAccount.isPending}>
              {createAccount.isPending && (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              )}
              Open account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

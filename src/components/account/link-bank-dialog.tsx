"use client";

// LinkBankDialog — links an external US bank account as a withdrawal
// destination. Two Dakota resources are created behind one form:
//   1. POST /api/recipients                 (holder name + postal address —
//      Dakota requires a recipient address for fiat payouts)
//   2. POST /api/recipients/{id}/destinations  (fiat_us details)
// On success the caller's destinations query is invalidated and the new
// destination is auto-selected.

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

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
import { fetchApi } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { Landmark, Loader2 } from "lucide-react";

const formSchema = z.object({
  // Dakota caps both at 35 chars for fiat_us destinations.
  accountHolderName: z.string().trim().min(1, "Required").max(35, "Max 35 characters"),
  bankName: z.string().trim().min(1, "Required").max(35, "Max 35 characters"),
  abaRoutingNumber: z.string().regex(/^\d{9}$/, "Must be exactly 9 digits"),
  accountNumber: z.string().trim().min(4, "Too short").max(17, "Too long"),
  accountType: z.enum(["checking", "savings"]),
  street1: z.string().trim().min(1, "Required").max(35, "Max 35 characters"),
  city: z.string().trim().min(1, "Required"),
  region: z.string().trim().min(2, "Required").max(2, "2-letter state"),
  postalCode: z.string().trim().min(5, "Required"),
});
type FormInput = z.infer<typeof formSchema>;

interface LinkedDestination {
  id: string;
  dakotaDestinationId: string;
}

export function LinkBankDialog({
  open,
  onOpenChange,
  onLinked,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinked?: (dakotaDestinationId: string) => void;
}) {
  const queryClient = useQueryClient();
  const [accountTypeValue, setAccountTypeValue] = useState<"checking" | "savings">(
    "checking"
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: { accountType: "checking" },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormInput) => {
      const recipientRes = await fetchApi<{ data: { id: string } }>(
        "/api/recipients",
        {
          method: "POST",
          body: JSON.stringify({
            name: data.accountHolderName,
            address: {
              street1: data.street1,
              city: data.city,
              region: data.region,
              postalCode: data.postalCode,
              country: "US",
            },
          }),
        }
      );
      const recipientId = recipientRes.data.id;

      const destinationRes = await fetchApi<{ data: LinkedDestination }>(
        `/api/recipients/${recipientId}/destinations`,
        {
          method: "POST",
          body: JSON.stringify({
            destinationType: "fiat_us",
            name: `${data.bankName} ${data.accountType} ··${data.accountNumber.slice(-4)}`,
            abaRoutingNumber: data.abaRoutingNumber,
            accountNumber: data.accountNumber,
            accountType: data.accountType,
            accountHolderName: data.accountHolderName,
            bankName: data.bankName,
            accountHolderAddress: {
              street1: data.street1,
              city: data.city,
              region: data.region,
              postalCode: data.postalCode,
              country: "US",
            },
            capabilities: ["ach", "fedwire"],
          }),
        }
      );
      return destinationRes.data;
    },
    onSuccess: (destination) => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      toast.success("Bank account linked");
      onLinked?.(destination.dakotaDestinationId);
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Could not link bank");
    },
  });

  const field = (
    id: keyof FormInput,
    label: string,
    props?: React.ComponentProps<typeof Input>
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} {...register(id)} />
      {errors[id] && (
        <p className="text-xs text-destructive">{errors[id]?.message}</p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-4 w-4" /> Link a bank account
          </DialogTitle>
          <DialogDescription>
            Withdrawals arrive by ACH or wire. Use an account held in your name.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-4"
        >
          {field("accountHolderName", "Account holder name", {
            placeholder: "Full legal name",
            maxLength: 35,
          })}
          {field("bankName", "Bank name", { placeholder: "e.g. Chase", maxLength: 35 })}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field("abaRoutingNumber", "Routing number", {
              inputMode: "numeric",
              maxLength: 9,
              placeholder: "9 digits",
            })}
            {field("accountNumber", "Account number", { inputMode: "numeric" })}
          </div>

          <div className="space-y-1.5">
            <Label>Account type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["checking", "savings"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setAccountTypeValue(t);
                    setValue("accountType", t, { shouldValidate: true });
                  }}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium capitalize ring-1 transition",
                    accountTypeValue === t
                      ? "bg-primary/10 text-primary ring-primary"
                      : "ring-border hover:ring-primary/40"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-xl bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Account holder address (required for bank payouts)
            </p>
            {field("street1", "Street", { maxLength: 35 })}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="col-span-2 sm:col-span-1">{field("city", "City")}</div>
              <div>{field("region", "State", { placeholder: "CA", maxLength: 2 })}</div>
              <div>{field("postalCode", "ZIP", { inputMode: "numeric" })}</div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Link account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

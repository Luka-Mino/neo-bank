"use client";

// Add your bank account — the customer's own account at another US bank,
// saved as a withdrawal destination (money comes back out of Moneta to it).
// Two Dakota resources are created behind one form:
//   1. POST /api/recipients                 (holder name + postal address —
//      Dakota requires a recipient address for fiat payouts)
//   2. POST /api/recipients/{id}/destinations  (fiat_us details)
// On success the caller's destinations query is invalidated and the new
// destination is auto-selected. /app sheet styling (plan D3).

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { AppSheet } from "@/components/app/sheet";
import { Segmented, TextField } from "@/components/app/fields";
import { Notice } from "@/components/app/states";
import { Button } from "@/components/brand/button";
import { fetchApi } from "@/lib/queries";

const formSchema = z.object({
  // Dakota caps both at 35 chars for fiat_us destinations.
  accountHolderName: z.string().trim().min(1, "Required").max(35, "Max 35 characters"),
  bankName: z.string().trim().min(1, "Required").max(35, "Max 35 characters"),
  abaRoutingNumber: z.string().regex(/^\d{9}$/, "Must be exactly 9 digits"),
  accountNumber: z.string().trim().min(4, "Too short").max(17, "Too long"),
  // The account's type AT THE OTHER BANK. US bank transfers (ACH) require it;
  // it says nothing about Moneta accounts, which have no type.
  accountType: z.enum(["checking", "savings"]),
  street1: z.string().trim().min(1, "Required").max(35, "Max 35 characters"),
  city: z.string().trim().min(1, "Required"),
  region: z.string().trim().length(2, "2-letter state"),
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
  const [externalType, setExternalType] = useState<"checking" | "savings">("checking");
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
      const recipientRes = await fetchApi<{ data: { id: string } }>("/api/recipients", {
        method: "POST",
        body: JSON.stringify({
          name: data.accountHolderName,
          address: {
            street1: data.street1,
            city: data.city,
            region: data.region.toUpperCase(),
            postalCode: data.postalCode,
            country: "US",
          },
        }),
      });
      const recipientId = recipientRes.data.id;
      const destinationRes = await fetchApi<{ data: LinkedDestination }>(
        `/api/recipients/${recipientId}/destinations`,
        {
          method: "POST",
          body: JSON.stringify({
            destinationType: "fiat_us",
            name: `${data.bankName} ··${data.accountNumber.slice(-4)}`,
            abaRoutingNumber: data.abaRoutingNumber,
            accountNumber: data.accountNumber,
            accountType: data.accountType,
            accountHolderName: data.accountHolderName,
            bankName: data.bankName,
            accountHolderAddress: {
              street1: data.street1,
              city: data.city,
              region: data.region.toUpperCase(),
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
      toast.success("Bank account added");
      onLinked?.(destination.dakotaDestinationId);
      reset();
      setExternalType("checking");
      onOpenChange(false);
    },
  });

  const submit = handleSubmit((data) => mutation.mutate(data));

  return (
    <AppSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add your bank account"
      description="Your account at another US bank, so you can withdraw to it. It must be in your name. Withdrawals arrive by ACH or wire."
      busy={mutation.isPending}
      footer={
        <Button block loading={mutation.isPending} onClick={() => void submit()}>
          Add bank account
        </Button>
      }
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="space-y-4"
      >
        <TextField
          label="Name on the account"
          placeholder="Your full legal name"
          maxLength={35}
          autoComplete="name"
          error={errors.accountHolderName?.message}
          {...register("accountHolderName")}
        />
        <TextField
          label="Bank"
          placeholder="e.g. Chase"
          maxLength={35}
          error={errors.bankName?.message}
          {...register("bankName")}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Routing number"
            placeholder="9 digits"
            inputMode="numeric"
            maxLength={9}
            error={errors.abaRoutingNumber?.message}
            {...register("abaRoutingNumber")}
          />
          <TextField
            label="Account number"
            inputMode="numeric"
            maxLength={17}
            error={errors.accountNumber?.message}
            {...register("accountNumber")}
          />
        </div>
        <Segmented<"checking" | "savings">
          label="Type of account at that bank"
          value={externalType}
          onChange={(t) => {
            setExternalType(t);
            setValue("accountType", t, { shouldValidate: true });
          }}
          options={[
            { value: "checking", label: "Checking" },
            { value: "savings", label: "Savings" },
          ]}
        />

        <fieldset className="space-y-4 rounded-[16px] bg-[#f3f5f4] p-4">
          <legend className="sr-only">Address on the account</legend>
          <p className="text-[13px] text-forest/65">Address on the account (banks require it for payouts)</p>
          <TextField label="Street" maxLength={35} autoComplete="address-line1" error={errors.street1?.message} {...register("street1")} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <TextField className="col-span-2 sm:col-span-1" label="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
            <TextField label="State" placeholder="CA" maxLength={2} autoComplete="address-level1" error={errors.region?.message} {...register("region")} />
            <TextField label="ZIP" inputMode="numeric" autoComplete="postal-code" error={errors.postalCode?.message} {...register("postalCode")} />
          </div>
        </fieldset>

        {mutation.isError && (
          <Notice tone="error">
            {mutation.error instanceof Error ? mutation.error.message : "We couldn't add that bank account."}
          </Notice>
        )}
      </form>
    </AppSheet>
  );
}

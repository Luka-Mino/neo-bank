"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Address is all-or-nothing: Dakota accepts crypto-only recipients without
// one, but bank (ACH/wire) payouts require it — so either leave every
// address field empty, or complete the set.
const recipientSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    street1: z.string().trim().max(35, "Max 35 characters").optional().or(z.literal("")),
    city: z.string().trim().optional().or(z.literal("")),
    region: z.string().trim().optional().or(z.literal("")),
    postalCode: z.string().trim().optional().or(z.literal("")),
    country: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/, "2-letter code, e.g. US")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((v, ctx) => {
    const filled = [v.street1, v.city, v.region, v.postalCode, v.country].filter(
      Boolean
    );
    if (filled.length > 0) {
      for (const [field, label] of [
        ["street1", "Street address"],
        ["city", "City"],
        ["region", "State/region"],
        ["postalCode", "Postal code"],
        ["country", "Country"],
      ] as const) {
        if (!v[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${label} is required to complete the address`,
          });
        }
      }
    }
  });

type RecipientInput = z.infer<typeof recipientSchema>;

export default function NewRecipientPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecipientInput>({
    resolver: zodResolver(recipientSchema),
  });

  async function onSubmit(data: RecipientInput) {
    try {
      const body: Record<string, unknown> = { name: data.name };
      if (data.street1) {
        body.address = {
          street1: data.street1,
          city: data.city,
          region: data.region,
          postalCode: data.postalCode,
          country: data.country,
        };
      }

      const res = await fetch("/api/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(
          payload.error?.message ||
            (typeof payload.error === "string" ? payload.error : null) ||
            "Could not add recipient"
        );
      }

      toast.success("Recipient added");
      router.push("/recipients");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add recipient");
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/recipients"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          aria-label="Back to recipients"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Add recipient
          </h1>
          <p className="text-muted-foreground">Someone you send money to</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recipient details</CardTitle>
          <CardDescription>
            The address is optional now, but bank transfers (ACH and wire)
            require it — you can also add it later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Recipient's legal name"
                maxLength={100}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-4 rounded-xl bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Postal address{" "}
                <span className="normal-case tracking-normal text-foreground/40">
                  (needed for bank payouts)
                </span>
              </p>
              <div className="space-y-2">
                <Label htmlFor="street1">Street address</Label>
                <Input
                  id="street1"
                  placeholder="123 Main St"
                  maxLength={35}
                  {...register("street1")}
                />
                {errors.street1 && (
                  <p className="text-sm text-destructive">{errors.street1.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="City" {...register("city")} />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">State/region</Label>
                  <Input id="region" placeholder="CA" {...register("region")} />
                  {errors.region && (
                    <p className="text-sm text-destructive">{errors.region.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal code</Label>
                  <Input
                    id="postalCode"
                    placeholder="94103"
                    {...register("postalCode")}
                  />
                  {errors.postalCode && (
                    <p className="text-sm text-destructive">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="US"
                    maxLength={2}
                    {...register("country")}
                  />
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" size="xl" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add recipient
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

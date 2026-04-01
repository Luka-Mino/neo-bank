"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const recipientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  street1: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
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
          postal_code: data.postalCode,
          country: data.country,
        };
      }

      const res = await fetch("/api/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create recipient");
      }

      toast.success("Recipient created");
      router.push("/recipients");
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/recipients"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Recipient</h1>
          <p className="text-muted-foreground">Create a new payment contact</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recipient Details</CardTitle>
          <CardDescription>Enter the recipient&apos;s information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Recipient name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="street1">Street Address</Label>
              <Input
                id="street1"
                placeholder="123 Main St"
                {...register("street1")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="City" {...register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">State/Region</Label>
                <Input id="region" placeholder="State" {...register("region")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="12345"
                  {...register("postalCode")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="US"
                  {...register("country")}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Recipient
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

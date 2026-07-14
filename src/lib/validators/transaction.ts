import { z } from "zod";

export const createTransactionSchema = z
  .object({
    // Which of the user's accounts the user-side leg debits/credits.
    // Required for new rows; legacy rows may still have null until backfilled.
    accountId: z.string().uuid("accountId is required"),
    amount: z
      .string()
      .min(1, "Amount is required")
      .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Amount must be positive"),
    // Omitted → server uses DAKOTA_NETWORK_ID; clients shouldn't pick chains.
    sourceNetworkId: z.string().min(1).optional(),
    sourceAsset: z.string().min(1, "Source asset is required"),
    destinationId: z.string().min(1, "Destination is required"),
    destinationAsset: z.string().min(1, "Destination asset is required"),
    destinationNetworkId: z.string().optional(),
    destinationPaymentRail: z.enum(["ach", "fedwire", "swift"]).optional(),
    paymentReference: z.string().max(140).optional(),
    txType: z.enum(["onramp", "offramp", "send", "swap"]).default("send"),
  })
  .strict()
  .superRefine((v, ctx) => {
    // Dakota's per-rail statement-reference constraints; ACH (the default
    // rail) is the strictest: ≤18 chars, letters/digits/spaces only.
    if (v.paymentReference && (v.destinationPaymentRail ?? "ach") === "ach") {
      if (v.paymentReference.length > 18) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["paymentReference"],
          message: "ACH references are limited to 18 characters",
        });
      }
      if (!/^[A-Za-z0-9 ]+$/.test(v.paymentReference)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["paymentReference"],
          message: "ACH references allow only letters, digits, and spaces",
        });
      }
    }
  });

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

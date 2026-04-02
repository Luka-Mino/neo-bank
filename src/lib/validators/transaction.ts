import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Amount must be positive"),
  sourceNetworkId: z.string().min(1, "Source network is required"),
  sourceAsset: z.string().min(1, "Source asset is required"),
  destinationId: z.string().min(1, "Destination is required"),
  destinationAsset: z.string().min(1, "Destination asset is required"),
  destinationNetworkId: z.string().optional(),
  destinationPaymentRail: z.enum(["ach", "fedwire", "swift"]).optional(),
  paymentReference: z.string().max(140).optional(),
  txType: z.enum(["onramp", "offramp", "send", "swap"]).default("send"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

import { z } from "zod";

export const internalTransferSchema = z
  .object({
    fromAccountId: z.string().uuid(),
    toAccountId: z.string().uuid(),
    // Decimal string to preserve precision; client renders dollars.
    amount: z
      .string()
      .regex(/^\d+(\.\d{1,18})?$/, "Amount must be a positive decimal")
      .refine((v) => Number(v) > 0, "Amount must be > 0"),
    note: z.string().trim().max(140).optional(),
  })
  .refine((v) => v.fromAccountId !== v.toAccountId, {
    message: "Source and destination must differ",
    path: ["toAccountId"],
  });

export type InternalTransferInput = z.infer<typeof internalTransferSchema>;

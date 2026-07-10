// Zod schemas for the user-facing accounts API.

import { z } from "zod";
import { ACCOUNT_TYPES } from "@/lib/accounts";

export const createAccountSchema = z.object({
  accountType: z.enum(ACCOUNT_TYPES),
  nickname: z.string().trim().min(1).max(40).optional(),
});
export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z
  .object({
    nickname: z.string().trim().min(1).max(40).optional(),
    // Closing happens via DELETE; PATCH only toggles active/frozen.
    status: z.enum(["active", "frozen"]).optional(),
    // Setting a non-primary account primary. The handler demotes the
    // previous primary atomically; we never accept is_primary=false here.
    setPrimary: z.literal(true).optional(),
  })
  .refine(
    (v) =>
      v.nickname !== undefined ||
      v.status !== undefined ||
      v.setPrimary !== undefined,
    { message: "At least one field must be provided" }
  );
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

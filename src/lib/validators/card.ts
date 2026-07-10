import { z } from "zod";

export const CARD_TYPES = ["debit", "credit", "virtual", "physical"] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const CARD_STATUSES = [
  "active",
  "frozen",
  "replaced",
  "canceled",
] as const;
export type CardStatus = (typeof CARD_STATUSES)[number];

export const createCardSchema = z.object({
  accountId: z.string().uuid(),
  cardType: z.enum(CARD_TYPES),
  nickname: z.string().trim().min(1).max(40).optional(),
});
export type CreateCardInput = z.infer<typeof createCardSchema>;

export const updateCardSchema = z
  .object({
    nickname: z.string().trim().min(1).max(40).optional(),
    // PATCH only flips between active and frozen. Cancel via DELETE if/when
    // we add it; replace by issuing a new card.
    status: z.enum(["active", "frozen"]).optional(),
  })
  .refine((v) => v.nickname !== undefined || v.status !== undefined, {
    message: "At least one field must be provided",
  });
export type UpdateCardInput = z.infer<typeof updateCardSchema>;

export const reassignCardSchema = z.object({
  accountId: z.string().uuid(),
});

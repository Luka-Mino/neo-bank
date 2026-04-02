import { z } from "zod";

export const createRecipientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z
    .object({
      street1: z.string().min(1),
      street2: z.string().optional(),
      city: z.string().min(1),
      region: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().length(2, "Country must be ISO alpha-2 code"),
    })
    .optional(),
});

export const createDestinationSchema = z.object({
  destinationType: z.enum(["crypto", "fiat_us", "fiat_iban"]),
  name: z.string().optional(),
  // Crypto
  cryptoAddress: z.string().optional(),
  networkId: z.string().optional(),
  assets: z.array(z.string()).optional(),
  // US Bank
  abaRoutingNumber: z.string().length(9, "Routing number must be 9 digits").optional(),
  accountNumber: z.string().min(4).optional(),
  accountType: z.enum(["checking", "savings"]).optional(),
  // IBAN
  iban: z.string().optional(),
  bic: z.string().optional(),
});

export type CreateRecipientInput = z.infer<typeof createRecipientSchema>;
export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;

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

// Postal address in Dakota's shape (street1/city/country required).
const addressSchema = z.object({
  street1: z.string().min(1).max(35),
  street2: z.string().max(35).optional(),
  city: z.string().min(1),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().length(2, "Country must be ISO alpha-2 code"),
});

// Field requirements mirror Dakota's API reference per destination type —
// notably fiat_us REQUIRES account_holder_name and bank_name (≤35 chars),
// and fiat_iban requires the holder's address plus assets/capabilities.
// Getting these wrong 400s at Dakota, so we enforce them at our edge.
export const createDestinationSchema = z
  .object({
    destinationType: z.enum(["crypto", "fiat_us", "fiat_iban"]),
    name: z.string().min(1, "Destination name is required").max(60),
    // Crypto
    cryptoAddress: z.string().optional(),
    networkId: z.string().optional(),
    assets: z.array(z.string()).optional(),
    // US Bank
    abaRoutingNumber: z
      .string()
      .regex(/^\d{9}$/, "Routing number must be exactly 9 digits")
      .optional(),
    abaWireRoutingNumber: z.string().regex(/^\d{9}$/).optional(),
    accountNumber: z.string().min(4).optional(),
    accountType: z.enum(["checking", "savings"]).optional(),
    accountHolderName: z.string().min(1).max(35, "Max 35 characters").optional(),
    bankName: z.string().min(1).max(35, "Max 35 characters").optional(),
    accountHolderAddress: addressSchema.optional(),
    bankAddress: addressSchema.optional(),
    // IBAN
    iban: z.string().min(15).max(34).optional(),
    bic: z.string().min(8).max(11).optional(),
    capabilities: z
      .array(z.enum(["ach", "fedwire", "swift", "us_bank_account"]))
      .optional(),
  })
  .superRefine((v, ctx) => {
    const need = (field: keyof typeof v, message: string) => {
      if (v[field] === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
      }
    };

    if (v.destinationType === "crypto") {
      need("cryptoAddress", "Wallet address is required");
      need("networkId", "Network is required");
    }
    if (v.destinationType === "fiat_us") {
      need("abaRoutingNumber", "Routing number is required");
      need("accountNumber", "Account number is required");
      need("accountType", "Account type is required");
      need("accountHolderName", "Account holder name is required");
      need("bankName", "Bank name is required");
    }
    if (v.destinationType === "fiat_iban") {
      need("iban", "IBAN is required");
      need("accountHolderName", "Account holder name is required");
      need("accountHolderAddress", "Account holder address is required");
      need("bankName", "Bank name is required");
      if (!v.assets?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["assets"],
          message: "At least one asset (USD/EUR) is required",
        });
      }
      if (!v.capabilities?.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["capabilities"],
          message: "At least one payment capability is required",
        });
      }
      if (v.bic && !v.bankAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bankAddress"],
          message: "Bank address is required when BIC is provided",
        });
      }
    }
  });

export type CreateRecipientInput = z.infer<typeof createRecipientSchema>;
export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;

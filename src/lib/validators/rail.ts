// Validator for Dakota on-ramp / off-ramp rail configuration.
// Was previously named createAccountSchema in validators/account.ts; renamed
// when the user-facing accounts concept took the "account" namespace.

import { z } from "zod";

export const createRailSchema = z.object({
  accountType: z.enum(["onramp", "offramp", "swap"]),
  cryptoDestinationId: z.string().optional(),
  fiatDestinationId: z.string().optional(),
  sourceAsset: z.string().optional(),
  destinationAsset: z.string().optional(),
  sourceNetworkId: z.string().optional(),
  destinationNetworkId: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
});

export type CreateRailInput = z.infer<typeof createRailSchema>;

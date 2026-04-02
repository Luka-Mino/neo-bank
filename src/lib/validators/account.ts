import { z } from "zod";

export const createAccountSchema = z.object({
  accountType: z.enum(["onramp", "offramp", "swap"]),
  cryptoDestinationId: z.string().optional(),
  fiatDestinationId: z.string().optional(),
  sourceAsset: z.string().optional(),
  destinationAsset: z.string().optional(),
  sourceNetworkId: z.string().optional(),
  destinationNetworkId: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

import { dakota } from "./client";

interface CreateAccountParams {
  accountType: "onramp" | "offramp" | "swap";
  customerId: string;
  cryptoDestinationId?: string;
  fiatDestinationId?: string;
  sourceAsset?: string;
  destinationAsset?: string;
  sourceNetworkId?: string;
  destinationNetworkId?: string;
  capabilities?: string[];
  rail?: string;
  returnAddress?: string;
  developerFeeBps?: number;
}

export interface DakotaBankAccount {
  aba_routing_number?: string;
  aba_wire_routing_number?: string;
  account_number?: string;
  account_type?: string;
  bank_name?: string;
  account_holder_name?: string;
  capabilities?: string[];
  iban?: string;
  bic?: string;
}

interface DakotaAccount {
  id: string;
  account_type: string;
  customer_id: string;
  source_asset: string;
  destination_asset: string;
  capabilities: string[];
  // The API reference calls this field `bank_account`.
  bank_account?: DakotaBankAccount;
  source_crypto_address?: string;
  source_network_id?: string;
  rail?: string;
  created_at: string;
  updated_at: string;
}

export async function createAccount(
  params: CreateAccountParams,
  opts?: { idempotencyKey?: string }
): Promise<DakotaAccount> {
  return dakota.post<DakotaAccount>(
    "/accounts",
    {
      account_type: params.accountType,
      customer_id: params.customerId,
      crypto_destination_id: params.cryptoDestinationId,
      fiat_destination_id: params.fiatDestinationId,
      source_asset: params.sourceAsset,
      destination_asset: params.destinationAsset,
      source_network_id: params.sourceNetworkId,
      destination_network_id: params.destinationNetworkId,
      capabilities: params.capabilities,
      rail: params.rail,
      return_address: params.returnAddress,
      developer_fee_bps: params.developerFeeBps,
    },
    opts
  );
}

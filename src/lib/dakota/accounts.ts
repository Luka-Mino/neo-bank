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
  returnAddress?: string;
  developerFeeBps?: number;
}

interface DakotaAccount {
  id: string;
  account_type: string;
  customer_id: string;
  source_asset: string;
  destination_asset: string;
  capabilities: string[];
  bank_account_info?: {
    aba_routing_number: string;
    account_number: string;
    bank_name: string;
    account_holder_name: string;
  };
  source_crypto_address?: string;
  created_at: string;
  updated_at: string;
}

export async function createAccount(params: CreateAccountParams): Promise<DakotaAccount> {
  return dakota.post<DakotaAccount>("/accounts", {
    account_type: params.accountType,
    customer_id: params.customerId,
    crypto_destination_id: params.cryptoDestinationId,
    fiat_destination_id: params.fiatDestinationId,
    source_asset: params.sourceAsset,
    destination_asset: params.destinationAsset,
    source_network_id: params.sourceNetworkId,
    destination_network_id: params.destinationNetworkId,
    capabilities: params.capabilities,
    return_address: params.returnAddress,
    developer_fee_bps: params.developerFeeBps,
  });
}

export async function getAccount(accountId: string): Promise<DakotaAccount> {
  return dakota.get<DakotaAccount>(`/accounts/${accountId}`);
}

export async function listAccounts(params?: {
  accountType?: string;
  limit?: number;
  startingAfter?: string;
}): Promise<{ data: DakotaAccount[]; total_count: number; has_more_after: boolean }> {
  const queryParams: Record<string, string> = {};
  if (params?.accountType) queryParams.account_type = params.accountType;
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.startingAfter) queryParams.starting_after = params.startingAfter;

  return dakota.get("/accounts", queryParams);
}

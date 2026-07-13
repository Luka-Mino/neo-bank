import { dakota } from "./client";

interface CreateWalletParams {
  customerId: string;
  name: string;
  family: "evm" | "solana";
  // Both required by Dakota. A wallet with `policies: []` is deposit-only —
  // every send is denied until a policy is attached (an endorsed request).
  signerGroups: string[];
  policies: string[];
}

interface DakotaWallet {
  id: string;
  client_id: string;
  customer_id: string;
  family: string;
  address: string;
  name: string;
  created_at: string;
}

export interface WalletBalanceEntry {
  asset: {
    id?: string;
    name?: string;
    network_id?: string;
    contract_address?: string;
    decimals?: number;
  };
  amount_usd: string;
}

export interface WalletBalancesResponse {
  wallet_id: string;
  address: string;
  balances: WalletBalanceEntry[];
  total_amount_usd: string;
}

interface WalletBalance {
  network_id: string;
  asset: string;
  balance: string;
}

export async function createWallet(
  params: CreateWalletParams,
  opts?: { idempotencyKey?: string }
): Promise<DakotaWallet> {
  return dakota.post<DakotaWallet>(
    "/wallets",
    {
      customer_id: params.customerId,
      name: params.name,
      family: params.family,
      signer_groups: params.signerGroups,
      policies: params.policies,
    },
    opts
  );
}

// Response shape per OpenAPI: balances[] with an AssetDeployment and a
// USD-valued amount string (2dp, truncated toward zero) — NOT {data:[...]}.
export async function getWalletBalances(
  walletId: string
): Promise<WalletBalancesResponse> {
  return dakota.get<WalletBalancesResponse>(`/wallets/${walletId}/balances`);
}

// Sending from a wallet requires a signed intent (endorsed request) —
// see wallet-transactions.ts. Dakota has no unauthenticated send endpoint.

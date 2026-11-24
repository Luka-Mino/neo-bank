import { dakota } from "./client";

export interface CreateWalletParams {
  customerId: string;
  name: string;
  family: "evm" | "solana";
  // Both required by Dakota. A wallet with `policies: []` is deposit-only —
  // every send is denied until a policy is attached (an endorsed request).
  signerGroups: string[];
  policies: string[];
}

export interface DakotaWallet {
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
  /** Present only while the wallet is enabled for cards (and the live read
   *  succeeded). Absent, never null, otherwise: treat as "try again later". */
  card?: WalletCardBalance;
}

/** docs.dakota.xyz/documentation/cards/card-funding.md#holds-and-available-balance */
export interface WalletCardBalance {
  currency: string;
  total: string;
  held: string;
  outstanding: string;
  /** total − held − outstanding, never below zero. Show this one. */
  available: string;
  spend_asset: string;
  spend_network_id: string;
}

export type CardSpending = {
  available: number;
  held: number;
  outstanding: number;
  total: number;
  spendAsset: string;
  networkId: string;
};

/** Card figures in numbers, or null when Dakota didn't include them. */
export function parseCardSpending(r: Pick<WalletBalancesResponse, "card">): CardSpending | null {
  const c = r.card;
  if (!c) return null;
  const n = (v: string) => {
    const x = Number(v);
    return Number.isFinite(x) && x > 0 ? x : 0;
  };
  return {
    available: n(c.available),
    held: n(c.held),
    outstanding: n(c.outstanding),
    total: n(c.total),
    spendAsset: c.spend_asset,
    networkId: c.spend_network_id,
  };
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

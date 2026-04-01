import { dakota } from "./client";

interface CreateWalletParams {
  customerId: string;
  name: string;
  family: "evm" | "solana";
  signerGroups: string[];
  policies?: string[];
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

interface WalletBalance {
  network_id: string;
  asset: string;
  balance: string;
}

export async function createWallet(params: CreateWalletParams): Promise<DakotaWallet> {
  return dakota.post<DakotaWallet>("/wallets", {
    customer_id: params.customerId,
    name: params.name,
    family: params.family,
    signer_groups: params.signerGroups,
    policies: params.policies,
  });
}

export async function getWalletBalances(
  walletId: string
): Promise<{ data: WalletBalance[] }> {
  return dakota.get<{ data: WalletBalance[] }>(`/wallets/${walletId}/balances`);
}

export async function sendFromWallet(
  walletId: string,
  params: {
    amount: string;
    asset: string;
    networkId: string;
    destinationAddress: string;
  }
): Promise<DakotaTransaction> {
  return dakota.post<DakotaTransaction>(`/wallets/${walletId}/send`, {
    amount: params.amount,
    asset: params.asset,
    network_id: params.networkId,
    destination_address: params.destinationAddress,
  });
}

interface DakotaTransaction {
  id: string;
  status: string;
  amount: string;
  created_at: string;
}

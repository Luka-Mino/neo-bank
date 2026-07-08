import { dakota } from "./client";
import {
  getPlatformSignerKey,
  signIntent,
  type EndorsedRequest,
  type SendTransactionIntent,
} from "./signing";
import { caip2ForNetwork, defaultNetworkId, type NetworkId } from "./networks";

export interface WalletTransaction {
  id: string;
  resource_type: "wallet";
  wallet_id: string;
  status: string;
  network_id?: string;
  from?: string;
  to?: string;
  transaction_hash?: string;
  transaction_type?: "transfer" | "evm_contract_call";
  amount?: string;
  asset?: string;
  created_at?: number;
  confirmed_at?: number;
}

export interface SendWalletTransactionParams {
  walletId: string;
  /** The wallet's own address. */
  from: string;
  to: string;
  /**
   * Exact decimal string. For withdrawals this is the one-off transfer's
   * `send_amount` (fees included), not the user-requested amount.
   */
  amount: string;
  /** e.g. "USDC" */
  assetId: string;
  /** Defaults to DAKOTA_NETWORK_ID. */
  networkId?: NetworkId;
  /**
   * Must be a UUID. Callers should derive it deterministically from the
   * originating ledger row so retries replay Dakota's cached response
   * instead of double-sending.
   */
  idempotencyKey: string;
}

/**
 * Send funds from a Dakota wallet via the endorsed-request flow, signed by
 * the platform signer. Policy and signer checks happen server-side; the
 * resulting transaction starts in a non-terminal status — completion arrives
 * via wallet.transaction.updated webhooks.
 */
export async function sendWalletTransaction(
  params: SendWalletTransactionParams
): Promise<WalletTransaction> {
  const networkId = params.networkId ?? defaultNetworkId();

  const intent: SendTransactionIntent = {
    wallet_id: params.walletId,
    caip2: caip2ForNetwork(networkId),
    operation: {
      kind: "transfer",
      from: params.from,
      to: params.to,
      amount: params.amount,
      asset_id: params.assetId,
    },
    idempotency_key: params.idempotencyKey,
  };

  const body: EndorsedRequest<SendTransactionIntent> = {
    signatures: [signIntent(intent, getPlatformSignerKey())],
    intent,
  };

  return dakota.post<WalletTransaction>(
    `/wallets/${params.walletId}/transactions`,
    body,
    { idempotencyKey: params.idempotencyKey }
  );
}

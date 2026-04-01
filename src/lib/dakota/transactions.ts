import { dakota } from "./client";

interface CreateTransactionParams {
  amount: string;
  customerId: string;
  sourceNetworkId: string;
  sourceAsset: string;
  destinationId: string;
  destinationAsset: string;
  destinationNetworkId?: string;
  destinationPaymentRail?: "ach" | "fedwire" | "swift";
  paymentReference?: string;
}

interface DakotaTransaction {
  id: string;
  amount: string;
  send_amount: string;
  status: string;
  customer_id: string;
  source_network_id: string;
  source_asset: string;
  destination_id: string;
  destination_asset: string;
  destination_network_id: string;
  crypto_address: string;
  destination_bank_name?: string;
  destination_account_holder_name?: string;
  destination_account_number_last_four?: string;
  destination_routing_number?: string;
  receipt?: {
    input: string;
    output: string;
    exchange_rate: string;
    subtotal: string;
    dakota_fee: string;
    client_fee: string;
    gas_fee: string;
  };
  crypto_details?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export async function createTransaction(
  params: CreateTransactionParams
): Promise<DakotaTransaction> {
  return dakota.post<DakotaTransaction>("/transactions", {
    amount: params.amount,
    customer_id: params.customerId,
    source_network_id: params.sourceNetworkId,
    source_asset: params.sourceAsset,
    destination_id: params.destinationId,
    destination_asset: params.destinationAsset,
    destination_network_id: params.destinationNetworkId,
    destination_payment_rail: params.destinationPaymentRail,
    payment_reference: params.paymentReference,
  });
}

export async function getTransaction(txId: string): Promise<DakotaTransaction> {
  return dakota.get<DakotaTransaction>(`/transactions/${txId}`);
}

export async function listTransactions(params?: {
  limit?: number;
  startingAfter?: string;
}): Promise<{ data: DakotaTransaction[]; total_count: number; has_more_after: boolean }> {
  const queryParams: Record<string, string> = {};
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.startingAfter) queryParams.starting_after = params.startingAfter;

  return dakota.get("/transactions", queryParams);
}

export async function cancelTransaction(txId: string): Promise<DakotaTransaction> {
  return dakota.post<DakotaTransaction>(`/transactions/${txId}/cancel`);
}

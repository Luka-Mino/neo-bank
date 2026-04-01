import { dakota } from "./client";

interface CreateRecipientParams {
  customerId: string;
  name: string;
  address?: {
    street1: string;
    street2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  externalId?: string;
}

interface DakotaRecipient {
  id: string;
  name: string;
  address?: Record<string, string>;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

interface CreateDestinationParams {
  recipientId: string;
  destinationType: "crypto" | "fiat_us" | "fiat_iban";
  name?: string;
  // Crypto
  cryptoAddress?: string;
  networkId?: string;
  assets?: string[];
  // US Bank
  abaRoutingNumber?: string;
  accountNumber?: string;
  accountType?: "checking" | "savings";
  // IBAN
  iban?: string;
  bic?: string;
}

interface DakotaDestination {
  id: string;
  destination_type: string;
  name?: string;
  crypto_address?: string;
  network_id?: string;
  aba_routing_number?: string;
  account_number?: string;
  iban?: string;
  bic?: string;
  created_at: string;
}

export async function createRecipient(
  params: CreateRecipientParams
): Promise<DakotaRecipient> {
  const body: Record<string, unknown> = { name: params.name };
  if (params.address) {
    body.address = {
      street1: params.address.street1,
      street2: params.address.street2,
      city: params.address.city,
      region: params.address.region,
      postal_code: params.address.postalCode,
      country: params.address.country,
    };
  }
  if (params.externalId) body.external_id = params.externalId;

  return dakota.post<DakotaRecipient>(
    `/customers/${params.customerId}/recipients`,
    body
  );
}

export async function getRecipient(recipientId: string): Promise<DakotaRecipient> {
  return dakota.get<DakotaRecipient>(`/recipients/${recipientId}`);
}

export async function listRecipients(
  customerId: string,
  params?: { limit?: number; startingAfter?: string }
): Promise<{ data: DakotaRecipient[]; total_count: number; has_more_after: boolean }> {
  const queryParams: Record<string, string> = {};
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.startingAfter) queryParams.starting_after = params.startingAfter;

  return dakota.get(`/customers/${customerId}/recipients`, queryParams);
}

export async function createDestination(
  params: CreateDestinationParams
): Promise<DakotaDestination> {
  const body: Record<string, unknown> = {
    destination_type: params.destinationType,
    name: params.name,
  };

  if (params.destinationType === "crypto") {
    body.crypto_address = params.cryptoAddress;
    body.network_id = params.networkId;
    body.assets = params.assets;
  } else if (params.destinationType === "fiat_us") {
    body.aba_routing_number = params.abaRoutingNumber;
    body.account_number = params.accountNumber;
    body.account_type = params.accountType;
    body.assets = ["USD"];
  } else if (params.destinationType === "fiat_iban") {
    body.iban = params.iban;
    body.bic = params.bic;
  }

  return dakota.post<DakotaDestination>(
    `/recipients/${params.recipientId}/destinations`,
    body
  );
}

export async function listDestinations(
  recipientId: string
): Promise<{ data: DakotaDestination[] }> {
  return dakota.get(`/recipients/${recipientId}/destinations`);
}

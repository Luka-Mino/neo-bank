import { dakota } from "./client";

interface CreateCustomerParams {
  name: string;
  customerType: "individual" | "business";
  externalId?: string;
}

interface DakotaCustomer {
  id: string;
  name: string;
  customer_type: string;
  external_id?: string;
  application_id: string;
  application_url: string;
  application_expires_at: string;
  kyb_status: string;
  created_at: string;
  updated_at: string;
}

export async function createCustomer(params: CreateCustomerParams): Promise<DakotaCustomer> {
  return dakota.post<DakotaCustomer>("/customers", {
    name: params.name,
    customer_type: params.customerType,
    external_id: params.externalId,
  });
}

export async function getCustomer(customerId: string): Promise<DakotaCustomer> {
  return dakota.get<DakotaCustomer>(`/customers/${customerId}`);
}

export async function listCustomers(params?: {
  externalId?: string;
  search?: string;
  limit?: number;
  startingAfter?: string;
}): Promise<{ data: DakotaCustomer[]; total_count: number; has_more_after: boolean }> {
  const queryParams: Record<string, string> = {};
  if (params?.externalId) queryParams.external_id = params.externalId;
  if (params?.search) queryParams.search = params.search;
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.startingAfter) queryParams.starting_after = params.startingAfter;

  return dakota.get("/customers", queryParams);
}

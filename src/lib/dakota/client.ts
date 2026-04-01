import { v4 as uuidv4 } from "uuid";

const DAKOTA_BASE_URLS = {
  sandbox: "https://api.platform.sandbox.dakota.xyz",
  production: "https://api.platform.dakota.xyz",
} as const;

type DakotaEnv = keyof typeof DAKOTA_BASE_URLS;

function getBaseUrl(): string {
  const env = (process.env.DAKOTA_ENV || "sandbox") as DakotaEnv;
  return DAKOTA_BASE_URLS[env];
}

function getApiKey(): string {
  const key = process.env.DAKOTA_API_KEY;
  if (!key) throw new Error("DAKOTA_API_KEY is not configured");
  return key;
}

export class DakotaApiError extends Error {
  constructor(
    public status: number,
    public type: string,
    public detail: string,
    public errors?: Array<{ field: string; message: string; code: string }>
  ) {
    super(`Dakota API Error (${status}): ${detail}`);
    this.name = "DakotaApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new DakotaApiError(
      response.status,
      body.type || "unknown",
      body.detail || response.statusText,
      body.errors
    );
  }
  return response.json();
}

export const dakota = {
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${getBaseUrl()}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const response = await fetch(url.toString(), {
      headers: {
        "x-api-key": getApiKey(),
      },
    });

    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "POST",
      headers: {
        "x-api-key": getApiKey(),
        "x-idempotency-key": uuidv4(),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "PATCH",
      headers: {
        "x-api-key": getApiKey(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return handleResponse<T>(response);
  },

  async delete<T = void>(path: string): Promise<T> {
    const response = await fetch(`${getBaseUrl()}${path}`, {
      method: "DELETE",
      headers: {
        "x-api-key": getApiKey(),
      },
    });

    if (response.status === 204) return undefined as T;
    return handleResponse<T>(response);
  },
};

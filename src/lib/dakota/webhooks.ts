import { Buffer } from "buffer";

const WEBHOOK_PUBLIC_KEYS = {
  sandbox:
    "7a2f771f3a7ac9ae2a95066df35dc0261d7ce354214736cc232d70b3c66f8a5f",
  production:
    "65b797d688ed4991ecc0d922f360bd9b4c3d68e5a36ce2b1307cc8547bd68be4",
} as const;

const REPLAY_WINDOW_SECONDS = 300;

export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  // Check replay window
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  if (!Number.isFinite(ts) || Math.abs(now - ts) > REPLAY_WINDOW_SECONDS) {
    return false;
  }

  const env = (process.env.DAKOTA_ENV || "sandbox") as keyof typeof WEBHOOK_PUBLIC_KEYS;
  const publicKeyHex = process.env.DAKOTA_WEBHOOK_PUBLIC_KEY || WEBHOOK_PUBLIC_KEYS[env];

  // Dakota signs timestamp + payload concatenated directly — NO separator.
  const signedPayload = `${timestamp}${rawBody}`;

  const publicKeyBytes = Buffer.from(publicKeyHex, "hex");
  const signatureBytes = Buffer.from(signature, "base64");

  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      publicKeyBytes,
      { name: "Ed25519" },
      false,
      ["verify"]
    );

    const encoder = new TextEncoder();
    return await crypto.subtle.verify(
      "Ed25519",
      cryptoKey,
      signatureBytes,
      encoder.encode(signedPayload)
    );
  } catch {
    return false;
  }
}

/**
 * Dakota's webhook/event envelope (same shape as GET /events entries).
 * The payload object lives at data.object; update events may carry a sparse
 * data.previous_attributes.
 */
export interface DakotaEventEnvelope<T = Record<string, unknown>> {
  id: string;
  type: string;
  created: number;
  api_version?: string;
  data: {
    object: T;
    previous_attributes?: Partial<T>;
  };
}

/**
 * Parse a raw webhook body into the standard envelope. Tolerates the minimal
 * legacy shape some docs examples show ({event, data: {...}}) by lifting the
 * bare data object into data.object.
 */
export function parseEventEnvelope(rawBody: string): DakotaEventEnvelope {
  const parsed = JSON.parse(rawBody) as Record<string, unknown>;
  const data = parsed.data as Record<string, unknown> | undefined;

  if (data && typeof data === "object" && !("object" in data)) {
    return {
      id: (parsed.id as string) ?? "",
      type: (parsed.type as string) ?? (parsed.event as string) ?? "",
      created: (parsed.created as number) ?? 0,
      api_version: parsed.api_version as string | undefined,
      data: { object: data },
    };
  }

  return parsed as unknown as DakotaEventEnvelope;
}

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
  if (Math.abs(now - ts) > REPLAY_WINDOW_SECONDS) {
    return false;
  }

  const env = (process.env.DAKOTA_ENV || "sandbox") as keyof typeof WEBHOOK_PUBLIC_KEYS;
  const publicKeyHex = process.env.DAKOTA_WEBHOOK_PUBLIC_KEY || WEBHOOK_PUBLIC_KEYS[env];

  // Construct signed payload
  const signedPayload = `${timestamp}.${rawBody}`;

  // Import Ed25519 public key
  const publicKeyBytes = Buffer.from(publicKeyHex, "hex");
  const signatureBytes = Buffer.from(signature, "base64");

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    publicKeyBytes,
    { name: "Ed25519" },
    false,
    ["verify"]
  );

  const encoder = new TextEncoder();
  return crypto.subtle.verify(
    "Ed25519",
    cryptoKey,
    signatureBytes,
    encoder.encode(signedPayload)
  );
}

export interface WebhookEvent {
  event_id: string;
  event_type: string;
  data: Record<string, unknown>;
  created_at: string;
}

export function parseWebhookEvent(rawBody: string): WebhookEvent {
  return JSON.parse(rawBody);
}

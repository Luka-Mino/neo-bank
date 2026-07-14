// Central secrets accessor. Every secret read goes through here, so the
// backing store can change (env today, a KMS/Vault later) without touching
// call sites. Values are never logged; errors reference the NAME only.
//
// Migration path (M3): implement a `KmsSecretsProvider` that fetches from
// AWS Secrets Manager / GCP Secret Manager / Vault, select it by
// `SECRETS_PROVIDER=kms`, and no call site changes.

export interface SecretsProvider {
  get(name: SecretName): string | undefined;
}

// The complete set of secret-bearing env names. Adding one here is the only
// place the inventory lives.
export const SECRET_NAMES = [
  "AUTH_SECRET",
  "DATABASE_URL",
  "DAKOTA_API_KEY",
  "DAKOTA_WEBHOOK_PUBLIC_KEY",
  "DAKOTA_SIGNER_PRIVATE_KEY",
  "CRON_SECRET",
  "RESEND_API_KEY",
  "SENTRY_DSN",
] as const;

export type SecretName = (typeof SECRET_NAMES)[number];

class EnvSecretsProvider implements SecretsProvider {
  get(name: SecretName): string | undefined {
    return process.env[name];
  }
}

function makeProvider(): SecretsProvider {
  // Only env is implemented today; the switch is the KMS seam.
  return new EnvSecretsProvider();
}

const provider = makeProvider();

/** Optional secret — undefined if unset. Never logs the value. */
export function getSecret(name: SecretName): string | undefined {
  return provider.get(name);
}

/** Required secret — throws (naming only, never the value) if missing. */
export function requireSecret(name: SecretName): string {
  const value = provider.get(name);
  if (!value) {
    throw new Error(`Required secret ${name} is not configured`);
  }
  return value;
}

/**
 * Validate that every secret required in THIS environment is present and
 * well-formed. Called at startup (src/instrumentation.ts) so misconfiguration
 * fails fast and loudly instead of at the first money movement.
 */
export function validateSecretsAtStartup(): void {
  const problems: string[] = [];
  const isProd = process.env.NODE_ENV === "production";
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  // Always required.
  for (const name of ["AUTH_SECRET", "DATABASE_URL"] as const) {
    if (!getSecret(name)) problems.push(`${name} is required`);
  }
  const authSecret = getSecret("AUTH_SECRET");
  if (authSecret && authSecret.length < 16) {
    problems.push("AUTH_SECRET must be at least 16 characters");
  }

  // Dakota is required in production unless demo mode is on.
  if (isProd && !demo) {
    for (const name of ["DAKOTA_API_KEY", "DAKOTA_WEBHOOK_PUBLIC_KEY"] as const) {
      if (!getSecret(name)) problems.push(`${name} is required in production`);
    }
    if (!getSecret("CRON_SECRET")) {
      problems.push("CRON_SECRET is required in production (cron auth)");
    }
  }
  const webhookKey = getSecret("DAKOTA_WEBHOOK_PUBLIC_KEY");
  if (webhookKey && !/^[0-9a-f]{64}$/i.test(webhookKey)) {
    problems.push("DAKOTA_WEBHOOK_PUBLIC_KEY must be 64 hex chars");
  }

  if (problems.length > 0) {
    throw new Error(`Secret configuration invalid:\n - ${problems.join("\n - ")}`);
  }
}

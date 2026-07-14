// Server-side error monitoring. A complete no-op until SENTRY_DSN is set,
// so this ships ahead of the Sentry account with zero effect.
import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Only run in the Node.js server runtime (not edge/browser).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Fail fast on misconfigured secrets rather than at first money movement.
    const { validateSecretsAtStartup } = await import("@/lib/secrets");
    validateSecretsAtStartup();
  }

  if (!process.env.SENTRY_DSN) return;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.DAKOTA_ENV ?? "development",
    tracesSampleRate: 0.1,
    // Never attach request bodies — they can contain money amounts,
    // account numbers, and 2FA codes.
    sendDefaultPii: false,
  });
}

export const onRequestError = Sentry.captureRequestError;

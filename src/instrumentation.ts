// Server-side error monitoring. A complete no-op until SENTRY_DSN is set,
// so this ships ahead of the Sentry account with zero effect.
import * as Sentry from "@sentry/nextjs";

export async function register() {
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

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(16),
    DAKOTA_API_KEY: z.string().min(1),
    DAKOTA_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
    DAKOTA_WEBHOOK_PUBLIC_KEY: z.string().length(64),
    // Set by scripts/dakota-bootstrap.ts — optional so the app boots before
    // bootstrap; wallet sends and provisioning throw descriptive errors if
    // they run without them.
    DAKOTA_SIGNER_PRIVATE_KEY: z.string().min(1).optional(),
    DAKOTA_SIGNER_GROUP_ID: z.string().length(27).optional(),
    DAKOTA_POLICY_ID: z.string().length(27).optional(),
    DAKOTA_NETWORK_ID: z.enum(["base-mainnet", "base-sepolia"]).optional(),
    // Bearer token for the reconcile cron route; mandatory in production.
    CRON_SECRET: z.string().min(16).optional(),
    REDIS_URL: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    EMAIL_PROVIDER: z.enum(["resend", "smtp"]).optional(),
    SMTP_URL: z.string().optional(),
    DB_POOL_MAX: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    DAKOTA_API_KEY: process.env.DAKOTA_API_KEY,
    DAKOTA_ENV: process.env.DAKOTA_ENV,
    DAKOTA_WEBHOOK_PUBLIC_KEY: process.env.DAKOTA_WEBHOOK_PUBLIC_KEY,
    DAKOTA_SIGNER_PRIVATE_KEY: process.env.DAKOTA_SIGNER_PRIVATE_KEY,
    DAKOTA_SIGNER_GROUP_ID: process.env.DAKOTA_SIGNER_GROUP_ID,
    DAKOTA_POLICY_ID: process.env.DAKOTA_POLICY_ID,
    DAKOTA_NETWORK_ID: process.env.DAKOTA_NETWORK_ID,
    CRON_SECRET: process.env.CRON_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    SMTP_URL: process.env.SMTP_URL,
    DB_POOL_MAX: process.env.DB_POOL_MAX,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});

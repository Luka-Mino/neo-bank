import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(16),
    DAKOTA_API_KEY: z.string().min(1),
    DAKOTA_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
    DAKOTA_WEBHOOK_PUBLIC_KEY: z.string().length(64),
    REDIS_URL: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
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
    REDIS_URL: process.env.REDIS_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});

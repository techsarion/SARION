import { z } from "zod";

// Validate environment at boot — fail fast on missing config.
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);

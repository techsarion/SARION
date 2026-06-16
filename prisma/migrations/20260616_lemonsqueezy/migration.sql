-- Billing provider migration: Stripe → Lemon Squeezy.
--
-- Replaces Stripe customer/subscription identifiers on Agency with Lemon
-- Squeezy equivalents and swaps the webhook idempotency ledger. Plan
-- enforcement, trial, founding-member, and usage-limit logic are untouched —
-- only the billing provider changes.

-- 1. New Lemon Squeezy identifiers on Agency ---------------------------------
ALTER TABLE "Agency"
  ADD COLUMN "lemonCustomerId"     TEXT,
  ADD COLUMN "lemonOrderId"        TEXT,
  ADD COLUMN "lemonSubscriptionId" TEXT;

-- 2. Drop the legacy Stripe identifiers --------------------------------------
ALTER TABLE "Agency"
  DROP COLUMN IF EXISTS "stripeCustomerId",
  DROP COLUMN IF EXISTS "stripeSubscriptionId";

-- 3. Webhook idempotency ledger ----------------------------------------------
CREATE TABLE "LemonWebhookEvent" (
  "id"        TEXT NOT NULL,
  "eventId"   TEXT NOT NULL,
  "type"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LemonWebhookEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LemonWebhookEvent_eventId_key" ON "LemonWebhookEvent"("eventId");

-- 4. Retire the Stripe webhook ledger ----------------------------------------
DROP TABLE IF EXISTS "StripeWebhookEvent";

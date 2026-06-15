-- Pricing v2: tiered plans, annual billing, founding members, no-card trial.
--
-- Replaces the free-text Agency.plan column with a typed PlanTier enum and adds
-- billing interval, founding status, and trial expiry. Existing agencies are
-- mapped from their old string plan; "starter" was the previous default.

-- 1. Enums --------------------------------------------------------------------
CREATE TYPE "PlanTier" AS ENUM ('free', 'starter', 'growth', 'agency');
CREATE TYPE "BillingInterval" AS ENUM ('monthly', 'yearly');

-- 2. New columns (added nullable / with defaults so the migration is online) --
ALTER TABLE "Agency"
  ADD COLUMN "planTier"        "PlanTier"        NOT NULL DEFAULT 'free',
  ADD COLUMN "billingInterval" "BillingInterval" NOT NULL DEFAULT 'monthly',
  ADD COLUMN "foundingMember"  BOOLEAN           NOT NULL DEFAULT false,
  ADD COLUMN "trialEndsAt"     TIMESTAMP(3);

-- 3. Backfill planTier from the legacy free-text "plan" column ----------------
UPDATE "Agency" SET "planTier" =
  CASE lower("plan")
    WHEN 'growth' THEN 'growth'::"PlanTier"
    WHEN 'agency' THEN 'agency'::"PlanTier"
    WHEN 'starter' THEN 'starter'::"PlanTier"
    ELSE 'free'::"PlanTier"
  END;

-- Give still-trialing legacy agencies a 14-day window from now so the new
-- trial UX has an end date to count down to.
UPDATE "Agency"
  SET "trialEndsAt" = NOW() + INTERVAL '14 days'
  WHERE "subscriptionStatus" = 'trialing' AND "trialEndsAt" IS NULL;

-- 4. Drop the legacy column ---------------------------------------------------
ALTER TABLE "Agency" DROP COLUMN "plan";

-- 5. Webhook idempotency ledger ----------------------------------------------
CREATE TABLE "StripeWebhookEvent" (
  "id"        TEXT NOT NULL,
  "eventId"   TEXT NOT NULL,
  "type"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StripeWebhookEvent_eventId_key" ON "StripeWebhookEvent"("eventId");

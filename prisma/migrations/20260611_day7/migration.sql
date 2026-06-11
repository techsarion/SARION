-- Day 7: Add stripeSubscriptionId to Agency for full Stripe subscription tracking.

ALTER TABLE "Agency" ADD COLUMN "stripeSubscriptionId" TEXT;

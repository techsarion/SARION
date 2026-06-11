import Stripe from "stripe";

// Stripe client — used ONLY for Sarion's own subscription billing (MVP-PRD F9).
// Not used for processing agency client invoices in MVP.
// Lazy singleton: the Stripe constructor throws on an empty key, so we defer
// instantiation to request time (never at module-evaluation / build time).
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
    _stripe = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return _stripe;
}

export const PLANS = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER ?? "",
    amount: 2900,
  },
  growth: {
    name: "Growth",
    priceId: process.env.STRIPE_PRICE_GROWTH ?? "",
    amount: 5900,
  },
  agency: {
    name: "Agency",
    priceId: process.env.STRIPE_PRICE_AGENCY ?? "",
    amount: 9900,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

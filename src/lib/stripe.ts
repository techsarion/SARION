import Stripe from "stripe";

// Stripe client — used ONLY for Sarion's own subscription billing (MVP-PRD F9).
// Not used for processing agency client invoices in MVP.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-12-18.acacia",
});

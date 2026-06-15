import "server-only";

import type Stripe from "stripe";

import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import {
  BILLING_INTERVALS,
  PLANS,
  PAID_TIERS,
  resolvePriceId,
  type BillingInterval,
  type PaidPlanTier,
  type PlanTier,
} from "@/config/plans";

/**
 * Server-side billing orchestration. Wraps Stripe so routes stay thin and all
 * pricing decisions (which price ID, founding vs standard, trial behaviour)
 * live in one auditable place.
 */

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "https://trysarion.com";

/** Reverse-map a Stripe price ID back to the (tier, interval) it represents. */
export function priceIdToPlan(
  priceId: string,
): { tier: PaidPlanTier; interval: BillingInterval } | null {
  for (const tier of PAID_TIERS) {
    const p = PLANS[tier].pricing;
    for (const interval of BILLING_INTERVALS) {
      if (
        p.priceIds[interval] === priceId ||
        p.foundingPriceIds[interval] === priceId
      ) {
        return { tier, interval };
      }
    }
  }
  return null;
}

/** Map a Stripe recurring interval ("month" | "year") to our enum. */
function stripeIntervalToOurs(
  interval: Stripe.Price.Recurring.Interval | undefined,
): BillingInterval {
  return interval === "year" ? "yearly" : "monthly";
}

/** Find-or-create the Stripe customer for an agency. */
async function ensureCustomer(
  agencyId: string,
  email: string,
): Promise<string> {
  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    select: { stripeCustomerId: true, name: true },
  });
  if (!agency) throw new Error("Agency not found");
  if (agency.stripeCustomerId) return agency.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email,
    name: agency.name,
    metadata: { agencyId },
  });
  await db.agency.update({
    where: { id: agencyId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

export interface CheckoutParams {
  agencyId: string;
  email: string;
  tier: PaidPlanTier;
  interval: BillingInterval;
}

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Create a Stripe Checkout session for a subscription. Honours founding pricing
 * (the agency's locked price IDs) and carries no-card trial state forward: an
 * agency still inside its trial window keeps the remaining trial days in Stripe
 * so we never double-charge.
 */
export async function createCheckoutSession(
  params: CheckoutParams,
): Promise<CheckoutResult> {
  const { agencyId, email, tier, interval } = params;

  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    select: { foundingMember: true, subscriptionStatus: true, trialEndsAt: true },
  });
  if (!agency) return { ok: false, error: "Agency not found." };

  const priceId = resolvePriceId(tier, interval, agency.foundingMember);
  if (!priceId) {
    return {
      ok: false,
      error: `Pricing for the ${PLANS[tier].name} (${interval}) plan is not configured.`,
    };
  }

  const customerId = await ensureCustomer(agencyId, email);
  const stripe = getStripe();

  // Preserve any remaining no-card trial as Stripe trial days.
  let trialEnd: number | undefined;
  if (
    agency.subscriptionStatus === "trialing" &&
    agency.trialEndsAt &&
    agency.trialEndsAt.getTime() > Date.now()
  ) {
    trialEnd = Math.floor(agency.trialEndsAt.getTime() / 1000);
  }

  const metadata = { agencyId, tier, interval };

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl()}/settings/billing?success=1`,
    cancel_url: `${appUrl()}/settings/billing?canceled=1`,
    allow_promotion_codes: true,
    metadata,
    subscription_data: {
      metadata,
      ...(trialEnd ? { trial_end: trialEnd } : {}),
    },
  });

  if (!session.url) return { ok: false, error: "Could not start checkout." };
  return { ok: true, url: session.url };
}

/** Create a Stripe Billing Portal session (manage card, cancel, invoices). */
export async function createPortalSession(
  agencyId: string,
): Promise<CheckoutResult> {
  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    select: { stripeCustomerId: true },
  });
  if (!agency?.stripeCustomerId) {
    return { ok: false, error: "No billing account yet. Choose a plan first." };
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: agency.stripeCustomerId,
    return_url: `${appUrl()}/settings/billing`,
  });
  return { ok: true, url: session.url };
}

/**
 * Derive (tier, interval) from a Stripe subscription. Prefers explicit metadata
 * (set at checkout) and falls back to reverse-mapping the price ID — so a plan
 * change made directly in the Stripe portal is still reflected correctly.
 */
export function resolveSubscriptionPlan(sub: Stripe.Subscription): {
  tier: PlanTier;
  interval: BillingInterval;
} {
  const price = sub.items.data[0]?.price;
  const fromPrice = price?.id ? priceIdToPlan(price.id) : null;

  const metaTier = sub.metadata?.tier;
  const tier: PlanTier =
    metaTier && (PAID_TIERS as readonly string[]).includes(metaTier)
      ? (metaTier as PaidPlanTier)
      : (fromPrice?.tier ?? "free");

  const interval: BillingInterval =
    fromPrice?.interval ?? stripeIntervalToOurs(price?.recurring?.interval);

  return { tier, interval };
}

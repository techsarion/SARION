import "server-only";

import { db } from "@/lib/db";
import { createCheckoutUrl, getSubscription } from "@/lib/lemonsqueezy";
import {
  PLANS,
  resolveVariantId,
  variantIdToPlan,
  type BillingInterval,
  type PaidPlanTier,
  type PlanTier,
} from "@/config/plans";

/**
 * Server-side billing orchestration. Wraps Lemon Squeezy so routes stay thin
 * and all pricing decisions (which variant, trial behaviour, portal links) live
 * in one auditable place.
 */

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "https://trysarion.com";

export interface CheckoutParams {
  agencyId: string;
  email: string;
  tier: PaidPlanTier;
  interval: BillingInterval;
  /** Optional buyer name to prefill on the hosted checkout. */
  name?: string;
  /** Optional billing prefill — only country (ISO-2) + zip are honoured by Lemon. */
  country?: string;
  zip?: string;
  /** Optional discount code, validated by Lemon at checkout. */
  coupon?: string;
  /**
   * Path (relative to NEXT_PUBLIC_APP_URL) Lemon redirects to after a successful
   * purchase. Defaults to the existing billing settings page so legacy callers
   * are unaffected; the custom checkout passes "/checkout/success".
   */
  successPath?: string;
}

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Create a Lemon Squeezy hosted checkout for a subscription. The agency id,
 * tier, and interval are passed as `custom_data` so the webhook can resolve and
 * update the agency without a prior customer round-trip.
 */
export async function createCheckoutSession(
  params: CheckoutParams,
): Promise<CheckoutResult> {
  const { agencyId, email, tier, interval } = params;

  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    select: { id: true },
  });
  if (!agency) return { ok: false, error: "Agency not found." };

  const variantId = resolveVariantId(tier, interval);
  if (!variantId) {
    return {
      ok: false,
      error: `Pricing for the ${PLANS[tier].name} (${interval}) plan is not configured.`,
    };
  }

  const successPath = params.successPath ?? "/settings/billing?success=1";

  try {
    const url = await createCheckoutUrl({
      variantId,
      email,
      customData: { agency_id: agencyId, tier, interval },
      redirectUrl: `${appUrl()}${successPath}`,
      name: params.name,
      billingAddress: { country: params.country, zip: params.zip },
      discountCode: params.coupon,
    });
    return { ok: true, url };
  } catch (err) {
    console.error("[billing] checkout failed:", err);
    return { ok: false, error: "Could not start checkout." };
  }
}

/**
 * Resolve the Lemon Squeezy customer-portal URL for an agency. Unlike Stripe,
 * the portal link lives on the subscription resource, so we fetch the stored
 * subscription and return its `urls.customer_portal`.
 */
export async function createPortalSession(
  agencyId: string,
): Promise<CheckoutResult> {
  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    select: { lemonSubscriptionId: true },
  });
  if (!agency?.lemonSubscriptionId) {
    return { ok: false, error: "No billing account yet. Choose a plan first." };
  }

  try {
    const sub = await getSubscription(agency.lemonSubscriptionId);
    const url = sub.attributes.urls.customer_portal;
    if (!url) {
      return { ok: false, error: "Billing portal is not available right now." };
    }
    return { ok: true, url };
  } catch (err) {
    console.error("[billing] portal failed:", err);
    return { ok: false, error: "Could not open billing portal." };
  }
}

/**
 * Derive (tier, interval) from a Lemon Squeezy variant id by reverse-mapping
 * against the configured variant IDs. Falls back to "free" when the variant is
 * unknown (e.g. a product that was removed from config).
 */
export function resolveSubscriptionPlan(variantId: string | number): {
  tier: PlanTier;
  interval: BillingInterval;
} {
  const fromVariant = variantIdToPlan(String(variantId));
  return {
    tier: fromVariant?.tier ?? "free",
    interval: fromVariant?.interval ?? "monthly",
  };
}

/**
 * Map a Lemon Squeezy subscription status to our internal `subscriptionStatus`
 * (the value plan-enforcement reasons about). A "cancelled" subscription that
 * still has time left on the period keeps access (treated as active) until the
 * `subscription_expired` event lands.
 */
export function lemonStatusToOurs(
  lemonStatus: string,
  endsAt: string | null,
): string {
  switch (lemonStatus) {
    case "on_trial":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "unpaid":
    case "paused":
      return "unpaid";
    case "cancelled": {
      // Cancelled but still inside the paid period → preserve access.
      const stillActive = endsAt ? new Date(endsAt).getTime() > Date.now() : false;
      return stillActive ? "active" : "canceled";
    }
    case "expired":
      return "canceled";
    default:
      return lemonStatus;
  }
}

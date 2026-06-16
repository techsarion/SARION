/**
 * Sarion — centralized plan configuration (single source of truth).
 *
 * EVERYTHING that touches pricing, limits, feature gating, Lemon Squeezy, the
 * billing UI, and the marketing site derives from this file. Do NOT hardcode
 * prices, quotas, or Lemon Squeezy variant IDs anywhere else — read them here.
 *
 * Three concerns live together so they can never drift apart:
 *   1. Commercial   — amounts, billing intervals, Lemon Squeezy variant IDs
 *   2. Enforcement  — per-tier resource limits (maxClients, maxProjects, …)
 *   3. Presentation — marketing copy, feature bullets, badges
 *
 * Founding members: launch users keep the `foundingMember` flag (and its
 * lifetime perks/badge). Lemon Squeezy has no per-customer locked price, so
 * checkout always resolves the standard variant for the tier/interval.
 */

// ---------------------------------------------------------------------------
// Tiers & intervals
// ---------------------------------------------------------------------------

export const PLAN_TIERS = ["free", "starter", "growth", "agency"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const BILLING_INTERVALS = ["monthly", "yearly"] as const;
export type BillingInterval = (typeof BILLING_INTERVALS)[number];

/** Tiers that are actually purchasable through Lemon Squeezy (free is not). */
export const PAID_TIERS = ["starter", "growth", "agency"] as const;
export type PaidPlanTier = (typeof PAID_TIERS)[number];

export function isPaidTier(tier: string): tier is PaidPlanTier {
  return (PAID_TIERS as readonly string[]).includes(tier);
}

export function isPlanTier(tier: string): tier is PlanTier {
  return (PLAN_TIERS as readonly string[]).includes(tier);
}

// ---------------------------------------------------------------------------
// Limits — enforced server-side. `null` means unlimited.
// ---------------------------------------------------------------------------

export interface PlanLimits {
  /** Active (non-archived) clients. */
  maxClients: number | null;
  /** Active (non-archived) projects. */
  maxProjects: number | null;
  /** Additional team members BEYOND the owner. 0 = solo only. */
  maxTeamMembers: number | null;
  /** Invoices that can exist per agency. */
  maxInvoices: number | null;
  /** Whether "Powered by Sarion" branding is shown on the client portal. */
  poweredByBranding: boolean;
  /** Custom portal domain support. */
  customDomain: boolean;
  /** Full white-label (no Sarion branding, custom theme). */
  whiteLabel: boolean;
}

// ---------------------------------------------------------------------------
// Pricing — amounts are in whole dollars; Lemon Squeezy variant IDs come from
// env so the same code runs against test + live stores without edits.
// ---------------------------------------------------------------------------

export interface PlanPricing {
  /** Display dollar amount, monthly billing. */
  monthly: number;
  /** Display dollar amount for the WHOLE year (yearly billing). */
  yearly: number;
  /** Lemon Squeezy variant IDs (env-resolved) — the purchasable product. */
  variantIds: {
    monthly: string | undefined;
    yearly: string | undefined;
  };
}

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  /** One-line positioning used in marketing + billing. */
  tagline: string;
  /** Marketing feature bullets (capabilities, not quotas). */
  features: string[];
  /** Most-popular highlight on pricing cards. */
  featured?: boolean;
  pricing: PlanPricing;
  limits: PlanLimits;
}

const env = (k: string) => process.env[k];

export const PLANS: Record<PlanTier, PlanDefinition> = {
  free: {
    tier: "free",
    name: "Free",
    tagline: "Kick the tires — no credit card, no clock.",
    features: [
      "1 client",
      "1 active project",
      "Limited invoices",
      "Client portal (Powered by Sarion)",
    ],
    pricing: {
      monthly: 0,
      yearly: 0,
      variantIds: { monthly: undefined, yearly: undefined },
    },
    limits: {
      maxClients: 1,
      maxProjects: 1,
      maxTeamMembers: 0,
      maxInvoices: 3,
      poweredByBranding: true,
      customDomain: false,
      whiteLabel: false,
    },
  },

  starter: {
    tier: "starter",
    name: "Starter",
    tagline: "For freelancers and solo operators.",
    features: [
      "Unlimited clients & projects",
      "Invoices",
      "Client portal",
      "Basic branding",
      "Email support",
    ],
    pricing: {
      monthly: 19,
      yearly: 190,
      variantIds: {
        monthly: env("LEMON_STARTER_MONTHLY_VARIANT_ID"),
        yearly: env("LEMON_STARTER_YEARLY_VARIANT_ID"),
      },
    },
    limits: {
      maxClients: null,
      maxProjects: null,
      maxTeamMembers: 1,
      maxInvoices: null,
      poweredByBranding: false,
      customDomain: false,
      whiteLabel: false,
    },
  },

  growth: {
    tier: "growth",
    name: "Growth",
    tagline: "For growing agencies with a team.",
    featured: true,
    features: [
      "Everything in Starter",
      "Team collaboration (up to 5)",
      "Branded portal",
      "Custom domain",
      "More storage & automation",
      "Priority support",
    ],
    pricing: {
      monthly: 49,
      yearly: 490,
      variantIds: {
        monthly: env("LEMON_GROWTH_MONTHLY_VARIANT_ID"),
        yearly: env("LEMON_GROWTH_YEARLY_VARIANT_ID"),
      },
    },
    limits: {
      maxClients: null,
      maxProjects: null,
      maxTeamMembers: 5,
      maxInvoices: null,
      poweredByBranding: false,
      customDomain: true,
      whiteLabel: false,
    },
  },

  agency: {
    tier: "agency",
    name: "Agency",
    tagline: "For larger agencies that need it all.",
    features: [
      "Everything in Growth",
      "Unlimited team members",
      "White-label portal",
      "Advanced permissions",
      "Concierge onboarding & migration",
      "Founder support",
    ],
    pricing: {
      monthly: 99,
      yearly: 990,
      variantIds: {
        monthly: env("LEMON_AGENCY_MONTHLY_VARIANT_ID"),
        yearly: env("LEMON_AGENCY_YEARLY_VARIANT_ID"),
      },
    },
    limits: {
      maxClients: null,
      maxProjects: null,
      maxTeamMembers: null,
      maxInvoices: null,
      poweredByBranding: false,
      customDomain: true,
      whiteLabel: true,
    },
  },
};

/** Ordered list for rendering (free → agency). */
export const PLAN_LIST: PlanDefinition[] = PLAN_TIERS.map((t) => PLANS[t]);

/** Purchasable plans only (for billing cards / pricing grid). */
export const PAID_PLAN_LIST: PlanDefinition[] = PAID_TIERS.map((t) => PLANS[t]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getPlan(tier: string): PlanDefinition {
  return isPlanTier(tier) ? PLANS[tier] : PLANS.free;
}

export function getPlanLimits(tier: string): PlanLimits {
  return getPlan(tier).limits;
}

/** Whole-tier rank for upgrade/downgrade comparisons. */
export function tierRank(tier: string): number {
  return PLAN_TIERS.indexOf(isPlanTier(tier) ? tier : "free");
}

/** Monthly-equivalent saving when paying yearly (e.g. "2 months free"). */
export function yearlySavingMonths(tier: PlanTier): number {
  const p = PLANS[tier].pricing;
  if (p.monthly === 0) return 0;
  const monthsPaid = p.yearly / p.monthly;
  return Math.round(12 - monthsPaid);
}

/**
 * Resolve the Lemon Squeezy variant ID for a checkout. Returns undefined if the
 * tier/interval isn't configured.
 */
export function resolveVariantId(
  tier: PlanTier,
  interval: BillingInterval,
): string | undefined {
  if (!isPaidTier(tier)) return undefined;
  return PLANS[tier].pricing.variantIds[interval];
}

/** Reverse-map a Lemon Squeezy variant ID back to the (tier, interval) it represents. */
export function variantIdToPlan(
  variantId: string,
): { tier: PaidPlanTier; interval: BillingInterval } | null {
  for (const tier of PAID_TIERS) {
    const p = PLANS[tier].pricing;
    for (const interval of BILLING_INTERVALS) {
      if (p.variantIds[interval] === variantId) {
        return { tier, interval };
      }
    }
  }
  return null;
}

/** Trial length, in days, for new agencies. */
export const TRIAL_DAYS = 14;

/** Tier whose capabilities a no-card trial unlocks (full premium experience). */
export const TRIAL_TIER: PlanTier = "growth";

/** Minimal billing snapshot needed to reason about access. */
export interface AgencyPlanState {
  planTier: PlanTier;
  subscriptionStatus: string;
  trialEndsAt: Date | string | null;
}

function trialEndMs(state: AgencyPlanState): number | null {
  if (!state.trialEndsAt) return null;
  const ms = new Date(state.trialEndsAt).getTime();
  return Number.isNaN(ms) ? null : ms;
}

export function isTrialing(state: AgencyPlanState, now: number): boolean {
  if (state.subscriptionStatus !== "trialing") return false;
  const end = trialEndMs(state);
  return end !== null && end > now;
}

export function isTrialExpired(state: AgencyPlanState, now: number): boolean {
  if (state.subscriptionStatus !== "trialing") return false;
  const end = trialEndMs(state);
  return end !== null && end <= now;
}

/** Whole days left in the trial (0 if expired, null if not on a trial). */
export function trialDaysLeft(
  state: AgencyPlanState,
  now: number,
): number | null {
  if (state.subscriptionStatus !== "trialing") return null;
  const end = trialEndMs(state);
  if (end === null) return null;
  return Math.max(0, Math.ceil((end - now) / 86_400_000));
}

/**
 * The tier whose limits/features actually apply RIGHT NOW.
 *  • Active subscription      → the purchased tier
 *  • Live trial               → TRIAL_TIER (premium preview)
 *  • Expired trial / canceled → free (graceful downgrade, data preserved)
 */
export function effectivePlanTier(
  state: AgencyPlanState,
  now: number,
): PlanTier {
  if (state.subscriptionStatus === "active") return state.planTier;
  if (isTrialing(state, now)) return TRIAL_TIER;
  return "free";
}

/**
 * Whether the founding-pricing offer is still open for NEW signups. Existing
 * founding members keep their pricing regardless of this flag — it only gates
 * who can newly acquire founding status. Disable at launch-end via env.
 */
export function isFoundingOfferOpen(): boolean {
  return process.env.NEXT_PUBLIC_FOUNDING_OFFER_OPEN !== "false";
}

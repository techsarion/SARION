/**
 * Marketing pricing data — DERIVED from the single source of truth in
 * src/config/plans.ts so the website can never advertise a price or feature set
 * that billing doesn't honour.
 */
import {
  PLAN_LIST,
  yearlySavingMonths,
  type BillingInterval,
  type PlanTier,
} from "@/config/plans";

export interface MarketingPlan {
  tier: PlanTier;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  /** Months free when paying annually (0 for Free). */
  yearlySavingMonths: number;
  features: string[];
  featured: boolean;
  /** Free plan uses a softer CTA; paid plans start the trial. */
  ctaLabel: string;
}

export const MARKETING_PLANS: MarketingPlan[] = PLAN_LIST.map((p) => ({
  tier: p.tier,
  name: p.name,
  tagline: p.tagline,
  monthly: p.pricing.monthly,
  yearly: p.pricing.yearly,
  yearlySavingMonths: yearlySavingMonths(p.tier),
  features: p.features,
  featured: Boolean(p.featured),
  ctaLabel: p.tier === "free" ? "Start Free" : "Start Free Trial",
}));

export function priceFor(plan: MarketingPlan, interval: BillingInterval): number {
  return interval === "yearly" ? plan.yearly : plan.monthly;
}

export const TRIAL_POINTS: string[] = [
  "14-day free trial of every premium feature",
  "No credit card required",
  "Free migration included",
  "Cancel anytime",
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const PRICING_FAQ: FAQItem[] = [
  {
    question: "What is founding pricing?",
    answer:
      "Sign up during launch and your price is locked in for life. Even as we raise prices later, founding members keep their rate forever — across upgrades, downgrades, and renewals.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. The Free plan lets you manage one client and one project with the full client portal — no time limit, no card. Upgrade whenever you outgrow it.",
  },
  {
    question: "Do I need a credit card to start?",
    answer:
      "No. Start a 14-day trial of the full premium workspace without entering any payment details. When it ends, pick a plan or stay on Free.",
  },
  {
    question: "How does annual billing work?",
    answer:
      "Switch to yearly billing and get two months free — you pay for ten months and get twelve. You can change between monthly and yearly anytime.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Anytime, from your billing settings. Upgrades and downgrades are prorated automatically by Stripe, and your founding price is preserved.",
  },
  {
    question: "What happens to my data if I downgrade or cancel?",
    answer:
      "Nothing is deleted. Your workspace stays intact — you just regain access to everything the moment you upgrade again. Cancel anytime, no contracts.",
  },
  {
    question: "Do you help me migrate from another tool?",
    answer:
      "Yes — free migration assistance is included, and Agency customers get concierge onboarding with founder support.",
  },
  {
    question: "What counts as a team member?",
    answer:
      "Anyone you invite into your agency workspace. Your clients use the client portal and are never counted as team members.",
  },
];

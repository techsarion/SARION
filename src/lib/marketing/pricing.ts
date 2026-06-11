/**
 * Marketing pricing data (display only — decoupled from billing config in
 * src/config/plans.ts). Feature bullets are intentionally generic marketing
 * copy: they describe capabilities, not specific quotas, so we never imply
 * limits or functionality that the product doesn't actually enforce.
 */
export interface MarketingPlan {
  name: string;
  price: number;
  description: string;
  features: string[];
  featured?: boolean;
}

export const PLANS: MarketingPlan[] = [
  {
    name: "Starter",
    price: 29,
    description: "For solo operators getting organized.",
    features: ["Clients", "Projects", "Invoices", "Client Portal"],
  },
  {
    name: "Growth",
    price: 59,
    description: "For growing agencies with a team.",
    featured: true,
    features: [
      "Everything in Starter",
      "Team Collaboration",
      "Branded Portal",
      "Priority Support",
    ],
  },
  {
    name: "Agency",
    price: 99,
    description: "For established agencies at scale.",
    features: [
      "Everything in Growth",
      "Advanced Customization",
      "Priority Onboarding",
    ],
  },
];

export const TRIAL_POINTS: string[] = [
  "No credit card required",
  "Cancel anytime",
  "No long-term contracts",
];

export interface FAQItem {
  question: string;
  answer: string;
}

export const PRICING_FAQ: FAQItem[] = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes. Upgrade or downgrade at any time from your settings — changes take effect right away.",
  },
  {
    question: "What happens after the trial?",
    answer:
      "Your 14-day trial includes the full workspace. When it ends, choose a plan to keep going. Your data stays put while you decide.",
  },
  {
    question: "Do I need a credit card to start?",
    answer:
      "No. You can start your free trial without entering any payment details.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. There are no long-term contracts — cancel whenever you like and you won't be billed again.",
  },
  {
    question: "What counts as a team member?",
    answer:
      "Anyone you invite into your agency workspace — an owner or a member. Your clients use the client portal and are never counted as team members.",
  },
  {
    question: "How does billing work?",
    answer:
      "Plans are billed monthly per agency. You'll be charged when your trial ends, then on the same date each month. No long-term contracts.",
  },
];

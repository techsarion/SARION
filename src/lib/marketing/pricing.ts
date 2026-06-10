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
];

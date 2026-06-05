export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    priceId: process.env.STRIPE_PRICE_STARTER,
  },
  {
    id: "growth",
    name: "Growth",
    price: 59,
    priceId: process.env.STRIPE_PRICE_GROWTH,
  },
  {
    id: "agency",
    name: "Agency",
    price: 99,
    priceId: process.env.STRIPE_PRICE_AGENCY,
  },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireOwner } from "@/server/auth-context";
import { getAgency } from "@/server/data/agency";
import { isLemonConfigured } from "@/lib/lemonsqueezy";
import {
  PLANS,
  isPaidTier,
  BILLING_INTERVALS,
  type BillingInterval,
  type PaidPlanTier,
} from "@/config/plans";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout · Sarion",
  robots: { index: false, follow: false },
};

interface CheckoutPageProps {
  searchParams: Promise<{ tier?: string; interval?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const ctx = await requireOwner();

  // Billing must be configured, or there's nothing to sell.
  if (!isLemonConfigured()) redirect("/settings/billing");

  const { tier: tierParam, interval: intervalParam } = await searchParams;

  // Validate the requested tier — fall back to the billing page on anything odd.
  if (!tierParam || !isPaidTier(tierParam)) redirect("/settings/billing");
  const tier = tierParam as PaidPlanTier;

  const interval: BillingInterval = BILLING_INTERVALS.includes(
    intervalParam as BillingInterval,
  )
    ? (intervalParam as BillingInterval)
    : "monthly";

  const agency = await getAgency(ctx.agencyId);
  if (!agency) redirect("/settings/billing");

  return (
    <CheckoutForm
      plan={PLANS[tier]}
      tier={tier}
      agencyName={agency.name}
      agencyLogoUrl={agency.logoUrl}
      defaultName={ctx.name}
      accountEmail={ctx.email}
      defaultInterval={interval}
    />
  );
}

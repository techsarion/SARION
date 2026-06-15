import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireOwner } from "@/server/auth-context";
import { getAgencyBilling } from "@/server/data/agency";
import { getPlanUsage } from "@/server/services/plan-limits";
import { trialDaysLeft } from "@/config/plans";
import { isStripeConfigured } from "@/lib/stripe";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { BillingPanel } from "@/components/settings/billing-panel";
import { UsageSummary } from "@/components/settings/usage-summary";

export const metadata: Metadata = { title: "Billing · Sarion" };

export default async function BillingPage() {
  const { agencyId } = await requireOwner();
  const billing = await getAgencyBilling(agencyId);
  if (!billing) notFound();

  const usage = await getPlanUsage(agencyId);

  return (
    <PageWrapper title="Billing" description="Manage your Sarion subscription.">
      <div className="space-y-8">
        <UsageSummary usage={usage} />
        <BillingPanel
          billing={{
            planTier: billing.planTier,
            billingInterval: billing.billingInterval,
            foundingMember: billing.foundingMember,
            subscriptionStatus: billing.subscriptionStatus,
            stripeCustomerId: billing.stripeCustomerId,
            stripeSubscriptionId: billing.stripeSubscriptionId,
            trialDaysLeft: trialDaysLeft(billing, Date.now()),
          }}
          stripeConfigured={isStripeConfigured()}
        />
      </div>
    </PageWrapper>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireOwner } from "@/server/auth-context";
import { getAgencyBilling } from "@/server/data/agency";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { BillingPanel } from "@/components/settings/billing-panel";

export const metadata: Metadata = { title: "Billing · Sarion" };

export default async function BillingPage() {
  const { agencyId } = await requireOwner();
  const billing = await getAgencyBilling(agencyId);
  if (!billing) notFound();

  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <PageWrapper
      title="Billing"
      description="Manage your Sarion subscription."
    >
      <BillingPanel billing={billing} stripeConfigured={stripeConfigured} />
    </PageWrapper>
  );
}

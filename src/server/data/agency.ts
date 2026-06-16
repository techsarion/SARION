import "server-only";

import { db } from "@/lib/db";

/** Agency branding/profile for the authenticated agency. */
export async function getAgency(agencyId: string) {
  return db.agency.findUnique({
    where: { id: agencyId },
    select: { id: true, name: true, logoUrl: true, planTier: true },
  });
}

/** Agency billing info for the billing page. */
export async function getAgencyBilling(agencyId: string) {
  return db.agency.findUnique({
    where: { id: agencyId },
    select: {
      planTier: true,
      billingInterval: true,
      foundingMember: true,
      trialEndsAt: true,
      subscriptionStatus: true,
      lemonCustomerId: true,
      lemonSubscriptionId: true,
    },
  });
}

import "server-only";

import { db } from "@/lib/db";

/** Agency branding/profile for the authenticated agency. */
export async function getAgency(agencyId: string) {
  return db.agency.findUnique({
    where: { id: agencyId },
    select: { id: true, name: true, logoUrl: true, plan: true },
  });
}

/** Agency billing info for the billing page. */
export async function getAgencyBilling(agencyId: string) {
  return db.agency.findUnique({
    where: { id: agencyId },
    select: {
      plan: true,
      subscriptionStatus: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });
}

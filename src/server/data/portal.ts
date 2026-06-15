import "server-only";

import { db } from "@/lib/db";
import { logActivity } from "@/server/activity";
import { effectivePlanTier, getPlanLimits } from "@/config/plans";

/**
 * Portal reads are authenticated by the client's unguessable portalToken (not a
 * session). Everything is resolved FROM the token, so a client can only ever
 * see their own agency's data for their own record.
 */

export interface PortalProject {
  id: string;
  name: string;
  status: string;
  dueDate: Date | null;
  comments: {
    id: string;
    author: string;
    message: string;
    createdAt: Date;
  }[];
}

export interface PortalData {
  client: { id: string; agencyId: string; name: string };
  agency: { name: string; logoUrl: string | null };
  projects: PortalProject[];
  /** Whether to show the "Powered by Sarion" footer (Free plan only). */
  showPoweredBy: boolean;
}

export async function getPortalData(token: string): Promise<PortalData | null> {
  const client = await db.client.findFirst({
    where: { portalToken: token, deletedAt: null },
    select: {
      id: true,
      agencyId: true,
      name: true,
      agency: {
        select: {
          name: true,
          logoUrl: true,
          planTier: true,
          subscriptionStatus: true,
          trialEndsAt: true,
        },
      },
      projects: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          status: true,
          dueDate: true,
          portalComments: {
            orderBy: { createdAt: "asc" },
            select: { id: true, author: true, message: true, createdAt: true },
          },
        },
      },
    },
  });

  if (!client) return null;

  const { planTier, subscriptionStatus, trialEndsAt, ...agencyDisplay } =
    client.agency;
  const effectiveTier = effectivePlanTier(
    { planTier, subscriptionStatus, trialEndsAt },
    Date.now(),
  );

  return {
    client: { id: client.id, agencyId: client.agencyId, name: client.name },
    agency: agencyDisplay,
    projects: client.projects.map(({ portalComments, ...p }) => ({
      ...p,
      comments: portalComments,
    })),
    showPoweredBy: getPlanLimits(effectiveTier).poweredByBranding,
  };
}

const PORTAL_VIEW_THROTTLE_MS = 60 * 60 * 1000; // 1 hour

/**
 * Record a "Portal Viewed" activity, throttled to at most once per hour per
 * client so refreshes don't flood the feed (T7 PORTAL_VIEWED).
 */
export async function logPortalView(
  agencyId: string,
  clientId: string,
): Promise<void> {
  const since = new Date(Date.now() - PORTAL_VIEW_THROTTLE_MS);
  const recent = await db.activity.findFirst({
    where: { agencyId, clientId, type: "Portal Viewed", createdAt: { gt: since } },
    select: { id: true },
  });
  if (recent) return;

  await logActivity({
    agencyId,
    clientId,
    type: "Portal Viewed",
    description: "Client opened the portal.",
  });
}

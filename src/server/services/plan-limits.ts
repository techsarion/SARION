import "server-only";

import { db } from "@/lib/db";
import {
  effectivePlanTier,
  getPlan,
  type PlanLimits,
  type PlanTier,
} from "@/config/plans";

/**
 * Server-side plan-limit enforcement (single chokepoint).
 *
 * Every mutating action that creates a gated resource (clients, projects,
 * invoices, team members) calls `assertWithinLimit()` BEFORE writing. UI gating
 * is a nicety; this is the real guard. Limits are derived from the agency's
 * *effective* tier (trial → premium, expired → free) so they always reflect
 * what the customer is actually entitled to right now.
 */

export type GatedResource = "clients" | "projects" | "invoices" | "teamMembers";

const LIMIT_KEY: Record<GatedResource, keyof PlanLimits> = {
  clients: "maxClients",
  projects: "maxProjects",
  invoices: "maxInvoices",
  teamMembers: "maxTeamMembers",
};

const RESOURCE_LABEL: Record<GatedResource, string> = {
  clients: "client",
  projects: "project",
  invoices: "invoice",
  teamMembers: "team member",
};

export interface LimitCheck {
  ok: boolean;
  tier: PlanTier;
  limit: number | null;
  used: number;
  /** Upgrade-prompt message, present only when `ok` is false. */
  message?: string;
}

interface AgencyBilling {
  planTier: PlanTier;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
}

async function loadBilling(agencyId: string): Promise<AgencyBilling | null> {
  return db.agency.findUnique({
    where: { id: agencyId },
    select: { planTier: true, subscriptionStatus: true, trialEndsAt: true },
  });
}

/** Count the agency's current usage of a gated resource. */
async function countUsage(
  agencyId: string,
  resource: GatedResource,
): Promise<number> {
  switch (resource) {
    case "clients":
      return db.client.count({ where: { agencyId, deletedAt: null } });
    case "projects":
      return db.project.count({ where: { agencyId, deletedAt: null } });
    case "invoices":
      return db.invoice.count({ where: { agencyId, deletedAt: null } });
    case "teamMembers":
      // Members BEYOND the owner (owner is always free).
      return db.user.count({ where: { agencyId, role: "member" } });
  }
}

function buildMessage(
  resource: GatedResource,
  limit: number,
  tier: PlanTier,
): string {
  const noun = RESOURCE_LABEL[resource];
  const planName = getPlan(tier).name;
  if (limit === 0) {
    return `Your ${planName} plan doesn't include ${noun}s. Upgrade to add ${noun}s.`;
  }
  const plural = limit === 1 ? noun : `${noun}s`;
  return `You've reached the ${limit} ${plural} limit on the ${planName} plan. Upgrade to add more.`;
}

/**
 * Check whether the agency may create one more of `resource`. Pure check — does
 * not throw. Returns the limit/usage so callers can surface rich messaging.
 */
export async function checkLimit(
  agencyId: string,
  resource: GatedResource,
  now: number = Date.now(),
): Promise<LimitCheck> {
  const billing = await loadBilling(agencyId);
  const tier = billing
    ? effectivePlanTier(billing, now)
    : ("free" as PlanTier);
  const limit = getPlan(tier).limits[LIMIT_KEY[resource]] as number | null;

  // null = unlimited.
  if (limit === null) {
    return { ok: true, tier, limit: null, used: 0 };
  }

  const used = await countUsage(agencyId, resource);
  if (used < limit) return { ok: true, tier, limit, used };

  return {
    ok: false,
    tier,
    limit,
    used,
    message: buildMessage(resource, limit, tier),
  };
}

export class PlanLimitError extends Error {
  constructor(
    message: string,
    readonly check: LimitCheck,
  ) {
    super(message);
    this.name = "PlanLimitError";
  }
}

/**
 * Throwing variant for use at the top of create actions. Catch `PlanLimitError`
 * (or check `result.code === "limit"`) to render the upgrade prompt.
 */
export async function assertWithinLimit(
  agencyId: string,
  resource: GatedResource,
  now: number = Date.now(),
): Promise<void> {
  const check = await checkLimit(agencyId, resource, now);
  if (!check.ok) {
    throw new PlanLimitError(check.message ?? "Plan limit reached.", check);
  }
}

/** Full usage snapshot for the billing/settings UI. */
export interface PlanUsage {
  tier: PlanTier;
  limits: PlanLimits;
  used: Record<GatedResource, number>;
}

export async function getPlanUsage(
  agencyId: string,
  now: number = Date.now(),
): Promise<PlanUsage> {
  const billing = await loadBilling(agencyId);
  const tier = billing
    ? effectivePlanTier(billing, now)
    : ("free" as PlanTier);

  const [clients, projects, invoices, teamMembers] = await Promise.all([
    countUsage(agencyId, "clients"),
    countUsage(agencyId, "projects"),
    countUsage(agencyId, "invoices"),
    countUsage(agencyId, "teamMembers"),
  ]);

  return {
    tier,
    limits: getPlan(tier).limits,
    used: { clients, projects, invoices, teamMembers },
  };
}

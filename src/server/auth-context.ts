import "server-only";

import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

export interface AgencyContext {
  userId: string;
  agencyId: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Resolve the authenticated agency context for server components and actions.
 * Redirects to /login if there is no valid session. `agencyId` is the single
 * source of truth for tenant isolation — always scope queries by it.
 */
export async function requireAgency(): Promise<AgencyContext> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // agencyId is always assigned at signup via the Better Auth create hook;
  // guard the loosely-typed additional field so callers get a non-null string.
  const agencyId = session.user.agencyId;
  if (!agencyId) {
    redirect("/login");
  }

  return {
    userId: session.user.id,
    agencyId,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role ?? "member",
  };
}

/**
 * Like requireAgency(), but additionally enforces that the caller is the agency
 * owner. Members are redirected to /dashboard. Use at the top of owner-only
 * routes (e.g. /team, /settings, /billing) so access control lives in one
 * place rather than being re-implemented per page.
 */
export async function requireOwner(): Promise<AgencyContext> {
  const ctx = await requireAgency();
  if (ctx.role !== "owner") {
    redirect("/dashboard");
  }
  return ctx;
}

/**
 * Future-ready subscription gate. Call at the top of feature routes once
 * billing is enforced. Currently built but NOT wired to any route — agencies on
 * trial or active plans pass through; canceled/past_due plans redirect to
 * /settings/billing so the owner can resubscribe.
 *
 * Usage (when ready to enforce):
 *   const ctx = await requireActiveSubscription();
 */
export async function requireActiveSubscription(): Promise<AgencyContext> {
  const ctx = await requireAgency();

  const { db } = await import("@/lib/db");
  const agency = await db.agency.findUnique({
    where: { id: ctx.agencyId },
    select: { subscriptionStatus: true },
  });

  const active = ["active", "trialing"].includes(agency?.subscriptionStatus ?? "");
  if (!active) {
    redirect("/settings/billing");
  }

  return ctx;
}

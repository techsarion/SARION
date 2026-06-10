import "server-only";

import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

export interface AgencyContext {
  userId: string;
  agencyId: string;
  name: string;
  email: string;
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
  };
}

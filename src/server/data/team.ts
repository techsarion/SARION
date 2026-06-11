import "server-only";

import { db } from "@/lib/db";

/** Tenant-isolated team reads — always scoped by agencyId. */

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: Date;
}

export interface PendingInvite {
  id: string;
  name: string;
  email: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

export async function listTeamMembers(agencyId: string): Promise<TeamMember[]> {
  const users = await db.user.findMany({
    where: { agencyId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    joinedAt: u.createdAt,
  }));
}

export type PublicInvite =
  | { status: "valid"; email: string; agencyName: string }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "accepted" };

/**
 * Resolve an invite token for the public signup page. Returns just enough to
 * prefill the email and render a friendly message — no agency internals beyond
 * the display name. Used to gate invite acceptance by token possession.
 */
export async function getPublicInvite(token: string): Promise<PublicInvite> {
  const invite = await db.teamInvite.findUnique({
    where: { token },
    select: {
      email: true,
      acceptedAt: true,
      expiresAt: true,
      agency: { select: { name: true } },
    },
  });

  if (!invite) return { status: "invalid" };
  if (invite.acceptedAt) return { status: "accepted" };
  if (invite.expiresAt <= new Date()) return { status: "expired" };
  return { status: "valid", email: invite.email, agencyName: invite.agency.name };
}

/** Outstanding (un-accepted, un-expired) invites for the agency. */
export async function listPendingInvites(
  agencyId: string,
): Promise<PendingInvite[]> {
  return db.teamInvite.findMany({
    where: { agencyId, acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      token: true,
      createdAt: true,
      expiresAt: true,
    },
  });
}

import "server-only";

import { db } from "@/lib/db";

/**
 * All functions here REQUIRE an agencyId and filter by it — tenant isolation is
 * enforced at the data layer so no caller can accidentally cross agencies.
 */

export interface ClientListItem {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  createdAt: Date;
  projectCount: number;
}

/** Active (non-archived) clients for an agency, optionally filtered by search. */
export async function listClients(
  agencyId: string,
  search?: string,
): Promise<ClientListItem[]> {
  const term = search?.trim();
  const clients = await db.client.findMany({
    where: {
      agencyId,
      deletedAt: null,
      ...(term
        ? {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { company: { contains: term, mode: "insensitive" } },
              { email: { contains: term, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      createdAt: true,
      _count: { select: { projects: { where: { deletedAt: null } } } },
    },
  });

  return clients.map(({ _count, ...c }) => ({
    ...c,
    projectCount: _count.projects,
  }));
}

export interface ArchivedClientItem {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  archivedAt: Date;
}

/** Archived (soft-deleted) clients for an agency — newest archive first. */
export async function listArchivedClients(
  agencyId: string,
): Promise<ArchivedClientItem[]> {
  const clients = await db.client.findMany({
    where: { agencyId, deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      deletedAt: true,
    },
  });

  return clients.map(({ deletedAt, ...c }) => ({
    ...c,
    archivedAt: deletedAt as Date,
  }));
}

/** A single active client owned by the agency, with its recent activity. */
export async function getClient(agencyId: string, clientId: string) {
  return db.client.findFirst({
    where: { id: clientId, agencyId, deletedAt: null },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

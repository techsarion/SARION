import "server-only";

import { db } from "@/lib/db";

/**
 * All functions REQUIRE an agencyId and filter by it — tenant isolation is
 * enforced at the data layer so no caller can cross agencies. Mirrors
 * src/server/data/clients.ts.
 */

export interface ProjectListItem {
  id: string;
  name: string;
  status: string;
  dueDate: Date | null;
  createdAt: Date;
  clientName: string;
}

/** Active (non-archived) projects for an agency, optionally filtered by search. */
export async function listProjects(
  agencyId: string,
  search?: string,
): Promise<ProjectListItem[]> {
  const term = search?.trim();
  const projects = await db.project.findMany({
    where: {
      agencyId,
      deletedAt: null,
      ...(term
        ? {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { client: { name: { contains: term, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      dueDate: true,
      createdAt: true,
      client: { select: { name: true } },
    },
  });

  return projects.map(({ client, ...p }) => ({
    ...p,
    clientName: client.name,
  }));
}

/** A single active project owned by the agency, with client + recent activity. */
export async function getProject(agencyId: string, projectId: string) {
  return db.project.findFirst({
    where: { id: projectId, agencyId, deletedAt: null },
    include: {
      client: { select: { id: true, name: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

/** Project activity trail (newest first), agency-scoped. */
export async function getProjectActivity(agencyId: string, projectId: string) {
  return db.activity.findMany({
    where: { agencyId, projectId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

/** Active clients (id + name) for the project form's client dropdown. */
export async function getClientOptions(agencyId: string) {
  return db.client.findMany({
    where: { agencyId, deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

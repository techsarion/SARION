import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * Human-readable activity types (kept as display strings for consistency with
 * the existing F3/F4/F6 trail and the badge maps that render them). Day 6 adds
 * team + portal events. Most events are client-scoped; agency-level events
 * (e.g. "Team Member Invited") omit clientId.
 */
export type ActivityType =
  | "Client Created"
  | "Client Updated"
  | "Note Added"
  | "Client Archived"
  | "Project Created"
  | "Project Updated"
  | "Status Changed"
  | "Project Archived"
  | "Invoice Created"
  | "Invoice Updated"
  | "Invoice Paid"
  | "Invoice Unpaid"
  | "Invoice Archived"
  | "Team Member Invited"
  | "Team Member Joined"
  | "Invite Cancelled"
  | "Portal Comment"
  | "Portal Viewed";

interface LogActivityInput {
  agencyId: string;
  /** Set for client-scoped events; omitted for agency-level events. */
  clientId?: string;
  /** Set for project-scoped events. */
  projectId?: string;
  type: ActivityType;
  description: string;
}

/** Prisma client or an interactive transaction client. */
type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Append a row to the activity trail. Pass a transaction client to record the
 * activity atomically with its triggering mutation.
 */
export async function logActivity(
  input: LogActivityInput,
  client: DbClient = db,
): Promise<void> {
  await client.activity.create({ data: input });
}

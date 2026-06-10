import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";

import { db } from "@/lib/db";

export type ActivityType =
  | "Client Created"
  | "Client Updated"
  | "Note Added"
  | "Client Archived";

interface LogActivityInput {
  agencyId: string;
  clientId: string;
  type: ActivityType;
  description: string;
}

/** Prisma client or an interactive transaction client. */
type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Append a row to the client activity trail. Pass a transaction client to
 * record the activity atomically with its triggering mutation.
 */
export async function logActivity(
  input: LogActivityInput,
  client: DbClient = db,
): Promise<void> {
  await client.activity.create({ data: input });
}

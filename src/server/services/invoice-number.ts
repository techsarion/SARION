import "server-only";

import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

const PREFIX = "INV-";
const PAD = 4; // INV-0001

/**
 * Generate the next sequential invoice number for an agency (INV-0001, …).
 *
 * Server-side only and never user-editable. The sequence lives on
 * Agency.invoiceSequence and is incremented ATOMICALLY: the UPDATE acquires a
 * row lock on the agency, so concurrent invoice creation serialises and can
 * never hand out the same number twice (no lexicographic sorting, multi-user
 * safe). Pass the surrounding transaction client so the increment and the
 * dependent invoice insert commit together.
 *
 * invoiceSequence stores the NEXT number to assign (default 1 → first invoice
 * is INV-0001). We read the post-increment value and subtract one to recover
 * the number to use for this invoice.
 */
export async function generateInvoiceNumber(
  agencyId: string,
  client: DbClient,
): Promise<string> {
  const agency = await client.agency.update({
    where: { id: agencyId },
    data: { invoiceSequence: { increment: 1 } },
    select: { invoiceSequence: true },
  });

  const seq = agency.invoiceSequence - 1;
  return `${PREFIX}${String(seq).padStart(PAD, "0")}`;
}

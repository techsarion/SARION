import "server-only";

import { db } from "@/lib/db";
import { logActivity } from "@/server/activity";
import { generateInvoiceNumber } from "@/server/services/invoice-number";

/**
 * Seed a starter workspace (one client, project, and invoice) the first time an
 * agency is used, so no owner ever lands on an empty app (F8 onboarding).
 *
 * Idempotent and race-safe: the seed is "claimed" with a conditional
 * updateMany (WHERE seeded = false) inside a transaction. That UPDATE takes a
 * row lock on the agency, so concurrent first-loads serialise and exactly one
 * caller proceeds — every other sees count === 0 and returns immediately.
 */
export async function ensureWorkspaceSeeded(agencyId: string): Promise<void> {
  // Cheap pre-check to avoid opening a transaction on every dashboard load.
  const agency = await db.agency.findUnique({
    where: { id: agencyId },
    select: { seeded: true },
  });
  if (!agency || agency.seeded) return;

  await db.$transaction(async (tx) => {
    const claim = await tx.agency.updateMany({
      where: { id: agencyId, seeded: false },
      data: { seeded: true },
    });
    if (claim.count === 0) return; // lost the race — another load is seeding

    const client = await tx.client.create({
      data: {
        agencyId,
        name: "Acme Marketing",
        company: "Acme Inc.",
        email: "hello@acme.example",
      },
    });
    await logActivity(
      {
        agencyId,
        clientId: client.id,
        type: "Client Created",
        description: `Client "${client.name}" was created.`,
      },
      tx,
    );

    const project = await tx.project.create({
      data: {
        agencyId,
        clientId: client.id,
        name: "Website Redesign",
        status: "ACTIVE",
        description: "Sample project to get you started.",
      },
    });
    await logActivity(
      {
        agencyId,
        clientId: client.id,
        projectId: project.id,
        type: "Project Created",
        description: `Project "${project.name}" was created.`,
      },
      tx,
    );

    const number = await generateInvoiceNumber(agencyId, tx);
    await tx.invoice.create({
      data: {
        agencyId,
        clientId: client.id,
        number,
        status: "unpaid",
        total: 1500,
        items: {
          create: [
            {
              agencyId,
              description: "Initial design retainer",
              qty: 1,
              unitPrice: 1500,
              lineTotal: 1500,
            },
          ],
        },
      },
    });
    await logActivity(
      {
        agencyId,
        clientId: client.id,
        type: "Invoice Created",
        description: `Invoice ${number} was created ($1,500.00).`,
      },
      tx,
    );
  });
}

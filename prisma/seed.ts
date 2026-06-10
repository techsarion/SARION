/**
 * Onboarding seed — creates demo data so the app is never empty.
 * Idempotent: safe to run repeatedly. Run with: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Attach demo data to the first existing agency (created at signup).
  const agency = await prisma.agency.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!agency) {
    console.log("No agency found — sign up first, then re-run the seed.");
    return;
  }

  const existing = await prisma.client.findFirst({
    where: { agencyId: agency.id, name: "Acme Marketing", deletedAt: null },
  });
  if (existing) {
    console.log("Demo client already exists — nothing to seed.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    const client = await tx.client.create({
      data: {
        agencyId: agency.id,
        name: "Acme Marketing",
        company: "Acme Marketing",
        email: "hello@acme.com",
      },
    });
    await tx.activity.create({
      data: {
        agencyId: agency.id,
        clientId: client.id,
        type: "Client Created",
        description: `Client "${client.name}" was created.`,
      },
    });
    console.log(`Seeded demo client: ${client.name} (${client.id})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

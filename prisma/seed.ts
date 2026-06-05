/**
 * Onboarding seed — creates demo data so the app is never empty.
 * Per docs/MVP-PRD.md §9. Run with: pnpm db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // TODO: implement demo agency + client + project + invoice seed.
  console.log("Seed placeholder — implement on Day 6 (onboarding).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

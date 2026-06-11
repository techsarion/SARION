-- Day 6 — Dashboard, Team Invites, Portal Comments, Onboarding, Invoice Sequence
-- Idempotent where practical so re-runs in dev are safe.

-- ----------------------------------------------------------------------------
-- T1 — Per-agency invoice sequence + T8 onboarding seed flag
-- ----------------------------------------------------------------------------
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "invoiceSequence" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "seeded" BOOLEAN NOT NULL DEFAULT false;

-- Backfill the sequence from existing invoice numbers so newly generated
-- numbers never collide with historical ones. invoiceSequence holds the NEXT
-- number to assign, so it is max(existing suffix) + 1.
UPDATE "Agency" a
SET "invoiceSequence" = sub.maxseq + 1
FROM (
  SELECT "agencyId",
         MAX(CAST(SUBSTRING("number" FROM '[0-9]+$') AS INTEGER)) AS maxseq
  FROM "Invoice"
  WHERE "number" LIKE 'INV-%'
  GROUP BY "agencyId"
) sub
WHERE a.id = sub."agencyId" AND sub.maxseq IS NOT NULL;

-- Established workspaces (already have a client) must not be re-seeded.
UPDATE "Agency"
SET "seeded" = true
WHERE EXISTS (SELECT 1 FROM "Client" c WHERE c."agencyId" = "Agency".id);

-- ----------------------------------------------------------------------------
-- T7 — Activity supports agency-level events (nullable clientId)
-- ----------------------------------------------------------------------------
ALTER TABLE "Activity" ALTER COLUMN "clientId" DROP NOT NULL;

-- Swap the agency index to a (agencyId, createdAt) composite for the feed.
DROP INDEX IF EXISTS "Activity_agencyId_idx";
CREATE INDEX IF NOT EXISTS "Activity_agencyId_createdAt_idx"
  ON "Activity"("agencyId", "createdAt");

-- ----------------------------------------------------------------------------
-- T3 — TeamInvite
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "TeamInvite" (
  "id"         TEXT NOT NULL,
  "agencyId"   TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "email"      TEXT NOT NULL,
  "token"      TEXT NOT NULL,
  "role"       "Role" NOT NULL DEFAULT 'member',
  "expiresAt"  TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeamInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TeamInvite_token_key" ON "TeamInvite"("token");
CREATE INDEX IF NOT EXISTS "TeamInvite_agencyId_idx" ON "TeamInvite"("agencyId");
CREATE INDEX IF NOT EXISTS "TeamInvite_email_idx" ON "TeamInvite"("email");

ALTER TABLE "TeamInvite" DROP CONSTRAINT IF EXISTS "TeamInvite_agencyId_fkey";
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------------------------------------------------------
-- T4 — PortalComment
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "PortalComment" (
  "id"        TEXT NOT NULL,
  "agencyId"  TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "author"    TEXT NOT NULL,
  "message"   TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PortalComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PortalComment_projectId_createdAt_idx"
  ON "PortalComment"("projectId", "createdAt");
CREATE INDEX IF NOT EXISTS "PortalComment_agencyId_idx" ON "PortalComment"("agencyId");

ALTER TABLE "PortalComment" DROP CONSTRAINT IF EXISTS "PortalComment_agencyId_fkey";
ALTER TABLE "PortalComment" ADD CONSTRAINT "PortalComment_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PortalComment" DROP CONSTRAINT IF EXISTS "PortalComment_projectId_fkey";
ALTER TABLE "PortalComment" ADD CONSTRAINT "PortalComment_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

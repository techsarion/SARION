-- Incremental migration: schema hardening (run AFTER 0_init).
-- All statements are additive and non-destructive — safe on a populated DB.
-- New audit columns use DEFAULT CURRENT_TIMESTAMP so existing rows backfill.

-- AlterTable: Client — audit + soft delete
ALTER TABLE "Client"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable: Project — audit + soft delete
ALTER TABLE "Project"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable: Task — audit
ALTER TABLE "Task"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: Invoice — audit + soft delete
ALTER TABLE "Invoice"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable: InvoiceItem — audit
ALTER TABLE "InvoiceItem"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: Comment — audit
ALTER TABLE "Comment"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Invoice numbers are unique per agency (not globally)
CREATE UNIQUE INDEX "Invoice_agencyId_number_key" ON "Invoice"("agencyId", "number");

-- Dashboard query indexes
CREATE INDEX "Project_agencyId_status_idx" ON "Project"("agencyId", "status");
CREATE INDEX "Invoice_agencyId_status_dueDate_idx" ON "Invoice"("agencyId", "status", "dueDate");

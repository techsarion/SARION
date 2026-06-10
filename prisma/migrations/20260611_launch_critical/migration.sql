-- ============================================================================
-- Sarion — LAUNCH-CRITICAL migration (run AFTER 0_init + 20260610_schema_hardening)
-- ----------------------------------------------------------------------------
-- Safe to run on a populated production database:
--   * every statement is additive or a delete-behavior change (no data is dropped)
--   * idempotent (IF NOT EXISTS / DROP CONSTRAINT IF EXISTS) — re-running is safe
--   * wrapped in a single transaction — all-or-nothing
-- Validated against the live database via a rolled-back transaction before delivery.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- P1-A — Protect financial records: deleting a Client must NOT destroy invoices
-- ----------------------------------------------------------------------------
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_clientId_fkey";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ----------------------------------------------------------------------------
-- P2-B — Agency.updatedAt (only table missing it)
-- ----------------------------------------------------------------------------
ALTER TABLE "Agency"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ----------------------------------------------------------------------------
-- P2-A — Direct tenant ownership on child tables (Task / InvoiceItem / Comment)
--        Removes cross-tenant leak risk and makes future RLS trivial.
--        Backfilled from the parent row, then made NOT NULL.
-- ----------------------------------------------------------------------------

-- Task ← Project.agencyId
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "agencyId" TEXT;
UPDATE "Task" t SET "agencyId" = p."agencyId"
  FROM "Project" p WHERE t."projectId" = p."id" AND t."agencyId" IS NULL;
ALTER TABLE "Task" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_agencyId_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "Task_agencyId_idx" ON "Task"("agencyId");

-- InvoiceItem ← Invoice.agencyId
ALTER TABLE "InvoiceItem" ADD COLUMN IF NOT EXISTS "agencyId" TEXT;
UPDATE "InvoiceItem" ii SET "agencyId" = i."agencyId"
  FROM "Invoice" i WHERE ii."invoiceId" = i."id" AND ii."agencyId" IS NULL;
ALTER TABLE "InvoiceItem" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "InvoiceItem" DROP CONSTRAINT IF EXISTS "InvoiceItem_agencyId_fkey";
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "InvoiceItem_agencyId_idx" ON "InvoiceItem"("agencyId");

-- Comment ← Client.agencyId
ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "agencyId" TEXT;
UPDATE "Comment" c SET "agencyId" = cl."agencyId"
  FROM "Client" cl WHERE c."clientId" = cl."id" AND c."agencyId" IS NULL;
ALTER TABLE "Comment" ALTER COLUMN "agencyId" SET NOT NULL;
ALTER TABLE "Comment" DROP CONSTRAINT IF EXISTS "Comment_agencyId_fkey";
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "Comment_agencyId_idx" ON "Comment"("agencyId");

-- ----------------------------------------------------------------------------
-- P2-C — Soft-delete partial indexes (keep active-row queries fast)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "Client_agencyId_active_idx"
  ON "Client"("agencyId") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "Project_agencyId_active_idx"
  ON "Project"("agencyId") WHERE "deletedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "Invoice_agencyId_active_idx"
  ON "Invoice"("agencyId") WHERE "deletedAt" IS NULL;

-- ----------------------------------------------------------------------------
-- P2-D — Financial integrity CHECK constraints
-- ----------------------------------------------------------------------------
ALTER TABLE "InvoiceItem" DROP CONSTRAINT IF EXISTS "InvoiceItem_qty_positive";
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_qty_positive" CHECK ("qty" > 0);

ALTER TABLE "InvoiceItem" DROP CONSTRAINT IF EXISTS "InvoiceItem_unitPrice_nonneg";
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_unitPrice_nonneg" CHECK ("unitPrice" >= 0);

ALTER TABLE "InvoiceItem" DROP CONSTRAINT IF EXISTS "InvoiceItem_lineTotal_nonneg";
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_lineTotal_nonneg" CHECK ("lineTotal" >= 0);

ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_total_nonneg";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_total_nonneg" CHECK ("total" >= 0);

COMMIT;

-- ============================================================================
-- ⚠️  DO NOT RUN THE SECTION BELOW YET — DATABASE-LEVEL RLS (defense in depth)
-- ----------------------------------------------------------------------------
-- Your app connects as the table-owner role, which BYPASSES RLS unless FORCE is
-- on. Turning this on REQUIRES the app to first run, inside every request's
-- transaction:
--     SELECT set_config('app.agency_id', '<agencyId from session>', true);
-- Until that wiring ships, enabling the policies below will make EVERY app query
-- return zero rows and break inserts. Apply this ONLY after the app sets the GUC.
--
-- BEGIN;
-- DO $$ DECLARE t text;
-- BEGIN
--   FOREACH t IN ARRAY ARRAY['Client','Project','Invoice','InvoiceItem','Task','Comment','User'] LOOP
--     EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', t);
--     EXECUTE format($f$CREATE POLICY tenant_isolation ON %I
--       USING ("agencyId" = current_setting('app.agency_id', true))
--       WITH CHECK ("agencyId" = current_setting('app.agency_id', true));$f$, t);
--   END LOOP;
-- END $$;
-- COMMIT;
-- ============================================================================

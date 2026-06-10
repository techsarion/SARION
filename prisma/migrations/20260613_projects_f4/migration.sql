-- F4 Project Management — schema reconciliation.
-- Safe: Project table is empty; all statements run in one transaction.

-- 1. Rename Project.title -> name
ALTER TABLE "Project" RENAME COLUMN "title" TO "name";

-- 2. Add optional startDate
ALTER TABLE "Project" ADD COLUMN "startDate" TIMESTAMP(3);

-- 3. Migrate ProjectStatus enum: not_started/in_progress/review/done -> PLANNED/ACTIVE/COMPLETED/ON_HOLD
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD');
ALTER TABLE "Project" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "status" TYPE "ProjectStatus" USING (
  CASE "status"::text
    WHEN 'not_started' THEN 'PLANNED'
    WHEN 'in_progress' THEN 'ACTIVE'
    WHEN 'review'      THEN 'ACTIVE'
    WHEN 'done'        THEN 'COMPLETED'
    ELSE 'PLANNED'
  END::"ProjectStatus"
);
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'PLANNED';
DROP TYPE "ProjectStatus_old";

-- 4. Activity gains optional projectId (project activity trail)
ALTER TABLE "Activity" ADD COLUMN "projectId" TEXT;
CREATE INDEX "Activity_projectId_createdAt_idx" ON "Activity"("projectId", "createdAt");
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- In-app feedback system: feature requests, bug reports, and general feedback
-- submitted by authenticated users and reviewed by agency owners.

-- 1. Enums --------------------------------------------------------------------
CREATE TYPE "FeedbackType" AS ENUM ('feature_request', 'bug_report', 'general');
CREATE TYPE "FeedbackStatus" AS ENUM ('open', 'in_review', 'planned', 'completed', 'declined');

-- 2. Feedback table -----------------------------------------------------------
CREATE TABLE "Feedback" (
  "id"          TEXT NOT NULL,
  "agencyId"    TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "type"        "FeedbackType"   NOT NULL DEFAULT 'general',
  "title"       TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status"      "FeedbackStatus" NOT NULL DEFAULT 'open',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Feedback_agencyId_createdAt_idx" ON "Feedback"("agencyId", "createdAt");
CREATE INDEX "Feedback_status_idx" ON "Feedback"("status");

-- 3. Foreign keys -------------------------------------------------------------
ALTER TABLE "Feedback"
  ADD CONSTRAINT "Feedback_agencyId_fkey"
  FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Feedback"
  ADD CONSTRAINT "Feedback_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

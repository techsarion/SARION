-- CreateEnum
CREATE TYPE "MaturityLevel" AS ENUM ('FIREFIGHTING', 'STITCHED', 'COORDINATED', 'OPERATING_SYSTEM');

-- CreateTable
CREATE TABLE "ScorecardSession" (
    "id" TEXT NOT NULL,
    "anonId" TEXT NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "calibration" JSONB NOT NULL DEFAULT '{}',
    "overallScore" INTEGER,
    "pillarScores" JSONB,
    "maturity" "MaturityLevel",
    "revenueLeakYear" INTEGER,
    "timeLostHours" DOUBLE PRECISION,
    "recommendations" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScorecardSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorecardLead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT NOT NULL,
    "reportUrl" TEXT,
    "convertedAgencyId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScorecardLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScorecardSession_anonId_idx" ON "ScorecardSession"("anonId");

-- CreateIndex
CREATE INDEX "ScorecardSession_completedAt_idx" ON "ScorecardSession"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ScorecardLead_sessionId_key" ON "ScorecardLead"("sessionId");

-- CreateIndex
CREATE INDEX "ScorecardLead_email_idx" ON "ScorecardLead"("email");

-- CreateIndex
CREATE INDEX "ScorecardLead_convertedAgencyId_idx" ON "ScorecardLead"("convertedAgencyId");

-- AddForeignKey
ALTER TABLE "ScorecardLead" ADD CONSTRAINT "ScorecardLead_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ScorecardSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

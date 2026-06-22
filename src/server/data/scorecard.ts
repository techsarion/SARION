import "server-only";

import { db } from "@/lib/db";
import {
  computeScorecard,
  type ScorecardAnswers,
  type ScorecardCalibration,
  type ScorecardResult,
} from "@/server/services/scorecard";

/**
 * Read layer for the public scorecard funnel. Unlike the rest of the app these
 * queries are NOT tenant-scoped — the scorecard is anonymous by design and its
 * two tables hold no workspace data (see prisma/schema.prisma block comment).
 */

export interface ScorecardView {
  id: string;
  completedAt: Date | null;
  /** Recomputed from stored answers so it always matches current config. */
  result: ScorecardResult | null;
  /** True once a lead (email) has been captured for this session. */
  unlocked: boolean;
}

/** Coerce the JSON columns to the engine's input types. */
function asAnswers(value: unknown): ScorecardAnswers {
  return (value && typeof value === "object" ? value : {}) as ScorecardAnswers;
}
function asCalibration(value: unknown): ScorecardCalibration {
  return (value && typeof value === "object" ? value : {}) as ScorecardCalibration;
}

/**
 * Load a session for the results/report pages. Returns null for unknown ids.
 * The full result is recomputed from the stored answers (the engine is pure and
 * cheap), guaranteeing the page reflects the current scoring config.
 */
export async function getScorecardView(id: string): Promise<ScorecardView | null> {
  const session = await db.scorecardSession.findUnique({
    where: { id },
    select: {
      id: true,
      answers: true,
      calibration: true,
      completedAt: true,
      lead: { select: { id: true } },
    },
  });
  if (!session) return null;

  const result = session.completedAt
    ? computeScorecard({
        answers: asAnswers(session.answers),
        calibration: asCalibration(session.calibration),
      })
    : null;

  return {
    id: session.id,
    completedAt: session.completedAt,
    result,
    unlocked: Boolean(session.lead),
  };
}

/**
 * Scorecard scoring engine — pure, deterministic, dependency-free.
 *
 * No database, no I/O, no framework imports: every function takes plain data and
 * returns plain data, so the whole engine is trivially unit-testable and safe to
 * run in any runtime (server action, RSC, edge, a script, a test). All numbers
 * and copy come from src/config/scorecard.ts — this file only computes.
 *
 * Public API:
 *   • calculatePillarScores(answers)   → per-pillar 0–100
 *   • calculateOverallScore(pillars)   → weighted 0–100
 *   • calculateMaturityLevel(score)    → MaturityDefinition
 *   • calculateRevenueLeakage(answers, calibration) → { monthly, yearly, breakdown }
 *   • calculateTimeLoss(answers, calibration)       → { hoursPerWeek, valuePerMonth, breakdown }
 *   • generateRecommendations(answers, …)           → prioritized RecommendationResult[]
 *   • computeScorecard(input)          → the full result bundle (one call)
 */

import {
  CURRENCY,
  MATURITY_LEVELS,
  PILLARS,
  PILLAR_ORDER,
  QUESTIONS,
  QUESTION_BY_ID,
  RECOMMENDATIONS,
  REVENUE_BAND_BY_ID,
  WEEKS_PER_MONTH,
  type MaturityDefinition,
  type PillarKey,
  type QuestionOption,
  type RecommendationId,
} from "@/config/scorecard";

// ── Inputs ──────────────────────────────────────────────────────────────────

/** Map of questionId → chosen optionId. */
export type ScorecardAnswers = Record<string, string>;

export interface ScorecardCalibration {
  teamSize?: string;
  revenueBand?: string;
  /** Optional override of the band's default blended hourly rate. */
  billableRate?: number;
}

// ── Outputs ─────────────────────────────────────────────────────────────────

export type PillarScores = Record<PillarKey, number>;

export interface RevenueBreakdownItem {
  questionId: string;
  label: string;
  monthly: number;
}

export interface RevenueLeakage {
  monthly: number;
  yearly: number;
  breakdown: RevenueBreakdownItem[];
}

export interface TimeBreakdownItem {
  questionId: string;
  label: string;
  hoursPerWeek: number;
}

export interface TimeLoss {
  hoursPerWeek: number;
  /** Monetary value of that time per month, using the blended rate. */
  valuePerMonth: number;
  breakdown: TimeBreakdownItem[];
}

export interface RecommendationResult {
  id: RecommendationId;
  pillar: PillarKey;
  problem: string;
  fix: string;
  feature: string;
  href: string;
  /** Estimated annual £ impact, used to prioritize. */
  estimatedAnnualImpact: number;
}

export interface ScorecardResult {
  overallScore: number;
  pillarScores: PillarScores;
  maturity: MaturityDefinition;
  revenue: RevenueLeakage;
  time: TimeLoss;
  recommendations: RecommendationResult[];
  /** Convenience: the weakest pillar (lowest score), for headline + onboarding. */
  weakestPillar: PillarKey;
  currency: typeof CURRENCY;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function optionFor(questionId: string, answers: ScorecardAnswers): QuestionOption | null {
  const q = QUESTION_BY_ID[questionId];
  if (!q) return null;
  const optionId = answers[questionId];
  return q.options.find((o) => o.id === optionId) ?? null;
}

function resolveRate(calibration: ScorecardCalibration): number {
  if (typeof calibration.billableRate === "number" && calibration.billableRate > 0) {
    return calibration.billableRate;
  }
  const band = calibration.revenueBand
    ? REVENUE_BAND_BY_ID[calibration.revenueBand]
    : undefined;
  return band?.defaultRate ?? 60;
}

function resolveMonthlyRevenue(calibration: ScorecardCalibration): number {
  const band = calibration.revenueBand
    ? REVENUE_BAND_BY_ID[calibration.revenueBand]
    : undefined;
  return band?.monthlyMidpoint ?? 10000;
}

const round = (n: number) => Math.round(n);

// ── Scoring ─────────────────────────────────────────────────────────────────

/**
 * Per-pillar score on a 0–100 scale. Each answered question contributes its
 * option's `points` (0–10); the pillar score is the mean of its answered
 * questions scaled ×10. Unanswered questions are ignored so partial results
 * still produce a sensible score.
 */
export function calculatePillarScores(answers: ScorecardAnswers): PillarScores {
  const sums: Record<PillarKey, { total: number; count: number }> = {
    A: { total: 0, count: 0 },
    B: { total: 0, count: 0 },
    C: { total: 0, count: 0 },
    D: { total: 0, count: 0 },
  };

  for (const q of QUESTIONS) {
    const option = optionFor(q.id, answers);
    if (!option) continue;
    sums[q.pillar].total += option.points;
    sums[q.pillar].count += 1;
  }

  const scores = {} as PillarScores;
  for (const key of PILLAR_ORDER) {
    const { total, count } = sums[key];
    scores[key] = count === 0 ? 0 : round((total / count) * 10);
  }
  return scores;
}

/** Weighted overall score (0–100) from the per-pillar scores. */
export function calculateOverallScore(pillarScores: PillarScores): number {
  let weighted = 0;
  for (const key of PILLAR_ORDER) {
    weighted += pillarScores[key] * PILLARS[key].weight;
  }
  return round(weighted);
}

/** Map an overall score to its maturity band. */
export function calculateMaturityLevel(overallScore: number): MaturityDefinition {
  const match = MATURITY_LEVELS.find(
    (m) => overallScore >= m.min && overallScore <= m.max,
  );
  // Defensive fallback — the bands cover 0–100, so this should never fire.
  return match ?? MATURITY_LEVELS[0];
}

/** The lowest-scoring pillar (ties resolved by config order). */
export function weakestPillar(pillarScores: PillarScores): PillarKey {
  return PILLAR_ORDER.reduce((lowest, key) =>
    pillarScores[key] < pillarScores[lowest] ? key : lowest,
  );
}

// ── Financial calculators ───────────────────────────────────────────────────

/**
 * Revenue leakage = monthly revenue × Σ(revenueFactor of chosen answers).
 * Each factor is the fraction of monthly revenue that behaviour leaks; keeping
 * them on the options makes the model transparent and tunable in one place.
 */
export function calculateRevenueLeakage(
  answers: ScorecardAnswers,
  calibration: ScorecardCalibration,
): RevenueLeakage {
  const monthlyRevenue = resolveMonthlyRevenue(calibration);
  const breakdown: RevenueBreakdownItem[] = [];
  let monthly = 0;

  for (const q of QUESTIONS) {
    const option = optionFor(q.id, answers);
    if (!option?.revenueFactor) continue;
    const amount = monthlyRevenue * option.revenueFactor;
    if (amount <= 0) continue;
    monthly += amount;
    breakdown.push({ questionId: q.id, label: q.prompt, monthly: round(amount) });
  }

  breakdown.sort((a, b) => b.monthly - a.monthly);
  return { monthly: round(monthly), yearly: round(monthly * 12), breakdown };
}

/**
 * Time loss = Σ(weeklyHours of chosen answers). Monetary value uses the blended
 * billable rate × weeks/month.
 */
export function calculateTimeLoss(
  answers: ScorecardAnswers,
  calibration: ScorecardCalibration,
): TimeLoss {
  const rate = resolveRate(calibration);
  const breakdown: TimeBreakdownItem[] = [];
  let hoursPerWeek = 0;

  for (const q of QUESTIONS) {
    const option = optionFor(q.id, answers);
    if (!option?.weeklyHours) continue;
    hoursPerWeek += option.weeklyHours;
    breakdown.push({
      questionId: q.id,
      label: q.prompt,
      hoursPerWeek: option.weeklyHours,
    });
  }

  breakdown.sort((a, b) => b.hoursPerWeek - a.hoursPerWeek);
  const valuePerMonth = round(hoursPerWeek * WEEKS_PER_MONTH * rate);
  return {
    hoursPerWeek: Math.round(hoursPerWeek * 10) / 10,
    valuePerMonth,
    breakdown,
  };
}

// ── Recommendation engine ───────────────────────────────────────────────────

/**
 * Builds a prioritized list of fixes. A recommendation is triggered by any
 * sub-optimal answer carrying a `recommends` id; we dedupe by recommendation,
 * estimate each one's annual £ impact (pillar revenue leak + time value, scoped
 * to the recommendation's pillar), and sort hardest-hitting first.
 */
export function generateRecommendations(
  answers: ScorecardAnswers,
  calibration: ScorecardCalibration,
  pillarScores: PillarScores,
  revenue: RevenueLeakage,
  time: TimeLoss,
): RecommendationResult[] {
  const triggered = new Set<RecommendationId>();
  for (const q of QUESTIONS) {
    const option = optionFor(q.id, answers);
    if (option?.recommends) triggered.add(option.recommends);
  }

  const rate = resolveRate(calibration);

  // Per-pillar annual impact = pillar's revenue leak (annual) + pillar's time value.
  const pillarRevenueYear: Record<PillarKey, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const item of revenue.breakdown) {
    const pillar = QUESTION_BY_ID[item.questionId]?.pillar;
    if (pillar) pillarRevenueYear[pillar] += item.monthly * 12;
  }
  const pillarTimeYear: Record<PillarKey, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const item of time.breakdown) {
    const pillar = QUESTION_BY_ID[item.questionId]?.pillar;
    if (pillar) {
      pillarTimeYear[pillar] += item.hoursPerWeek * WEEKS_PER_MONTH * 12 * rate;
    }
  }

  const results: RecommendationResult[] = [];
  for (const id of triggered) {
    const def = RECOMMENDATIONS[id];
    const impact = pillarRevenueYear[def.pillar] + pillarTimeYear[def.pillar];
    results.push({
      id: def.id,
      pillar: def.pillar,
      problem: def.problem,
      fix: def.fix,
      feature: def.feature,
      href: def.href,
      estimatedAnnualImpact: round(impact),
    });
  }

  // Prioritize by £ impact; break ties by weakest pillar (lowest score first).
  results.sort((a, b) => {
    if (b.estimatedAnnualImpact !== a.estimatedAnnualImpact) {
      return b.estimatedAnnualImpact - a.estimatedAnnualImpact;
    }
    return pillarScores[a.pillar] - pillarScores[b.pillar];
  });

  return results.slice(0, 5);
}

// ── One-shot orchestrator ───────────────────────────────────────────────────

export interface ComputeInput {
  answers: ScorecardAnswers;
  calibration: ScorecardCalibration;
}

/** Compute the entire result bundle in one call. */
export function computeScorecard({ answers, calibration }: ComputeInput): ScorecardResult {
  const pillarScores = calculatePillarScores(answers);
  const overallScore = calculateOverallScore(pillarScores);
  const maturity = calculateMaturityLevel(overallScore);
  const revenue = calculateRevenueLeakage(answers, calibration);
  const time = calculateTimeLoss(answers, calibration);
  const recommendations = generateRecommendations(
    answers,
    calibration,
    pillarScores,
    revenue,
    time,
  );

  return {
    overallScore,
    pillarScores,
    maturity,
    revenue,
    time,
    recommendations,
    weakestPillar: weakestPillar(pillarScores),
    currency: CURRENCY,
  };
}

// ── Formatting helpers (shared by UI, email, PDF) ───────────────────────────

/** Whole-currency formatter, e.g. $12,300. */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    maximumFractionDigits: 0,
  }).format(amount);
}

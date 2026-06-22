"use server";

import { cookies, headers } from "next/headers";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { db } from "@/lib/db";
import { sendEmailSafe } from "@/lib/email";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";
import { siteConfig } from "@/config/site";
import {
  QUESTION_BY_ID,
  REVENUE_BAND_BY_ID,
  TEAM_SIZE_BY_ID,
  TOTAL_QUESTIONS,
} from "@/config/scorecard";
import {
  computeScorecard,
  formatCurrency,
  type ScorecardAnswers,
  type ScorecardCalibration,
} from "@/server/services/scorecard";

/**
 * Public, UNAUTHENTICATED scorecard actions. These intentionally do NOT call
 * requireAgency() — the flow is anonymous. Safety comes from: strict zod +
 * config validation (only known question/option ids accepted), per-IP rate
 * limiting, payload-size caps, and tables that are isolated from tenant data.
 */

const ANON_COOKIE = "sc_anon";
const ANON_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

// ── Validation ──────────────────────────────────────────────────────────────

// Answers/calibration come from the client; cap the object size and validate
// every key/value against the config so nothing arbitrary is persisted.
const answersSchema = z.record(z.string().max(64), z.string().max(64));
const calibrationSchema = z.object({
  teamSize: z.string().max(32).optional(),
  revenueBand: z.string().max(32).optional(),
  billableRate: z.number().min(0).max(100_000).optional(),
});

const completeSchema = z.object({
  answers: answersSchema,
  calibration: calibrationSchema,
  utm: z
    .object({
      source: z.string().max(120).optional(),
      medium: z.string().max(120).optional(),
      campaign: z.string().max(120).optional(),
    })
    .optional(),
});

const captureSchema = z.object({
  sessionId: z.string().min(1).max(40),
  email: z.string().trim().email("A valid email is required").max(200),
  marketingOptIn: z.boolean().default(false),
  // Honeypot: a hidden field real users never see/fill. Non-semantic name so
  // browser autofill never populates it. Any value ⇒ bot.
  hpToken: z.string().max(200).optional(),
});

// Minimum plausible time between completing the assessment and submitting the
// email. A human reads the results and types an address; a script does it in
// milliseconds. This uses the server-set `completedAt` (not a client clock), so
// it can't be spoofed.
const MIN_HUMAN_FILL_MS = 1500;

/** Structured, PII-free abuse signal for log-based alerting. */
function logAbuse(signal: string, fields: Record<string, unknown> = {}): void {
  console.warn(
    `[scorecard] ${JSON.stringify({ scope: "scorecard-abuse", signal, ...fields })}`,
  );
}

/** Keep only known question→option pairs; drops anything not in the config. */
function sanitizeAnswers(input: Record<string, string>): ScorecardAnswers {
  const clean: ScorecardAnswers = {};
  for (const [questionId, optionId] of Object.entries(input)) {
    const q = QUESTION_BY_ID[questionId];
    if (q && q.options.some((o) => o.id === optionId)) clean[questionId] = optionId;
  }
  return clean;
}

function sanitizeCalibration(input: z.infer<typeof calibrationSchema>): ScorecardCalibration {
  return {
    teamSize: input.teamSize && TEAM_SIZE_BY_ID[input.teamSize] ? input.teamSize : undefined,
    revenueBand:
      input.revenueBand && REVENUE_BAND_BY_ID[input.revenueBand] ? input.revenueBand : undefined,
    billableRate: input.billableRate,
  };
}

// ── anon cookie ─────────────────────────────────────────────────────────────

async function ensureAnonId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(ANON_COOKIE)?.value;
  if (existing) return existing;
  // crypto.randomUUID is available in the Node + edge runtimes Next uses.
  const id = crypto.randomUUID();
  jar.set(ANON_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ANON_MAX_AGE,
  });
  return id;
}

// ── Results ─────────────────────────────────────────────────────────────────

export type CompleteResult =
  | {
      ok: true;
      sessionId: string;
      // Returned so the client can fire `ScorecardCompleted` in the SAME
      // analytics identity space as every other (client-side) funnel event.
      analytics: { score: number; maturity: string; weakestPillar: string };
    }
  | { ok: false; error: string };

/**
 * Persist a completed assessment and its computed snapshot, then return the
 * session id the client navigates to. Rate-limited per IP.
 */
export async function completeScorecard(
  input: z.infer<typeof completeSchema>,
): Promise<CompleteResult> {
  const parsed = completeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid submission." };

  const ip = clientIpFromHeaders(await headers());
  const limit = await rateLimit(`scorecard:complete:${ip}`, 8, 60 * 60 * 1000);
  if (!limit.ok) {
    logAbuse("complete_rate_limited", { ip });
    return { ok: false, error: "Too many submissions. Please try again later." };
  }

  const answers = sanitizeAnswers(parsed.data.answers);
  const calibration = sanitizeCalibration(parsed.data.calibration);

  // Require a meaningful number of answers before producing a report.
  if (Object.keys(answers).length < Math.ceil(TOTAL_QUESTIONS / 2)) {
    return { ok: false, error: "Please answer more questions to see your score." };
  }

  const anonId = await ensureAnonId();
  const result = computeScorecard({ answers, calibration });

  const session = await db.scorecardSession.create({
    data: {
      anonId,
      answers: answers as Prisma.InputJsonValue,
      calibration: calibration as Prisma.InputJsonValue,
      overallScore: result.overallScore,
      pillarScores: result.pillarScores as Prisma.InputJsonValue,
      maturity: result.maturity.level,
      revenueLeakYear: result.revenue.yearly,
      timeLostHours: result.time.hoursPerWeek,
      recommendations: result.recommendations as unknown as Prisma.InputJsonValue,
      completedAt: new Date(),
    },
    select: { id: true },
  });

  // NOTE: the `ScorecardCompleted` event is fired client-side by the caller
  // (assessment flow) using the analytics payload returned here, so the whole
  // funnel shares one PostHog identity. Do not re-emit it from the server.
  return {
    ok: true,
    sessionId: session.id,
    analytics: {
      score: result.overallScore,
      maturity: result.maturity.level,
      weakestPillar: result.weakestPillar,
    },
  };
}

// ── Email capture / unlock ──────────────────────────────────────────────────

export type CaptureResult =
  // `unlocked` distinguishes a real unlock (lead created / already exists) from
  // a soft-block (honeypot / too-fast). Both return ok:true so a bot can't tell
  // it was caught, but the client uses `unlocked` to avoid a dead loading state
  // and to fire analytics only on a genuine capture.
  | { ok: true; unlocked: boolean; reportUrl: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Capture the lead's email, unlock the full report, and send the report email
 * (best-effort — never blocks the unlock). Rate-limited per IP. Idempotent per
 * session via the unique sessionId on ScorecardLead.
 */
export async function captureScorecardLead(
  input: z.infer<typeof captureSchema>,
): Promise<CaptureResult> {
  const parsed = captureSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please enter a valid email.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { sessionId, email, marketingOptIn, hpToken } = parsed.data;
  const reportUrl = `${siteConfig.url}/scorecard/results/${sessionId}`;
  const ip = clientIpFromHeaders(await headers());

  // 1. Honeypot — a hidden field only bots fill. Soft-block: looks like success
  //    to a bot (ok:true) but unlocked:false, and does nothing (no lead, no
  //    email). A legitimate user who somehow tripped it recovers on retry.
  if (hpToken && hpToken.trim().length > 0) {
    logAbuse("honeypot_triggered", { ip, sessionId });
    return { ok: true, unlocked: false, reportUrl };
  }

  // 2. Per-IP throttle.
  const ipLimit = await rateLimit(`scorecard:capture:ip:${ip}`, 10, 60 * 60 * 1000);
  if (!ipLimit.ok) {
    logAbuse("capture_ip_rate_limited", { ip });
    return { ok: false, error: "Too many requests. Please try again later." };
  }

  // 3. Per-email throttle — stops the same address being targeted/abused across
  //    sessions (email-bombing) even from rotating IPs.
  const emailKey = email.toLowerCase();
  const emailLimit = await rateLimit(`scorecard:capture:email:${emailKey}`, 3, 60 * 60 * 1000);
  if (!emailLimit.ok) {
    logAbuse("capture_email_rate_limited", { ip });
    return { ok: false, error: "Too many requests for this email. Please try again later." };
  }

  const session = await db.scorecardSession.findUnique({
    where: { id: sessionId },
    select: { id: true, completedAt: true, answers: true, calibration: true, lead: { select: { id: true } } },
  });
  if (!session || !session.completedAt) {
    return { ok: false, error: "We couldn't find your results. Please retake the scorecard." };
  }

  // 4. Submission-timing validation (server clock, unspoofable). A real visitor
  //    takes seconds to read results and type an email; a script does not.
  if (Date.now() - session.completedAt.getTime() < MIN_HUMAN_FILL_MS) {
    logAbuse("too_fast", { ip, sessionId });
    // Soft-block. unlocked:false → the client prompts a retry; by then enough
    // time has elapsed that a real visitor passes this check.
    return { ok: true, unlocked: false, reportUrl };
  }

  // Idempotent: if already captured, just return the unlock (don't double-send).
  if (session.lead) {
    return { ok: true, unlocked: true, reportUrl };
  }

  // Idempotent + race-safe. Concurrent first-time submissions both pass the
  // `session.lead` check above; the unique `sessionId` then guarantees exactly
  // one row is created. We catch the unique-constraint violation (P2002) and
  // treat the loser as a successful no-op WITHOUT re-sending the report email,
  // so the email is sent exactly once. (An upsert would converge the row too,
  // but couldn't distinguish create-vs-update and would risk a double send.)
  try {
    await db.scorecardLead.create({
      data: { sessionId, email, marketingOptIn, reportUrl },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { ok: true, unlocked: true, reportUrl };
    }
    throw err;
  }

  // Recompute for the email (pure + cheap) so copy always matches config.
  const result = computeScorecard({
    answers: (session.answers ?? {}) as ScorecardAnswers,
    calibration: (session.calibration ?? {}) as ScorecardCalibration,
  });

  await sendEmailSafe("scorecardReport", email, {
    scoreLabel: `${result.overallScore} / 100`,
    maturityLabel: result.maturity.label,
    maturityHeadline: result.maturity.headline,
    revenueLeak: `${formatCurrency(result.revenue.yearly)} / year`,
    timeLost: `${result.time.hoursPerWeek} hrs / week`,
    reportUrl,
    trialUrl: `${siteConfig.url}/signup?source=scorecard&session=${sessionId}`,
    topFixes: result.recommendations.map((r) => ({ feature: r.feature, fix: r.fix })),
  });

  // NOTE: `ScorecardEmailCaptured` is fired once, client-side, by the email gate
  // (same identity as the rest of the funnel). Do not emit it from the server.
  return { ok: true, unlocked: true, reportUrl };
}

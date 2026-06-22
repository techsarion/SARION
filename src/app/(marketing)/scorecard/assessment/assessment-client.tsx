"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";

import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import {
  QUESTIONS,
  REVENUE_BANDS,
  TEAM_SIZES,
  TOTAL_QUESTIONS,
} from "@/config/scorecard";
import { completeScorecard } from "@/server/actions/scorecard";
import styles from "./assessment.module.css";

const STORAGE_KEY = "sarion_scorecard_v1";

interface Persisted {
  answers: Record<string, string>;
  calibration: { teamSize?: string; revenueBand?: string };
  step: number;
}

/** Calibration steps come first, then the scored questions. */
type CalibrationStep =
  | { kind: "calibration"; field: "teamSize"; prompt: string; help: string; options: { id: string; label: string }[] }
  | { kind: "calibration"; field: "revenueBand"; prompt: string; help: string; options: { id: string; label: string }[] };

const CALIBRATION_STEPS: CalibrationStep[] = [
  {
    kind: "calibration",
    field: "teamSize",
    prompt: "How big is your team?",
    help: "This helps us tailor your benchmark.",
    options: TEAM_SIZES.map((t) => ({ id: t.id, label: t.label })),
  },
  {
    kind: "calibration",
    field: "revenueBand",
    prompt: "What's your monthly revenue, roughly?",
    help: "Used to estimate your revenue leakage. We never store an exact figure.",
    options: REVENUE_BANDS.map((b) => ({ id: b.id, label: b.label })),
  },
];

const TOTAL_STEPS = CALIBRATION_STEPS.length + TOTAL_QUESTIONS;

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    return null;
  }
}

function readUtm(): { source?: string; medium?: string; campaign?: string } {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    source: p.get("utm_source") ?? undefined,
    medium: p.get("utm_medium") ?? undefined,
    campaign: p.get("utm_campaign") ?? undefined,
  };
}

export function AssessmentClient() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [calibration, setCalibration] = useState<{ teamSize?: string; revenueBand?: string }>({});
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from localStorage (resume support) + fire "started" once.
  useEffect(() => {
    const saved = loadPersisted();
    if (saved && (Object.keys(saved.answers).length > 0 || saved.calibration.teamSize)) {
      setAnswers(saved.answers);
      setCalibration(saved.calibration);
      setStep(Math.min(saved.step, TOTAL_STEPS - 1));
      setResumed(true);
    }
    setHydrated(true);
    trackEvent(ANALYTICS_EVENTS.ScorecardStarted);
  }, []);

  // Autosave on every change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, calibration, step }));
    } catch {
      /* storage may be unavailable (private mode) — non-fatal */
    }
  }, [answers, calibration, step, hydrated]);

  const isCalibration = step < CALIBRATION_STEPS.length;
  const question = useMemo(
    () => (isCalibration ? null : QUESTIONS[step - CALIBRATION_STEPS.length]),
    [isCalibration, step],
  );
  const calStep = isCalibration ? CALIBRATION_STEPS[step] : null;

  const currentValue = isCalibration
    ? calibration[calStep!.field]
    : question
      ? answers[question.id]
      : undefined;

  const goNext = useCallback(() => {
    setHint(null);
    setError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const handleSelect = useCallback(
    (optionId: string) => {
      if (isCalibration && calStep) {
        setCalibration((c) => ({ ...c, [calStep.field]: optionId }));
        // Calibration has no scoring hint; advance shortly for momentum.
        window.setTimeout(goNext, 180);
        return;
      }
      if (!question) return;
      setAnswers((a) => ({ ...a, [question.id]: optionId }));
      const opt = question.options.find((o) => o.id === optionId);
      trackEvent(ANALYTICS_EVENTS.ScorecardQuestionAnswered, {
        question: question.id,
        index: step - CALIBRATION_STEPS.length + 1,
      });
      if (opt?.hint) {
        setHint(opt.hint);
        window.setTimeout(goNext, 650);
      } else {
        window.setTimeout(goNext, 180);
      }
    },
    [isCalibration, calStep, question, step, goNext],
  );

  const submit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await completeScorecard({
        answers,
        calibration,
        utm: readUtm(),
      });
      if (!res.ok) {
        setError(res.error);
        setSubmitting(false);
        return;
      }
      // Fire client-side so every funnel event shares one PostHog identity.
      trackEvent(ANALYTICS_EVENTS.ScorecardCompleted, {
        score: res.analytics.score,
        maturity: res.analytics.maturity,
        weakest_pillar: res.analytics.weakestPillar,
      });
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      router.push(`/scorecard/results/${res.sessionId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }, [answers, calibration, router]);

  // Reached the end → submit screen.
  const finished = step >= TOTAL_STEPS;
  useEffect(() => {
    if (finished && !submitting && !error) void submit();
  }, [finished, submitting, error, submit]);

  if (!hydrated) {
    return <div className={styles.wrap} aria-busy="true" />;
  }

  if (finished) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card} role="status" aria-live="polite">
          <p className={styles.eyebrow}>Almost there</p>
          <h1 className={styles.question}>Calculating your score…</h1>
          <p className={styles.help}>Crunching your answers into your Operations Score, revenue leak, and time lost.</p>
          {error && (
            <>
              <p className={styles.error}>{error}</p>
              <div className={styles.nav}>
                <span />
                <button
                  type="button"
                  className="mBtn mBtnPrimary"
                  onClick={() => {
                    setSubmitting(false);
                    void submit();
                  }}
                >
                  Try again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const stepNumber = step + 1;
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  const options = isCalibration ? calStep!.options : question!.options;
  const prompt = isCalibration ? calStep!.prompt : question!.prompt;
  const help = isCalibration ? calStep!.help : question!.help;

  return (
    <div className={styles.wrap}>
      <div className={styles.progressRow}>
        <button
          type="button"
          className="mBtn mBtnGhost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          aria-label="Previous question"
          style={{ height: 36, paddingInline: 10 }}
        >
          <ArrowLeft size={16} aria-hidden />
        </button>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.progressMeta}>
          {stepNumber} / {TOTAL_STEPS}
        </span>
      </div>

      <div className={styles.card} key={step}>
        <p className={styles.eyebrow}>{isCalibration ? "About your agency" : "Operations"}</p>
        <h1 className={styles.question}>{prompt}</h1>
        {help && <p className={styles.help}>{help}</p>}

        <div className={styles.options} role="radiogroup" aria-label={prompt}>
          {options.map((o) => {
            const selected = currentValue === o.id;
            return (
              <button
                type="button"
                key={o.id}
                role="radio"
                aria-checked={selected}
                className={`${styles.option} ${selected ? styles.optionSelected : ""}`}
                onClick={() => handleSelect(o.id)}
              >
                <span className={styles.optionMark}>{selected && <span className={styles.optionDot} />}</span>
                {o.label}
              </button>
            );
          })}
        </div>

        {hint && (
          <p className={styles.hint}>
            <Check size={15} aria-hidden style={{ display: "inline", marginRight: 6, verticalAlign: "-2px" }} />
            {hint}
          </p>
        )}
      </div>

      {resumed && step > 0 && <p className={styles.resume}>Resumed where you left off.</p>}
    </div>
  );
}

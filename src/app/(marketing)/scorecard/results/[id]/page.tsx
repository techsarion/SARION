import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TrackPageView } from "@/components/analytics/track-page-view";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { PILLARS, PILLAR_ORDER } from "@/config/scorecard";
import { getScorecardView } from "@/server/data/scorecard";
import { formatCurrency } from "@/server/services/scorecard";
import { ScoreGauge } from "../../_components/score-gauge";
import { PillarRadar } from "../../_components/pillar-radar";
import { EmailGate } from "./email-gate";
import { TrialButton, PrintButton } from "./results-actions";
import styles from "./results.module.css";

export const metadata: Metadata = {
  title: "Your Agency Operations Scorecard",
  description: "Your personalized agency operations score, revenue leakage, and action plan.",
  // Per-session result — never indexed.
  robots: { index: false, follow: false },
};

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const view = await getScorecardView(id);
  if (!view || !view.result) notFound();

  const { result, unlocked } = view;
  const { overallScore, maturity, revenue, time, pillarScores, recommendations, weakestPillar } =
    result;

  return (
    <section className="mSectionTight">
      <div className="mContainer">
        <TrackPageView event={ANALYTICS_EVENTS.ScorecardResultsViewed} />

        <div className={styles.wrap}>
          {/* Header — always visible */}
          <div className={styles.head}>
            <ScoreGauge score={overallScore} size={190} />
            <div className={styles.headMeta}>
              <span className="mEyebrow">Your operations score</span>
              <h1 className={styles.level}>{maturity.label}</h1>
              <p className={styles.levelHeadline}>{maturity.headline}</p>
            </div>
          </div>

          {/* Stat cards — blurred until unlocked */}
          <div className={`${styles.stats} ${unlocked ? "" : styles.blur}`} aria-hidden={!unlocked}>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Revenue leakage</p>
              <p className={`${styles.statValue} ${styles.statValueDanger}`}>
                {unlocked ? `${formatCurrency(revenue.yearly)}/yr` : "$••,•••/yr"}
              </p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Time lost</p>
              <p className={styles.statValue}>
                {unlocked ? `${time.hoursPerWeek} hrs/wk` : "••.• hrs/wk"}
              </p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Weakest pillar</p>
              <p className={styles.statValue}>
                {unlocked ? PILLARS[weakestPillar].name : "••••••"}
              </p>
            </div>
          </div>

          {/* Email gate OR full report */}
          {!unlocked ? (
            <EmailGate sessionId={id} />
          ) : (
            <>
              {/* Pillar breakdown */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Your pillar breakdown</h2>
                <div className={styles.split}>
                  <PillarRadar scores={pillarScores} size={260} />
                  <div className={styles.list}>
                    {PILLAR_ORDER.map((k) => (
                      <div key={k} className={styles.listRow}>
                        <span>{PILLARS[k].name}</span>
                        <strong>{pillarScores[k]} / 100</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Where money leaks */}
              {revenue.breakdown.length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Where your money is leaking</h2>
                  <div className={styles.list}>
                    {revenue.breakdown.map((b) => (
                      <div key={b.questionId} className={styles.listRow}>
                        <span>{b.label}</span>
                        <strong>{formatCurrency(b.monthly)}/mo</strong>
                      </div>
                    ))}
                    <div className={styles.listRow}>
                      <span>
                        <strong>Total estimated leakage</strong>
                      </span>
                      <strong>{formatCurrency(revenue.yearly)}/yr</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>Your prioritized action plan</h2>
                  <div className={styles.recs}>
                    {recommendations.map((r) => (
                      <div key={r.id} className={styles.rec}>
                        <div className={styles.recHead}>
                          <span className={styles.recFeature}>{r.feature}</span>
                          {r.estimatedAnnualImpact > 0 && (
                            <span className={styles.recImpact}>
                              ~{formatCurrency(r.estimatedAnnualImpact)}/yr at stake
                            </span>
                          )}
                        </div>
                        <p className={styles.recProblem}>{r.problem}</p>
                        <p className={styles.recFix}>
                          <strong>Fix:</strong> {r.fix}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversion CTA */}
              <div className={styles.cta}>
                <span className="mEyebrow">Close the gaps</span>
                <h2 className={styles.sectionTitle} style={{ marginTop: 12 }}>
                  Fix your top 3 leaks in Sarion — free
                </h2>
                <p className={styles.levelHeadline} style={{ maxWidth: "52ch", margin: "0 auto" }}>
                  Start a free trial and we&apos;ll set you up around your weakest areas first. No
                  credit card required.
                </p>
                <div className={styles.ctaActions}>
                  <TrialButton sessionId={id} label="Start free — fix these now →" />
                  <Link href="/portal-demo" className="mBtn mBtnGhost mBtnLg">
                    See the client portal
                  </Link>
                  <PrintButton sessionId={id} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

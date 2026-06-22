import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siteConfig } from "@/config/site";
import { PILLARS, PILLAR_ORDER } from "@/config/scorecard";
import { getScorecardView } from "@/server/data/scorecard";
import { formatCurrency } from "@/server/services/scorecard";
import { ScoreGauge } from "@/app/(marketing)/scorecard/_components/score-gauge";
import { PillarRadar } from "@/app/(marketing)/scorecard/_components/pillar-radar";
import { PrintButton } from "./print-button";
import styles from "./report.module.css";

export const metadata: Metadata = {
  title: "Agency Operations Scorecard — Report",
  robots: { index: false, follow: false },
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const view = await getScorecardView(id);
  if (!view || !view.result) notFound();

  const { result } = view;
  const { overallScore, maturity, revenue, time, pillarScores, recommendations, weakestPillar } =
    result;
  const trialUrl = `${siteConfig.url}/signup?source=scorecard&session=${id}`;

  return (
    <main className={styles.page}>
      <div className={styles.toolbar}>
        <PrintButton sessionId={id} />
      </div>

      <article className={styles.sheet}>
        {/* Brand / cover */}
        <header className={styles.brand}>
          <span className={styles.brandName}>Sarion</span>
          <span className={styles.brandMeta}>Agency Operations Scorecard</span>
        </header>

        <section className={styles.cover}>
          <ScoreGauge score={overallScore} size={200} />
          <div>
            <h1 className={styles.coverTitle}>
              Your operations score: {overallScore}/100 · {maturity.label}
            </h1>
            <p className={styles.coverHeadline}>{maturity.headline}</p>
          </div>
        </section>

        {/* Executive summary */}
        <h2 className={styles.h2}>Executive summary</h2>
        <div className={styles.statRow}>
          <div className={styles.statBox}>
            <p className={styles.statLabel}>Revenue leakage</p>
            <p className={styles.statValue} style={{ color: "var(--danger)" }}>
              {formatCurrency(revenue.yearly)}/yr
            </p>
          </div>
          <div className={styles.statBox}>
            <p className={styles.statLabel}>Time lost</p>
            <p className={styles.statValue}>{time.hoursPerWeek} hrs/wk</p>
          </div>
          <div className={styles.statBox}>
            <p className={styles.statLabel}>Weakest pillar</p>
            <p className={styles.statValue} style={{ fontSize: 16 }}>
              {PILLARS[weakestPillar].name}
            </p>
          </div>
        </div>

        {/* Pillar analysis */}
        <h2 className={styles.h2}>Pillar analysis</h2>
        <div className={styles.split}>
          <PillarRadar scores={pillarScores} size={240} />
          <div>
            {PILLAR_ORDER.map((k) => (
              <div key={k} className={styles.row}>
                <span>{PILLARS[k].name}</span>
                <strong>{pillarScores[k]} / 100</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue leakage detail */}
        {revenue.breakdown.length > 0 && (
          <>
            <h2 className={styles.h2}>Where your money is leaking</h2>
            {revenue.breakdown.map((b) => (
              <div key={b.questionId} className={styles.row}>
                <span>{b.label}</span>
                <strong>{formatCurrency(b.monthly)}/mo</strong>
              </div>
            ))}
            <div className={styles.row}>
              <strong>Total estimated leakage</strong>
              <strong>{formatCurrency(revenue.yearly)}/yr</strong>
            </div>
          </>
        )}

        {/* Time loss detail */}
        {time.breakdown.length > 0 && (
          <>
            <h2 className={styles.h2}>Where your time is going</h2>
            {time.breakdown.map((b) => (
              <div key={b.questionId} className={styles.row}>
                <span>{b.label}</span>
                <strong>{b.hoursPerWeek} hrs/wk</strong>
              </div>
            ))}
            <div className={styles.row}>
              <strong>Total time lost (value/mo)</strong>
              <strong>{formatCurrency(time.valuePerMonth)}/mo</strong>
            </div>
          </>
        )}

        {/* Recommendations + Sarion feature mapping */}
        {recommendations.length > 0 && (
          <>
            <h2 className={styles.h2}>Your prioritized action plan</h2>
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
                <p className={styles.recText}>
                  <strong>Problem:</strong> {r.problem}
                </p>
                <p className={styles.recText} style={{ marginTop: 4 }}>
                  <strong>How Sarion fixes it:</strong> {r.fix}
                </p>
              </div>
            ))}
          </>
        )}

        {/* CTA */}
        <div className={styles.ctaBox}>
          <strong style={{ fontSize: 18 }}>Ready to close these gaps?</strong>
          <p className={styles.recText} style={{ marginTop: 6 }}>
            Start a free Sarion trial — set up around your weakest areas first. No credit card.
          </p>
          <a className={styles.ctaLink} href={trialUrl}>
            Start your free trial →
          </a>
        </div>
      </article>
    </main>
  );
}

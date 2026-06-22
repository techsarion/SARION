import { TrendingDown, Clock, Check } from "lucide-react";

import { ScoreGauge } from "./score-gauge";
import styles from "./hero-preview.module.css";

/**
 * Sample-result card for the hero — shows the *outcome* of the scorecard before
 * the visitor commits (HubSpot Website Grader pattern). Pure server component
 * (zero added client JS). All values default to a representative sample and are
 * explicitly labelled "sample" so it never reads as a real dashboard.
 */
export function HeroPreview({
  score = 47,
  maturity = "Firefighting",
  revenueLeak = "$12,300/yr",
  timeLost = "8.5 hrs/wk",
  fixes = [
    { label: "Automated invoicing", impact: "~$6k/yr" },
    { label: "Client portal", impact: "~$4k/yr" },
  ],
}: {
  score?: number;
  maturity?: string;
  revenueLeak?: string;
  timeLost?: string;
  fixes?: { label: string; impact: string }[];
} = {}) {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.head}>
        <span className={styles.tag}>Sample report</span>
        <span className={styles.maturity}>{maturity}</span>
      </div>

      <div className={styles.scoreRow}>
        <ScoreGauge score={score} size={132} />
        <div className={styles.scoreMeta}>
          <p className={styles.scoreLabel}>Operations score</p>
          <div className={styles.bar}>
            <span className={styles.barFill} style={{ width: `${score}%` }} />
          </div>
          <p className={styles.scoreValue}>{score} / 100</p>
        </div>
      </div>

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <p className={styles.statLabel}>
            <TrendingDown size={13} aria-hidden /> Revenue leak
          </p>
          <p className={`${styles.statValue} ${styles.statDanger}`}>{revenueLeak}</p>
        </div>
        <div className={styles.stat}>
          <p className={styles.statLabel}>
            <Clock size={13} aria-hidden /> Time lost
          </p>
          <p className={styles.statValue}>{timeLost}</p>
        </div>
      </div>

      <div className={styles.fixes}>
        <p className={styles.fixesLabel}>Top fixes</p>
        {fixes.map((f) => (
          <div key={f.label} className={styles.fixRow}>
            <span className={styles.fixName}>
              <Check size={14} aria-hidden className={styles.fixCheck} />
              {f.label}
            </span>
            <span className={styles.fixImpact}>{f.impact}</span>
          </div>
        ))}
      </div>

      <p className={styles.caption}>Example result — your numbers will differ.</p>
    </div>
  );
}

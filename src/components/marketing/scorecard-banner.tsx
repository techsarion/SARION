"use client";

import Link from "next/link";

import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import styles from "./scorecard-banner.module.css";

/**
 * Lead-magnet CTA band for the marketing site. Drops the free Agency Operations
 * Scorecard in front of visitors where intent is high (e.g. right after the
 * homepage "Problem" section). The `placement` is recorded on click and carried
 * into the funnel via `?ref=`, so we can see which surface drives completions.
 *
 * Deliberately a SECONDARY conversion path — it captures the visitors who aren't
 * ready to start a trial yet, without competing with the primary trial CTA.
 */
export function ScorecardBanner({ placement = "home" }: { placement?: string }) {
  return (
    <section className="mSection">
      <div className="mContainer">
        <div className={styles.panel}>
          <span className="mEyebrow">Free · 3 minutes · No card</span>
          <h2 className={styles.headline}>
            How much is your scattered agency costing you?
          </h2>
          <p className={styles.subtext}>
            Get your Operations Score, your hidden revenue leak, and the hours you lose
            every week — with a clear plan to fix it.
          </p>
          <Link
            href={`/scorecard?ref=${placement}`}
            className={`mBtn mBtnPrimary mBtnLg ${styles.cta}`}
            onClick={() =>
              trackEvent(ANALYTICS_EVENTS.ScorecardEntryClicked, { placement })
            }
          >
            Get my free score →
          </Link>
          <p className={styles.trust}>
            Built for agencies, freelancers, consultants &amp; service businesses.
          </p>
        </div>
      </div>
    </section>
  );
}

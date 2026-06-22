"use client";

import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import styles from "./report.module.css";

export function PrintButton({ sessionId }: { sessionId: string }) {
  return (
    <button
      type="button"
      className={styles.printBtn}
      onClick={() => {
        trackEvent(ANALYTICS_EVENTS.ScorecardReportDownloaded, { session: sessionId });
        window.print();
      }}
    >
      Save as PDF / Print
    </button>
  );
}

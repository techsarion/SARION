"use client";

import Link from "next/link";

import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

/** Trial CTA that records the attribution-critical click before navigating. */
export function TrialButton({
  sessionId,
  label,
  variant = "primary",
}: {
  sessionId: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={`/signup?source=scorecard&session=${sessionId}`}
      className={`mBtn ${variant === "primary" ? "mBtnPrimary" : "mBtnSecondary"} mBtnLg`}
      onClick={() => trackEvent(ANALYTICS_EVENTS.ScorecardTrialClicked, { session: sessionId })}
    >
      {label}
    </Link>
  );
}

/** Triggers the browser's native print-to-PDF for the hosted report. */
export function PrintButton({ sessionId }: { sessionId: string }) {
  return (
    <button
      type="button"
      className="mBtn mBtnGhost mBtnLg"
      onClick={() => {
        trackEvent(ANALYTICS_EVENTS.ScorecardReportDownloaded, { session: sessionId });
        window.open(`/scorecard/report/${sessionId}`, "_blank", "noopener");
      }}
    >
      Download PDF
    </button>
  );
}

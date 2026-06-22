"use client";

import Link from "next/link";

import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

/**
 * Reusable, tracked entry link to the free Scorecard. Records the `placement`
 * on click and carries it into the funnel via `?ref=`, so we can attribute
 * completions to the surface that drove them. Use anywhere on the marketing
 * site (hero, inline, nav) where a Scorecard CTA is needed.
 */
export function ScorecardLink({
  placement,
  className,
  children,
}: {
  placement: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/scorecard?ref=${placement}`}
      className={className}
      onClick={() => trackEvent(ANALYTICS_EVENTS.ScorecardEntryClicked, { placement })}
    >
      {children}
    </Link>
  );
}

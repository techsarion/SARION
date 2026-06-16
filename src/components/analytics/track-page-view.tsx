"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";
import type { AnalyticsEventName } from "@/lib/analytics-events";

/**
 * Fires a single named view event on mount. Drop into a marketing page (server
 * component) to record "Landing Viewed", "Pricing Viewed", etc. Renders nothing.
 */
export function TrackPageView({ event }: { event: AnalyticsEventName }) {
  useEffect(() => {
    trackEvent(event);
  }, [event]);
  return null;
}

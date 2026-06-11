"use client";

import { useEffect } from "react";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";

export function PortalAnalytics() {
  useEffect(() => {
    trackEvent(AnalyticsEvent.PortalOpen);
  }, []);
  return null;
}

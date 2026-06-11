"use client";

// Plausible Analytics — privacy-first, no cookies, GDPR compliant.
// The script is loaded via <PlausibleScript> in the root layout.
// Call trackEvent() from client components for custom events.

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
  }
}

export function trackEvent(
  event: string,
  props?: Record<string, string>,
): void {
  if (typeof window === "undefined") return;
  window.plausible?.(event, props ? { props } : undefined);
}

// Named events tracked by Sarion:
export const AnalyticsEvent = {
  Signup: "Signup",
  BillingUpgrade: "Billing Upgrade",
  PortalOpen: "Portal Open",
} as const;

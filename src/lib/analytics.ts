"use client";

// Client-side analytics. Events are sent to PostHog (initialized in
// <PostHogProvider>) and mirrored to Plausible so existing privacy-first
// dashboards keep working. Safe to call from any client component — no-ops
// during SSR and when no provider/key is configured.

import posthog from "posthog-js";

import {
  ANALYTICS_EVENTS,
  type AnalyticsProps,
} from "@/lib/analytics-events";

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
  }
}

/** Plausible only accepts string props — coerce primitives to strings. */
function toStringProps(props?: AnalyticsProps): Record<string, string> | undefined {
  if (!props) return undefined;
  return Object.fromEntries(
    Object.entries(props).map(([k, v]) => [k, String(v)]),
  );
}

/** Whether PostHog has a key configured (set by the provider on init). */
function posthogReady(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

export function trackEvent(event: string, props?: AnalyticsProps): void {
  if (typeof window === "undefined") return;

  // PostHog (primary).
  try {
    if (posthogReady()) posthog.capture(event, props);
  } catch {
    /* analytics must never break the UI */
  }

  // Plausible (mirror — string props only).
  try {
    const p = toStringProps(props);
    window.plausible?.(event, p ? { props: p } : undefined);
  } catch {
    /* ignore */
  }
}

/**
 * Associate subsequent events with a stable user id after login/signup. We pass
 * only non-PII person properties (plan tier) — never email or name.
 */
export function identifyUser(
  userId: string,
  props?: AnalyticsProps,
): void {
  if (typeof window === "undefined" || !posthogReady()) return;
  try {
    posthog.identify(userId, props);
  } catch {
    /* ignore */
  }
}

/** Clear identity on logout so the next session starts anonymous. */
export function resetAnalytics(): void {
  if (typeof window === "undefined" || !posthogReady()) return;
  try {
    posthog.reset();
  } catch {
    /* ignore */
  }
}

/** Client-side error tracking — forwards to PostHog's exception capture. */
export function captureException(
  error: unknown,
  context?: AnalyticsProps,
): void {
  if (typeof window === "undefined" || !posthogReady()) return;
  try {
    posthog.captureException(
      error instanceof Error ? error : new Error(String(error)),
      context,
    );
  } catch {
    /* ignore */
  }
}

/** Back-compat alias — existing call sites import `AnalyticsEvent`. */
export const AnalyticsEvent = ANALYTICS_EVENTS;

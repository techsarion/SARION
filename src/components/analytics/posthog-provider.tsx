"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { trackEvent } from "@/lib/analytics";

/**
 * Initializes PostHog on the client with a privacy-safe configuration:
 *   • person profiles only for identified users (no anon profiles)
 *   • autocapture OFF — we send explicit, named events only (no PII scraping)
 *   • session recording OFF
 *   • respects Do Not Track
 *   • client-side exception capture ON for error tracking
 *
 * Also wires a single delegated click listener that fires "Signup Clicked"
 * whenever any link to /signup is activated — so we don't have to instrument
 * every CTA across the marketing site.
 *
 * Renders nothing; mount once near the root of the tree.
 */
export function PostHogProvider() {
  const pathname = usePathname();

  // Init once.
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      person_profiles: "identified_only",
      autocapture: false,
      capture_pageview: false, // we send named marketing events instead
      capture_pageleave: true,
      disable_session_recording: true,
      respect_dnt: true,
      capture_exceptions: true, // PostHog error tracking
      persistence: "localStorage+cookie",
    });
  }, []);

  // Delegated "Signup Clicked" capture for any /signup link.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (href && /^\/signup(\b|\/|\?|#|$)/.test(href)) {
        trackEvent(ANALYTICS_EVENTS.SignupClicked, { from: pathname || "/" });
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname]);

  return null;
}

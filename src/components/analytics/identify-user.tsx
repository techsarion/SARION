"use client";

import { useEffect } from "react";

import { identifyUser } from "@/lib/analytics";

/**
 * Associates the current PostHog session with the authenticated user's stable
 * id so client + server events stitch into one person. Only non-PII person
 * properties are sent (plan tier) — never email or name. Renders nothing.
 */
export function IdentifyUser({
  userId,
  planTier,
}: {
  userId: string;
  planTier?: string;
}) {
  useEffect(() => {
    if (!userId) return;
    identifyUser(userId, planTier ? { plan_tier: planTier } : undefined);
  }, [userId, planTier]);
  return null;
}

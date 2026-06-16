import "server-only";

import { PostHog } from "posthog-node";

import type { AnalyticsEventName, AnalyticsProps } from "@/lib/analytics-events";

/**
 * Server-side analytics for events that originate on the server (signup hook,
 * server actions, billing webhooks). Uses posthog-node with immediate flushing
 * so events are delivered before a serverless function suspends.
 *
 * All helpers are best-effort and never throw — analytics must not be able to
 * break a request. Distinct ids are stable user/agency ids (never PII).
 */

let client: PostHog | null = null;

function getClient(): PostHog | null {
  const key =
    process.env.POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
  if (!key) return null;
  if (!client) {
    client = new PostHog(key, {
      host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      // Serverless-friendly: send each event right away.
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

export interface ServerEventInput {
  /** Stable id used to stitch the funnel — e.g. a user id or `agency_<id>`. */
  distinctId: string;
  event: AnalyticsEventName;
  properties?: AnalyticsProps;
  /** Optional agency grouping for group analytics / funnels by workspace. */
  agencyId?: string;
}

/** Capture a server event and flush immediately. Never throws. */
export async function captureServer(input: ServerEventInput): Promise<void> {
  const c = getClient();
  if (!c) return;
  try {
    c.capture({
      distinctId: input.distinctId,
      event: input.event,
      properties: {
        ...input.properties,
        ...(input.agencyId ? { agency_id: input.agencyId } : {}),
        $process_person_profile: false, // keep server events person-light
      },
      ...(input.agencyId ? { groups: { agency: input.agencyId } } : {}),
    });
    await c.flush();
  } catch (err) {
    console.error("[analytics] captureServer failed:", err);
  }
}

/** Server-side error tracking — forwards to PostHog exception capture. */
export async function captureServerException(
  error: unknown,
  distinctId = "server",
  context?: AnalyticsProps,
): Promise<void> {
  const c = getClient();
  if (!c) return;
  try {
    const err = error instanceof Error ? error : new Error(String(error));
    c.captureException(err, distinctId, context);
    await c.flush();
  } catch (e) {
    console.error("[analytics] captureServerException failed:", e);
  }
}

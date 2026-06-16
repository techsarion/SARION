"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireAgency, requireOwner } from "@/server/auth-context";
import { captureServer } from "@/lib/posthog-server";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

/** The three feedback categories surfaced in the widget. */
export const FEEDBACK_TYPES = [
  "feature_request",
  "bug_report",
  "general",
] as const;

/** Workflow states an owner can move a submission through. */
export const FEEDBACK_STATUSES = [
  "open",
  "in_review",
  "planned",
  "completed",
  "declined",
] as const;

const submitSchema = z.object({
  type: z.enum(FEEDBACK_TYPES),
  title: z.string().trim().min(3, "Give it a short title").max(140),
  description: z.string().trim().min(5, "Tell us a little more").max(5000),
});

export interface SubmitFeedbackInput {
  type: (typeof FEEDBACK_TYPES)[number];
  title: string;
  description: string;
}

export type SubmitFeedbackResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Record a piece of feedback from the authenticated user. Scoped to the
 * caller's agency + user id so submissions are always attributable and
 * tenant-isolated. Any authenticated member may submit.
 */
export async function submitFeedback(
  input: SubmitFeedbackInput,
): Promise<SubmitFeedbackResult> {
  const { agencyId, userId } = await requireAgency();

  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.feedback.create({
    data: {
      agencyId,
      userId,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
    },
  });

  revalidatePath("/settings/feedback");

  await captureServer({
    distinctId: userId,
    event: ANALYTICS_EVENTS.FeedbackSubmitted,
    agencyId,
    properties: { type: parsed.data.type },
  });

  return { ok: true };
}

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(FEEDBACK_STATUSES),
});

export type UpdateFeedbackStatusResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Update the workflow status of a submission (owner-only). Scoped by agencyId
 * so an owner can only touch their own agency's feedback.
 */
export async function updateFeedbackStatus(
  id: string,
  status: (typeof FEEDBACK_STATUSES)[number],
): Promise<UpdateFeedbackStatusResult> {
  const { agencyId } = await requireOwner();

  const parsed = statusSchema.safeParse({ id, status });
  if (!parsed.success) {
    return { ok: false, error: "Invalid status update." };
  }

  const result = await db.feedback.updateMany({
    where: { id: parsed.data.id, agencyId },
    data: { status: parsed.data.status },
  });

  if (result.count === 0) {
    return { ok: false, error: "Feedback not found." };
  }

  revalidatePath("/settings/feedback");
  return { ok: true };
}

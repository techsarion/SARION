import type { Metadata } from "next";

import { db } from "@/lib/db";
import { requireOwner } from "@/server/auth-context";
import { PageWrapper } from "@/components/layout/page-wrapper";
import {
  FeedbackTable,
  type FeedbackRow,
} from "@/components/settings/feedback-table";

export const metadata: Metadata = { title: "Feedback · Sarion" };

/**
 * Owner-only review queue for in-app feedback. Lists every submission for the
 * agency, newest first, and lets the owner move each through its workflow.
 */
export default async function FeedbackPage() {
  const { agencyId } = await requireOwner();

  const feedback = await db.feedback.findMany({
    where: { agencyId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });

  const rows: FeedbackRow[] = feedback.map((f) => ({
    id: f.id,
    type: f.type,
    title: f.title,
    description: f.description,
    status: f.status,
    authorName: f.user?.name ?? f.user?.email ?? "Unknown",
    createdAt: f.createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <PageWrapper
      title="Feedback"
      description="Feature requests, bug reports, and feedback from your team."
    >
      <FeedbackTable rows={rows} />
    </PageWrapper>
  );
}

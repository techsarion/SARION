"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { logActivity } from "@/server/activity";

const commentSchema = z.object({
  author: z.string().trim().min(1, "Name is required").max(120),
  message: z.string().trim().min(1, "Comment is required").max(2000),
});

export interface PortalCommentInput {
  author: string;
  message: string;
}

export type PortalCommentResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

// Lightweight DB-based rate limit: at most RATE_LIMIT comments per client per
// window. No extra infra (Redis) — a COUNT over the client's recent comments.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Add a comment from the client portal. Authenticated by the portal token (no
 * session). The project is verified to belong to the token's client, so a
 * caller can only post to their own projects.
 */
export async function addPortalComment(
  token: string,
  projectId: string,
  input: PortalCommentInput,
): Promise<PortalCommentResult> {
  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Resolve the client from the token, then confirm the project is theirs.
  const client = await db.client.findFirst({
    where: { portalToken: token, deletedAt: null },
    select: { id: true, agencyId: true },
  });
  if (!client) {
    return { ok: false, error: "Invalid portal link." };
  }

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      clientId: client.id,
      agencyId: client.agencyId,
      deletedAt: null,
    },
    select: { id: true, name: true },
  });
  if (!project) {
    return { ok: false, error: "Project not found." };
  }

  // Rate limit per client across all of their projects.
  const since = new Date(Date.now() - RATE_WINDOW_MS);
  const recentCount = await db.portalComment.count({
    where: {
      agencyId: client.agencyId,
      project: { clientId: client.id },
      createdAt: { gt: since },
    },
  });
  if (recentCount >= RATE_LIMIT) {
    return {
      ok: false,
      error: "You're posting too quickly. Please wait a few minutes and try again.",
    };
  }

  await db.$transaction(async (tx) => {
    await tx.portalComment.create({
      data: {
        agencyId: client.agencyId,
        projectId: project.id,
        author: parsed.data.author,
        message: parsed.data.message,
      },
    });
    await logActivity(
      {
        agencyId: client.agencyId,
        clientId: client.id,
        projectId: project.id,
        type: "Portal Comment",
        description: `${parsed.data.author} commented on "${project.name}".`,
      },
      tx,
    );
  });

  revalidatePath(`/portal/${token}`);
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireAgency } from "@/server/auth-context";
import { logActivity } from "@/server/activity";
import { sendInviteEmail } from "@/lib/email";
import { checkLimit } from "@/server/services/plan-limits";
import { captureServer } from "@/lib/posthog-server";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

const inviteSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export interface InviteInput {
  name: string;
  email: string;
}

export type InviteResult =
  | { ok: true; token: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
      code?: "limit";
    };

const INVITE_TTL_DAYS = 14;

/**
 * Invite a teammate (owner-only). Members always join with role=member — there
 * is no role selector. Generates an invite link/token; email delivery is out of
 * scope for the MVP. Acceptance is handled in the Better Auth signup hook,
 * which matches the invite by email and attaches the user to this agency.
 */
export async function inviteTeamMember(
  input: InviteInput,
): Promise<InviteResult> {
  const { agencyId, role, userId } = await requireAgency();

  // Only owners may invite.
  if (role !== "owner") {
    return { ok: false, error: "Only the agency owner can invite members." };
  }

  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email } = parsed.data;

  // Don't invite someone who is already on the team.
  const existingUser = await db.user.findFirst({
    where: { agencyId, email },
    select: { id: true },
  });
  if (existingUser) {
    return {
      ok: false,
      error: "That person is already a team member.",
      fieldErrors: { email: ["Already a team member."] },
    };
  }

  // Plan gate — seats are (current members + outstanding invites). Block the
  // invite if accepting it would exceed the tier's team-member quota.
  const seatCheck = await checkLimit(agencyId, "teamMembers");
  if (!seatCheck.ok) {
    return { ok: false, error: seatCheck.message!, code: "limit" };
  }
  if (seatCheck.limit !== null) {
    const pendingInvites = await db.teamInvite.count({
      where: { agencyId, acceptedAt: null, expiresAt: { gt: new Date() } },
    });
    if (seatCheck.used + pendingInvites >= seatCheck.limit) {
      return {
        ok: false,
        error:
          "You've used all your team seats (including pending invites) on this plan. Upgrade to invite more.",
        code: "limit",
      };
    }
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

  const invite = await db.$transaction(async (tx) => {
    // Refresh any existing pending invite for this email instead of stacking.
    await tx.teamInvite.deleteMany({
      where: { agencyId, email, acceptedAt: null },
    });

    const created = await tx.teamInvite.create({
      data: { agencyId, name, email, role: "member", expiresAt },
      select: { token: true },
    });

    await logActivity(
      {
        agencyId,
        type: "Team Member Invited",
        description: `${name} (${email}) was invited to the team.`,
      },
      tx,
    );

    return created;
  });

  revalidatePath("/team");

  await captureServer({
    distinctId: userId,
    event: ANALYTICS_EVENTS.TeamMemberInvited,
    agencyId,
  });

  // Send invite email — non-fatal: a failure here should not block the UI.
  // The invite token is still valid and the owner can copy/share the link.
  try {
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      select: { name: true },
    });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://trysarion.com";
    await sendInviteEmail({
      to: email,
      toName: name,
      agencyName: agency?.name ?? "Your agency",
      inviteUrl: `${appUrl}/signup?invite=${invite.token}`,
      expiryDays: INVITE_TTL_DAYS,
    });
  } catch (err) {
    console.error("[invite] Failed to send invite email:", err);
  }

  return { ok: true, token: invite.token };
}

export type RemoveMemberResult = { ok: true } | { ok: false; error: string };

/**
 * Remove a team member (owner-only). A "membership" is the User row scoped to
 * this agency, so removal deletes that user (cascading their sessions/accounts
 * per the schema). Guards: the actor must be an owner, and the workspace must
 * always retain at least one owner — so the final owner can never be removed
 * (which also blocks an owner removing themselves when they're the last owner).
 */
export async function removeTeamMember(
  memberId: string,
): Promise<RemoveMemberResult> {
  const { agencyId, role } = await requireAgency();

  if (role !== "owner") {
    return { ok: false, error: "Only the agency owner can remove members." };
  }

  const result = await db.$transaction(async (tx) => {
    // Scoped lookup confirms the target belongs to this agency.
    const target = await tx.user.findFirst({
      where: { id: memberId, agencyId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!target) return { ok: false as const, error: "Member not found." };

    // Never leave the workspace without an owner.
    if (target.role === "owner") {
      const owners = await tx.user.count({
        where: { agencyId, role: "owner" },
      });
      if (owners <= 1) {
        return {
          ok: false as const,
          error: "You can't remove the last owner of the workspace.",
        };
      }
    }

    await tx.user.delete({ where: { id: target.id } });

    await logActivity(
      {
        agencyId,
        type: "Team Member Removed",
        description: `${target.name} (${target.email}) was removed from the team.`,
      },
      tx,
    );
    return { ok: true as const };
  });

  if (!result.ok) return result;

  revalidatePath("/team");
  return { ok: true };
}

export type CancelInviteResult = { ok: true } | { ok: false; error: string };

/**
 * Cancel a pending invite (owner-only). Hard-deletes the row, which invalidates
 * its token immediately — a deleted token no longer resolves in the signup hook
 * or the public lookup, so the link stops working.
 */
export async function cancelInvite(
  inviteId: string,
): Promise<CancelInviteResult> {
  const { agencyId, role } = await requireAgency();

  if (role !== "owner") {
    return { ok: false, error: "Only the agency owner can cancel invites." };
  }

  const result = await db.$transaction(async (tx) => {
    // Scoped + still-pending guard: confirms ownership before deleting.
    const existing = await tx.teamInvite.findFirst({
      where: { id: inviteId, agencyId, acceptedAt: null },
      select: { name: true, email: true },
    });
    if (!existing) return null;

    await tx.teamInvite.delete({ where: { id: inviteId } });

    await logActivity(
      {
        agencyId,
        type: "Invite Cancelled",
        description: `Invite for ${existing.name} (${existing.email}) was cancelled.`,
      },
      tx,
    );
    return existing;
  });

  if (!result) return { ok: false, error: "Invite not found." };

  revalidatePath("/team");
  return { ok: true };
}

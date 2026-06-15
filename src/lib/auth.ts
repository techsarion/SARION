import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";
import { logActivity } from "@/server/activity";

/**
 * Better Auth — email/password only (no OAuth per Day 2 spec).
 *
 * On signup we auto-provision an Agency and attach the new user to it as the
 * owner via the `user.create.before` database hook, so every account always
 * belongs to exactly one agency.
 *
 * Team invites are TOKEN-GATED (F2 hardening): an invited user must arrive via
 * /signup?invite=<token>, which forwards the token in the signup body. The hook
 * validates the token (exists, unexpired, unaccepted) AND that the signup email
 * matches the invited email before attaching them to the inviting agency as a
 * member. Email match alone is no longer sufficient — possession of the token
 * is required.
 */
export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    // Password reset (F: account recovery) — delivered via Resend. Critical
    // path: if delivery fails, the reset request surfaces the error.
    sendResetPassword: async ({ user, url }) => {
      const { sendPasswordResetEmail } = await import("@/lib/email");
      await sendPasswordResetEmail(user.email, url);
    },
    // Security confirmation after a password is successfully reset. Best-effort
    // so a mail hiccup can never block the reset itself.
    onPasswordReset: async ({ user }) => {
      const { sendEmailSafe } = await import("@/lib/email");
      await sendEmailSafe("passwordChanged", user.email, { name: user.name });
    },
  },
  // Email verification — sent automatically on signup. NON-blocking: we do NOT
  // set requireEmailVerification, so unverified users can still use the app
  // (preserves the existing autoSignIn UX). Best-effort delivery.
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { sendEmailSafe } = await import("@/lib/email");
      await sendEmailSafe("verifyEmail", user.email, {
        verifyUrl: url,
        name: user.name,
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  user: {
    additionalFields: {
      agencyId: { type: "string", required: false, input: false },
      role: { type: "string", required: false, input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          // The invite token is forwarded in the signup body by the form.
          const rawToken = (context?.body as { inviteToken?: unknown } | undefined)
            ?.inviteToken;
          const inviteToken =
            typeof rawToken === "string" && rawToken.trim() !== ""
              ? rawToken.trim()
              : undefined;

          if (inviteToken) {
            const invite = await db.teamInvite.findUnique({
              where: { token: inviteToken },
            });

            if (!invite || invite.acceptedAt || invite.expiresAt <= new Date()) {
              throw new APIError("BAD_REQUEST", {
                message: "This invite link is invalid or has expired.",
              });
            }
            if (invite.email.toLowerCase() !== user.email.toLowerCase()) {
              throw new APIError("BAD_REQUEST", {
                message: "This invite was sent to a different email address.",
              });
            }

            // Acceptance side-effects run in the `after` hook, once the user
            // row is guaranteed to exist.
            return {
              data: { ...user, agencyId: invite.agencyId, role: "member" },
            };
          }

          // No invite token → brand-new agency, signer becomes the owner.
          // New agencies start on a 14-day no-card trial (full premium preview)
          // and lock in founding pricing while the launch offer is open.
          const { TRIAL_DAYS, isFoundingOfferOpen } = await import(
            "@/config/plans"
          );
          const trialEndsAt = new Date();
          trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

          const agency = await db.agency.create({
            data: {
              name: `${user.name}'s Agency`,
              planTier: "free",
              subscriptionStatus: "trialing",
              trialEndsAt,
              foundingMember: isFoundingOfferOpen(),
            },
          });
          return {
            data: { ...user, agencyId: agency.id, role: "owner" },
          };
        },
        after: async (user) => {
          const u = user as { email: string; name: string; agencyId?: string; role?: string };

          // New agency owners get a branded welcome email (best-effort).
          if (u.role === "owner") {
            const { sendEmailSafe } = await import("@/lib/email");
            await sendEmailSafe("welcome", u.email, { name: u.name });
            return;
          }

          // Finalize invite acceptance for members who joined via a token.
          if (u.role !== "member" || !u.agencyId) return;

          const invite = await db.teamInvite.findFirst({
            where: { agencyId: u.agencyId, email: u.email, acceptedAt: null },
          });
          if (!invite) return;

          await db.teamInvite.update({
            where: { id: invite.id },
            data: { acceptedAt: new Date() },
          });
          await logActivity({
            agencyId: u.agencyId,
            type: "Team Member Joined",
            description: `${u.name} joined the team.`,
          });
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

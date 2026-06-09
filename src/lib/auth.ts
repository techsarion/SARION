import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";

/**
 * Better Auth — email/password only (no OAuth per Day 2 spec).
 *
 * On signup we auto-provision an Agency and attach the new user to it as the
 * owner via the `user.create.before` database hook, so every account always
 * belongs to exactly one agency.
 */
export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
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
        before: async (user) => {
          const agency = await db.agency.create({
            data: { name: `${user.name}'s Agency` },
          });
          return {
            data: { ...user, agencyId: agency.id, role: "owner" },
          };
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

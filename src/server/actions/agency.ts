"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireAgency } from "@/server/auth-context";

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const agencySchema = z.object({
  name: z.string().trim().min(1, "Agency name is required").max(120),
  logoUrl: z.preprocess(
    emptyToNull,
    z.string().trim().url("Enter a valid URL").nullable(),
  ),
});

export interface AgencyInput {
  name: string;
  logoUrl?: string | null;
}

export type AgencyResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * Update agency branding (name + logo URL). Owner-only. Branding flows through
 * to the client portal header. Reuses the existing Agency.name / logoUrl fields.
 */
export async function updateAgency(input: AgencyInput): Promise<AgencyResult> {
  const { agencyId, role } = await requireAgency();

  if (role !== "owner") {
    return { ok: false, error: "Only the agency owner can edit branding." };
  }

  const parsed = agencySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.agency.update({
    where: { id: agencyId },
    data: { name: parsed.data.name, logoUrl: parsed.data.logoUrl },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

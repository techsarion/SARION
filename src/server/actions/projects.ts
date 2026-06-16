"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireAgency } from "@/server/auth-context";
import { logActivity } from "@/server/activity";
import { checkLimit } from "@/server/services/plan-limits";
import { captureServer } from "@/lib/posthog-server";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

// --- Validation ----------------------------------------------------------

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

// "YYYY-MM-DD" (or empty) -> Date | null
const dateField = z.preprocess((v) => {
  if (typeof v !== "string" || v.trim() === "") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d;
}, z.date().nullable());

const STATUS_VALUES = ["PLANNED", "ACTIVE", "COMPLETED", "ON_HOLD"] as const;

const projectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160),
  clientId: z.string().trim().min(1, "Client is required"),
  status: z.enum(STATUS_VALUES, { message: "Status is required" }),
  description: z.preprocess(
    emptyToNull,
    z.string().trim().max(5000).nullable(),
  ),
  startDate: dateField,
  dueDate: dateField,
});

// Loose input shape (raw form values); validated/narrowed by projectSchema.
export interface ProjectInput {
  name: string;
  clientId: string;
  status: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
}

export type ActionResult =
  | { ok: true; projectId: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
      code?: "limit";
    };

const STATUS_LABEL: Record<(typeof STATUS_VALUES)[number], string> = {
  PLANNED: "Planned",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

/** Confirm the client exists, is active, and belongs to this agency. */
async function assertClientOwned(agencyId: string, clientId: string) {
  const client = await db.client.findFirst({
    where: { id: clientId, agencyId, deletedAt: null },
    select: { id: true },
  });
  return Boolean(client);
}

// --- Create --------------------------------------------------------------

export async function createProject(input: ProjectInput): Promise<ActionResult> {
  const { agencyId, userId } = await requireAgency();

  // Plan gate — enforce the tier's project quota before creating.
  const limit = await checkLimit(agencyId, "projects");
  if (!limit.ok) {
    return { ok: false, error: limit.message!, code: "limit" };
  }

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Never trust clientId from input — verify ownership against the session agency.
  if (!(await assertClientOwned(agencyId, parsed.data.clientId))) {
    return {
      ok: false,
      error: "Selected client not found.",
      fieldErrors: { clientId: ["Select a valid client."] },
    };
  }

  const project = await db.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: { agencyId, ...parsed.data },
    });
    await logActivity(
      {
        agencyId,
        clientId: created.clientId,
        projectId: created.id,
        type: "Project Created",
        description: `Project "${created.name}" was created.`,
      },
      tx,
    );
    return created;
  });

  revalidatePath("/projects");

  await captureServer({
    distinctId: userId,
    event: ANALYTICS_EVENTS.ProjectCreated,
    agencyId,
    properties: { status: parsed.data.status },
  });

  return { ok: true, projectId: project.id };
}

// --- Update --------------------------------------------------------------

export async function updateProject(
  projectId: string,
  input: ProjectInput,
): Promise<ActionResult> {
  const { agencyId } = await requireAgency();

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!(await assertClientOwned(agencyId, parsed.data.clientId))) {
    return {
      ok: false,
      error: "Selected client not found.",
      fieldErrors: { clientId: ["Select a valid client."] },
    };
  }

  const result = await db.$transaction(async (tx) => {
    // Ownership guard: scoped read confirms the project belongs to the agency.
    const existing = await tx.project.findFirst({
      where: { id: projectId, agencyId, deletedAt: null },
      select: { status: true },
    });
    if (!existing) return false;

    await tx.project.update({
      where: { id: projectId },
      data: parsed.data,
    });

    const statusChanged = existing.status !== parsed.data.status;
    await logActivity(
      {
        agencyId,
        clientId: parsed.data.clientId,
        projectId,
        type: statusChanged ? "Status Changed" : "Project Updated",
        description: statusChanged
          ? `Status changed to ${STATUS_LABEL[parsed.data.status]}.`
          : "Project details were updated.",
      },
      tx,
    );
    return true;
  });

  if (!result) return { ok: false, error: "Project not found." };

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { ok: true, projectId };
}

// --- Archive (soft delete) ----------------------------------------------

export async function archiveProject(projectId: string): Promise<ActionResult> {
  const { agencyId } = await requireAgency();

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.project.findFirst({
      where: { id: projectId, agencyId, deletedAt: null },
      select: { clientId: true },
    });
    if (!existing) return false;

    await tx.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });
    await logActivity(
      {
        agencyId,
        clientId: existing.clientId,
        projectId,
        type: "Project Archived",
        description: "Project was archived.",
      },
      tx,
    );
    return true;
  });

  if (!result) return { ok: false, error: "Project not found." };

  revalidatePath("/projects");
  return { ok: true, projectId };
}

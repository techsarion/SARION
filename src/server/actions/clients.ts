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

const clientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  company: z.preprocess(emptyToNull, z.string().trim().max(120).nullable()),
  email: z.preprocess(
    emptyToNull,
    z.string().trim().email("Enter a valid email").nullable(),
  ),
  phone: z.preprocess(emptyToNull, z.string().trim().max(40).nullable()),
  notes: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable()),
});

export type ClientInput = z.input<typeof clientSchema>;

export type ActionResult =
  | { ok: true; clientId: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
      // "limit" signals the UI to surface an upgrade prompt instead of a
      // generic form error.
      code?: "limit";
    };

const notesSchema = z.object({
  notes: z.preprocess(emptyToNull, z.string().trim().max(5000).nullable()),
});

// --- Create --------------------------------------------------------------

export async function createClient(input: ClientInput): Promise<ActionResult> {
  const { agencyId, userId } = await requireAgency();

  // Plan gate — enforce the tier's client quota before creating.
  const limit = await checkLimit(agencyId, "clients");
  if (!limit.ok) {
    return { ok: false, error: limit.message!, code: "limit" };
  }

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const client = await db.$transaction(async (tx) => {
    const created = await tx.client.create({
      data: { agencyId, ...parsed.data },
    });
    await logActivity(
      {
        agencyId,
        clientId: created.id,
        type: "Client Created",
        description: `Client "${created.name}" was created.`,
      },
      tx,
    );
    return created;
  });

  revalidatePath("/clients");

  await captureServer({
    distinctId: userId,
    event: ANALYTICS_EVENTS.ClientCreated,
    agencyId,
  });

  return { ok: true, clientId: client.id };
}

// --- Update --------------------------------------------------------------

export async function updateClient(
  clientId: string,
  input: ClientInput,
): Promise<ActionResult> {
  const { agencyId } = await requireAgency();

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Ownership enforced by the agencyId predicate — updateMany returns 0 if the
  // client belongs to another agency or is archived.
  const result = await db.$transaction(async (tx) => {
    const { count } = await tx.client.updateMany({
      where: { id: clientId, agencyId, deletedAt: null },
      data: parsed.data,
    });
    if (count === 0) return false;
    await logActivity(
      {
        agencyId,
        clientId,
        type: "Client Updated",
        description: `Client details were updated.`,
      },
      tx,
    );
    return true;
  });

  if (!result) return { ok: false, error: "Client not found." };

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  return { ok: true, clientId };
}

// --- Notes ---------------------------------------------------------------

export async function updateNotes(
  clientId: string,
  input: { notes: string },
): Promise<ActionResult> {
  const { agencyId } = await requireAgency();

  const parsed = notesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Notes are too long." };
  }

  const result = await db.$transaction(async (tx) => {
    const { count } = await tx.client.updateMany({
      where: { id: clientId, agencyId, deletedAt: null },
      data: { notes: parsed.data.notes },
    });
    if (count === 0) return false;
    await logActivity(
      {
        agencyId,
        clientId,
        type: "Note Added",
        description: "Notes were updated.",
      },
      tx,
    );
    return true;
  });

  if (!result) return { ok: false, error: "Client not found." };

  revalidatePath(`/clients/${clientId}`);
  return { ok: true, clientId };
}

// --- Archive (soft delete) ----------------------------------------------

export async function archiveClient(clientId: string): Promise<ActionResult> {
  const { agencyId } = await requireAgency();

  const result = await db.$transaction(async (tx) => {
    const { count } = await tx.client.updateMany({
      where: { id: clientId, agencyId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (count === 0) return false;
    await logActivity(
      {
        agencyId,
        clientId,
        type: "Client Archived",
        description: "Client was archived.",
      },
      tx,
    );
    return true;
  });

  if (!result) return { ok: false, error: "Client not found." };

  revalidatePath("/clients");
  return { ok: true, clientId };
}

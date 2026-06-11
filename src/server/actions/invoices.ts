"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireAgency } from "@/server/auth-context";
import { logActivity } from "@/server/activity";
import { generateInvoiceNumber } from "@/server/services/invoice-number";

// --- Validation ----------------------------------------------------------

// "YYYY-MM-DD" (or empty) -> Date | null
const dateField = z.preprocess((v) => {
  if (typeof v !== "string" || v.trim() === "") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d;
}, z.date().nullable());

// Required date (issue date always has a value).
const requiredDate = z.preprocess((v) => {
  if (typeof v !== "string" || v.trim() === "") return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d;
}, z.date({ message: "A valid date is required" }));

const itemSchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(500),
  qty: z.coerce.number().int("Qty must be a whole number").positive("Qty must be at least 1"),
  unitPrice: z.coerce
    .number()
    .min(0, "Unit price cannot be negative")
    .max(99_999_999, "Unit price is too large"),
});

const invoiceSchema = z.object({
  clientId: z.string().trim().min(1, "Client is required"),
  status: z.enum(["paid", "unpaid"], { message: "Status is required" }),
  issueDate: requiredDate,
  dueDate: dateField,
  items: z.array(itemSchema).min(1, "Add at least one line item"),
});

// Loose input shape (raw form values); validated/narrowed by invoiceSchema.
export interface InvoiceItemInput {
  description: string;
  qty: number | string;
  unitPrice: number | string;
}

export interface InvoiceInput {
  clientId: string;
  status: string;
  issueDate: string;
  dueDate?: string | null;
  items: InvoiceItemInput[];
}

export type ActionResult =
  | { ok: true; invoiceId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/** Round to 2 decimal places, returned as a number safe for Decimal columns. */
function money(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Confirm the client exists, is active, and belongs to this agency. */
async function assertClientOwned(agencyId: string, clientId: string) {
  const client = await db.client.findFirst({
    where: { id: clientId, agencyId, deletedAt: null },
    select: { id: true },
  });
  return Boolean(client);
}

function computeItems(items: z.infer<typeof itemSchema>[]) {
  const prepared = items.map((it) => ({
    description: it.description,
    qty: it.qty,
    unitPrice: money(it.unitPrice),
    lineTotal: money(it.qty * it.unitPrice),
  }));
  const total = money(prepared.reduce((sum, it) => sum + it.lineTotal, 0));
  return { prepared, total };
}

// --- Create --------------------------------------------------------------

export async function createInvoice(input: InvoiceInput): Promise<ActionResult> {
  const { agencyId } = await requireAgency();

  const parsed = invoiceSchema.safeParse(input);
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

  const { prepared, total } = computeItems(parsed.data.items);

  const invoice = await db.$transaction(async (tx) => {
    const number = await generateInvoiceNumber(agencyId, tx);

    const created = await tx.invoice.create({
      data: {
        agencyId,
        clientId: parsed.data.clientId,
        number,
        status: parsed.data.status,
        issueDate: parsed.data.issueDate,
        dueDate: parsed.data.dueDate,
        total,
        items: {
          create: prepared.map((it) => ({ agencyId, ...it })),
        },
      },
    });

    await logActivity(
      {
        agencyId,
        clientId: created.clientId,
        type: "Invoice Created",
        description: `Invoice ${created.number} was created (${formatMoney(total)}).`,
      },
      tx,
    );
    return created;
  });

  revalidatePath("/invoices");
  revalidatePath(`/clients/${invoice.clientId}`);
  return { ok: true, invoiceId: invoice.id };
}

// --- Update --------------------------------------------------------------

export async function updateInvoice(
  invoiceId: string,
  input: InvoiceInput,
): Promise<ActionResult> {
  const { agencyId } = await requireAgency();

  const parsed = invoiceSchema.safeParse(input);
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

  const { prepared, total } = computeItems(parsed.data.items);

  const result = await db.$transaction(async (tx) => {
    // Ownership guard: scoped read confirms the invoice belongs to the agency.
    const existing = await tx.invoice.findFirst({
      where: { id: invoiceId, agencyId, deletedAt: null },
      select: { id: true, number: true },
    });
    if (!existing) return null;

    // Replace line items wholesale (scoped by agency for defense in depth).
    await tx.invoiceItem.deleteMany({ where: { invoiceId, agencyId } });

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        clientId: parsed.data.clientId,
        status: parsed.data.status,
        issueDate: parsed.data.issueDate,
        dueDate: parsed.data.dueDate,
        total,
        items: {
          create: prepared.map((it) => ({ agencyId, ...it })),
        },
      },
    });

    await logActivity(
      {
        agencyId,
        clientId: parsed.data.clientId,
        type: "Invoice Updated",
        description: `Invoice ${existing.number} was updated (${formatMoney(total)}).`,
      },
      tx,
    );
    return existing;
  });

  if (!result) return { ok: false, error: "Invoice not found." };

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath(`/clients/${parsed.data.clientId}`);
  return { ok: true, invoiceId };
}

// --- Archive (soft delete) ----------------------------------------------

export async function archiveInvoice(invoiceId: string): Promise<ActionResult> {
  const { agencyId } = await requireAgency();

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.invoice.findFirst({
      where: { id: invoiceId, agencyId, deletedAt: null },
      select: { clientId: true, number: true },
    });
    if (!existing) return null;

    await tx.invoice.update({
      where: { id: invoiceId },
      data: { deletedAt: new Date() },
    });
    await logActivity(
      {
        agencyId,
        clientId: existing.clientId,
        type: "Invoice Archived",
        description: `Invoice ${existing.number} was archived.`,
      },
      tx,
    );
    return existing;
  });

  if (!result) return { ok: false, error: "Invoice not found." };

  revalidatePath("/invoices");
  revalidatePath(`/clients/${result.clientId}`);
  return { ok: true, invoiceId };
}

// --- Mark Paid / Unpaid --------------------------------------------------

async function setStatus(
  invoiceId: string,
  status: "paid" | "unpaid",
): Promise<ActionResult> {
  const { agencyId } = await requireAgency();

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.invoice.findFirst({
      where: { id: invoiceId, agencyId, deletedAt: null },
      select: { clientId: true, number: true, status: true },
    });
    if (!existing) return null;
    if (existing.status === status) return existing; // no-op, still success

    await tx.invoice.update({
      where: { id: invoiceId },
      data: { status },
    });
    await logActivity(
      {
        agencyId,
        clientId: existing.clientId,
        type: status === "paid" ? "Invoice Paid" : "Invoice Unpaid",
        description:
          status === "paid"
            ? `Invoice ${existing.number} was marked paid.`
            : `Invoice ${existing.number} was marked unpaid.`,
      },
      tx,
    );
    return existing;
  });

  if (!result) return { ok: false, error: "Invoice not found." };

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath(`/clients/${result.clientId}`);
  return { ok: true, invoiceId };
}

export async function markInvoicePaid(invoiceId: string): Promise<ActionResult> {
  return setStatus(invoiceId, "paid");
}

export async function markInvoiceUnpaid(
  invoiceId: string,
): Promise<ActionResult> {
  return setStatus(invoiceId, "unpaid");
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

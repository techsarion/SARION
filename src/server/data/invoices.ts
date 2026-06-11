import "server-only";

import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * All functions REQUIRE an agencyId and filter by it — tenant isolation is
 * enforced at the data layer so no caller can cross agencies. Mirrors
 * src/server/data/clients.ts and projects.ts. Decimal columns are converted to
 * plain numbers at this boundary so server components can pass them to client
 * components without serialization issues.
 */

export interface InvoiceListItem {
  id: string;
  number: string;
  status: string;
  total: number;
  issueDate: Date;
  dueDate: Date | null;
  createdAt: Date;
  clientName: string;
}

export type InvoiceStatusFilter = "all" | "paid" | "unpaid" | "overdue";

/** Active invoices for an agency, with search + status filtering. */
export async function listInvoices(
  agencyId: string,
  options: { search?: string; status?: InvoiceStatusFilter } = {},
): Promise<InvoiceListItem[]> {
  const term = options.search?.trim();
  const filter = options.status ?? "all";

  // "overdue" has no stored value — it is unpaid + past due, applied below.
  const statusWhere: Prisma.InvoiceWhereInput =
    filter === "paid"
      ? { status: "paid" }
      : filter === "unpaid"
        ? { status: "unpaid" }
        : filter === "overdue"
          ? { status: "unpaid", dueDate: { lt: startOfToday() } }
          : {};

  const invoices = await db.invoice.findMany({
    where: {
      agencyId,
      deletedAt: null,
      ...statusWhere,
      ...(term
        ? {
            OR: [
              { number: { contains: term, mode: "insensitive" } },
              { client: { name: { contains: term, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      number: true,
      status: true,
      total: true,
      issueDate: true,
      dueDate: true,
      createdAt: true,
      client: { select: { name: true } },
    },
  });

  return invoices.map(({ client, total, ...inv }) => ({
    ...inv,
    total: Number(total),
    clientName: client.name,
  }));
}

export interface InvoiceDetail {
  id: string;
  number: string;
  status: string;
  total: number;
  issueDate: Date;
  dueDate: Date | null;
  createdAt: Date;
  clientId: string;
  clientName: string;
  items: {
    id: string;
    description: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

/** A single active invoice owned by the agency, with its line items + client. */
export async function getInvoice(
  agencyId: string,
  invoiceId: string,
): Promise<InvoiceDetail | null> {
  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, agencyId, deletedAt: null },
    select: {
      id: true,
      number: true,
      status: true,
      total: true,
      issueDate: true,
      dueDate: true,
      createdAt: true,
      clientId: true,
      client: { select: { name: true } },
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          description: true,
          qty: true,
          unitPrice: true,
          lineTotal: true,
        },
      },
    },
  });

  if (!invoice) return null;

  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    total: Number(invoice.total),
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    createdAt: invoice.createdAt,
    clientId: invoice.clientId,
    clientName: invoice.client.name,
    items: invoice.items.map((i) => ({
      id: i.id,
      description: i.description,
      qty: i.qty,
      unitPrice: Number(i.unitPrice),
      lineTotal: Number(i.lineTotal),
    })),
  };
}

export interface ClientInvoiceSummary {
  id: string;
  number: string;
  status: string;
  total: number;
  dueDate: Date | null;
}

/** Recent invoices for a single client (newest first), agency-scoped. */
export async function getClientInvoices(
  agencyId: string,
  clientId: string,
  take = 5,
): Promise<ClientInvoiceSummary[]> {
  const invoices = await db.invoice.findMany({
    where: { agencyId, clientId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      number: true,
      status: true,
      total: true,
      dueDate: true,
    },
  });

  return invoices.map(({ total, ...inv }) => ({ ...inv, total: Number(total) }));
}

/** Active clients (id + name) for the invoice form's client dropdown. */
export async function getClientOptions(agencyId: string) {
  return db.client.findMany({
    where: { agencyId, deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

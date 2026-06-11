import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireAgency } from "@/server/auth-context";
import { getInvoice, getClientOptions } from "@/server/data/invoices";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export const metadata: Metadata = { title: "Edit Invoice · Sarion" };

function toDateInput(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { agencyId } = await requireAgency();
  const { invoiceId } = await params;
  const [invoice, clients] = await Promise.all([
    getInvoice(agencyId, invoiceId),
    getClientOptions(agencyId),
  ]);

  if (!invoice) notFound();

  return (
    <PageWrapper
      title={`Edit ${invoice.number}`}
      description="Update this invoice's details and line items."
    >
      <InvoiceForm
        mode="edit"
        clients={clients}
        invoiceId={invoice.id}
        defaultValues={{
          clientId: invoice.clientId,
          status: invoice.status === "paid" ? "paid" : "unpaid",
          issueDate: toDateInput(invoice.issueDate),
          dueDate: toDateInput(invoice.dueDate),
          items: invoice.items.map((i) => ({
            description: i.description,
            qty: String(i.qty),
            unitPrice: String(i.unitPrice),
          })),
        }}
      />
    </PageWrapper>
  );
}

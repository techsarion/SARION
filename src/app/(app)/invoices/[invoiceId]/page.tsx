import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { requireAgency } from "@/server/auth-context";
import { getInvoice } from "@/server/data/invoices";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceStatusActions } from "@/components/invoices/invoice-status-actions";
import { ArchiveInvoiceButton } from "@/components/invoices/archive-invoice-button";
import {
  INVOICE_STATUS_VARIANT,
  invoiceStatusLabel,
  displayStatus,
} from "@/lib/invoice-status";

export const metadata: Metadata = { title: "Invoice · Sarion" };

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { agencyId } = await requireAgency();
  const { invoiceId } = await params;
  const invoice = await getInvoice(agencyId, invoiceId);

  if (!invoice) notFound();

  const shown = displayStatus(invoice.status, invoice.dueDate);

  return (
    <PageWrapper
      title={invoice.number}
      description={`Client: ${invoice.clientName}`}
      action={
        <div className="flex items-center gap-2">
          <InvoiceStatusActions
            invoiceId={invoice.id}
            status={invoice.status}
          />
          <Button asChild variant="outline" size="sm">
            <Link href={`/invoices/${invoice.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          <ArchiveInvoiceButton
            invoiceId={invoice.id}
            invoiceNumber={invoice.number}
          />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Info label="Invoice Number" value={invoice.number} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Client
              </p>
              <p className="mt-1 text-sm">
                <Link
                  href={`/clients/${invoice.clientId}`}
                  className="hover:text-primary hover:underline"
                >
                  {invoice.clientName}
                </Link>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <p className="mt-1">
                <Badge variant={INVOICE_STATUS_VARIANT[shown]}>
                  {invoiceStatusLabel(shown)}
                </Badge>
              </p>
            </div>
            <Info label="Issue Date" value={formatDate(invoice.issueDate)} />
            <Info label="Due Date" value={formatDate(invoice.dueDate)} />
            <Info label="Created" value={formatDate(invoice.createdAt)} />
          </CardContent>
        </Card>

        {/* Line items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="pr-6 text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-6">{item.description}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.qty}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(item.unitPrice)}
                    </TableCell>
                    <TableCell className="pr-6 text-right font-medium tabular-nums">
                      {formatMoney(item.lineTotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-end gap-6 border-t px-6 py-4">
              <span className="text-sm font-medium text-muted-foreground">
                Invoice Total
              </span>
              <span className="text-2xl font-semibold tabular-nums">
                {formatMoney(invoice.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

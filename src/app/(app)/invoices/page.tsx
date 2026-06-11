import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

import { requireAgency } from "@/server/auth-context";
import {
  listInvoices,
  type InvoiceStatusFilter,
} from "@/server/data/invoices";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoicesToolbar } from "@/components/invoices/invoices-toolbar";
import {
  INVOICE_STATUS_VARIANT,
  invoiceStatusLabel,
  displayStatus,
} from "@/lib/invoice-status";

export const metadata: Metadata = { title: "Invoices · Sarion" };

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

const VALID_FILTERS: InvoiceStatusFilter[] = ["all", "paid", "unpaid", "overdue"];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { agencyId } = await requireAgency();
  const { q, status } = await searchParams;
  const filter: InvoiceStatusFilter = VALID_FILTERS.includes(
    status as InvoiceStatusFilter,
  )
    ? (status as InvoiceStatusFilter)
    : "all";

  const invoices = await listInvoices(agencyId, { search: q, status: filter });

  const isEmpty = invoices.length === 0;
  const isFiltering = Boolean(q?.trim()) || filter !== "all";

  return (
    <PageWrapper
      title="Invoices"
      description="Create, track, and get paid for your work."
      action={
        <Button asChild variant="brand">
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <InvoicesToolbar />

        {isEmpty && !isFiltering ? (
          <EmptyState />
        ) : isEmpty ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              No invoices match your filters.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0"><div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const shown = displayStatus(invoice.status, invoice.dueDate);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="pl-6 font-medium">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="hover:text-primary hover:underline"
                          >
                            {invoice.number}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {invoice.clientName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={INVOICE_STATUS_VARIANT[shown]}>
                            {invoiceStatusLabel(shown)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
                          {formatMoney(invoice.total)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invoice.dueDate)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invoice.createdAt)}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/invoices/${invoice.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileText className="h-6 w-6" />
        </span>
        <p className="text-lg font-semibold">No invoices yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Create your first invoice to start billing your clients.
        </p>
        <Button asChild variant="brand" className="mt-2">
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

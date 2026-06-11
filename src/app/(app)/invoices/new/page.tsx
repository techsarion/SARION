import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";

import { requireAgency } from "@/server/auth-context";
import { getClientOptions } from "@/server/data/invoices";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceForm } from "@/components/invoices/invoice-form";

export const metadata: Metadata = { title: "New Invoice · Sarion" };

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { agencyId } = await requireAgency();
  const { clientId } = await searchParams;
  const clients = await getClientOptions(agencyId);

  // Only honor a pre-selected client that actually belongs to this agency.
  const presetClientId = clients.some((c) => c.id === clientId)
    ? clientId
    : undefined;

  return (
    <PageWrapper
      title="New Invoice"
      description="Add line items — the total is calculated automatically."
    >
      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </span>
            <p className="text-lg font-semibold">Add a client first</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Invoices belong to a client. Create a client before billing.
            </p>
            <Button asChild variant="brand" className="mt-2">
              <Link href="/clients/new">Add Client</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <InvoiceForm
          mode="create"
          clients={clients}
          defaultClientId={presetClientId}
        />
      )}
    </PageWrapper>
  );
}

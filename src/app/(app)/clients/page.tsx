import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { requireAgency } from "@/server/auth-context";
import { listClients } from "@/server/data/clients";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientsSearch } from "@/components/clients/clients-search";

export const metadata: Metadata = { title: "Clients · Sarion" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { agencyId } = await requireAgency();
  const { q } = await searchParams;
  const clients = await listClients(agencyId, q);

  const isEmpty = clients.length === 0;
  const isSearching = Boolean(q?.trim());

  return (
    <PageWrapper
      title="Clients"
      description="Manage your agency's clients and their history."
      action={
        <Button asChild variant="brand">
          <Link href="/clients/new">
            <Plus className="h-4 w-4" />
            Add Client
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <ClientsSearch />

        {isEmpty && !isSearching ? (
          <EmptyState />
        ) : isEmpty ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              No clients match “{q}”.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Projects</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="pl-6 font-medium">
                        <Link
                          href={`/clients/${client.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {client.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.company ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.email ?? "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        {client.projectCount}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(client.createdAt)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/clients/${client.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
          <Users className="h-6 w-6" />
        </span>
        <p className="text-lg font-semibold">No clients yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Create your first client to start managing projects.
        </p>
        <Button asChild variant="brand" className="mt-2">
          <Link href="/clients/new">
            <Plus className="h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

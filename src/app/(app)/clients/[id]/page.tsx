import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { requireAgency } from "@/server/auth-context";
import { getClient } from "@/server/data/clients";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotesEditor } from "@/components/clients/notes-editor";
import { ArchiveClientButton } from "@/components/clients/archive-client-button";

export const metadata: Metadata = { title: "Client · Sarion" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const ACTIVITY_VARIANT: Record<
  string,
  "info" | "success" | "warning" | "secondary"
> = {
  "Client Created": "success",
  "Client Updated": "info",
  "Note Added": "secondary",
  "Client Archived": "warning",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { agencyId } = await requireAgency();
  const { id } = await params;
  const client = await getClient(agencyId, id);

  if (!client) notFound();

  return (
    <PageWrapper
      title={client.name}
      description={client.company ?? "Client details"}
      action={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/clients/${client.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          <ArchiveClientButton clientId={client.id} clientName={client.name} />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* SECTION 1 — Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info label="Name" value={client.name} />
              <Info label="Company" value={client.company} />
              <Info label="Email" value={client.email} />
              <Info label="Phone" value={client.phone} />
              <Info label="Created" value={formatDate(client.createdAt)} />
            </CardContent>
          </Card>

          {/* SECTION 2 — Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <NotesEditor
                clientId={client.id}
                initialNotes={client.notes ?? ""}
              />
            </CardContent>
          </Card>

          {/* SECTION 3 — Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <Placeholder text="No projects yet" />
            </CardContent>
          </Card>

          {/* SECTION 4 — Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Placeholder text="No invoices yet" />
            </CardContent>
          </Card>
        </div>

        {/* SECTION 5 — Recent Activity */}
        <Card className="lg:sticky lg:top-0 lg:self-start">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {client.activities.length === 0 ? (
              <Placeholder text="No activity yet" />
            ) : (
              <ul className="space-y-4">
                {client.activities.map((activity) => (
                  <li key={activity.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={ACTIVITY_VARIANT[activity.type] ?? "secondary"}
                      >
                        {activity.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(activity.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

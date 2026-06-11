import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { requireAgency } from "@/server/auth-context";
import { getProject } from "@/server/data/projects";
import { getClientInvoices } from "@/server/data/invoices";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArchiveProjectButton } from "@/components/projects/archive-project-button";
import { InvoiceMiniList } from "@/components/invoices/invoice-mini-list";
import { PROJECT_STATUS_VARIANT, statusLabel } from "@/lib/project-status";
import { ACTIVITY_VARIANT } from "@/lib/activity-style";

export const metadata: Metadata = { title: "Project · Sarion" };

function formatDate(date: Date | null) {
  if (!date) return "—";
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

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { agencyId } = await requireAgency();
  const { id } = await params;
  const project = await getProject(agencyId, id);

  if (!project) notFound();

  // Invoices are client-scoped (no Invoice.projectId in the schema), so the
  // project view surfaces the invoices for this project's client.
  const invoices = await getClientInvoices(agencyId, project.client.id);

  return (
    <PageWrapper
      title={project.name}
      description={`Client: ${project.client.name}`}
      action={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${project.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
          <ArchiveProjectButton
            projectId={project.id}
            projectName={project.name}
          />
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info label="Name" value={project.name} />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Client
                </p>
                <p className="mt-1 text-sm">
                  <Link
                    href={`/clients/${project.client.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {project.client.name}
                  </Link>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <p className="mt-1">
                  <Badge variant={PROJECT_STATUS_VARIANT[project.status]}>
                    {statusLabel(project.status)}
                  </Badge>
                </p>
              </div>
              <Info label="Start Date" value={formatDate(project.startDate)} />
              <Info label="Due Date" value={formatDate(project.dueDate)} />
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {project.description?.trim() ? project.description : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tasks — placeholder (future) */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <Placeholder text="Tasks coming soon" />
            </CardContent>
          </Card>

          {/* Invoices (client-scoped) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Invoices</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/invoices?q=${encodeURIComponent(project.client.name)}`}>
                  View All Invoices
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <Placeholder text="No invoices for this client yet" />
              ) : (
                <InvoiceMiniList invoices={invoices} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity History */}
        <Card className="lg:sticky lg:top-0 lg:self-start">
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
          </CardHeader>
          <CardContent>
            {project.activities.length === 0 ? (
              <Placeholder text="No activity yet" />
            ) : (
              <ul className="space-y-4">
                {project.activities.map((activity) => (
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

function Placeholder({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

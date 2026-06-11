import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";

import { requireAgency } from "@/server/auth-context";
import { listProjects } from "@/server/data/projects";
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
import { ProjectsSearch } from "@/components/projects/projects-search";
import { PROJECT_STATUS_VARIANT, statusLabel } from "@/lib/project-status";

export const metadata: Metadata = { title: "Projects · Sarion" };

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { agencyId } = await requireAgency();
  const { q } = await searchParams;
  const projects = await listProjects(agencyId, q);

  const isEmpty = projects.length === 0;
  const isSearching = Boolean(q?.trim());

  return (
    <PageWrapper
      title="Projects"
      description="Track every project from kickoff to delivery."
      action={
        <Button asChild variant="brand">
          <Link href="/projects/new">
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <ProjectsSearch />

        {isEmpty && !isSearching ? (
          <EmptyState />
        ) : isEmpty ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              No projects match “{q}”.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0"><div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="pl-6 font-medium">
                        <Link
                          href={`/projects/${project.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {project.clientName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={PROJECT_STATUS_VARIANT[project.status]}>
                          {statusLabel(project.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(project.dueDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(project.createdAt)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/projects/${project.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
          <FolderKanban className="h-6 w-6" />
        </span>
        <p className="text-lg font-semibold">No projects yet</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Create your first project to start tracking your work.
        </p>
        <Button asChild variant="brand" className="mt-2">
          <Link href="/projects/new">
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

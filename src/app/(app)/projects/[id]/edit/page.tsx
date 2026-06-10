import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireAgency } from "@/server/auth-context";
import { getProject, getClientOptions } from "@/server/data/projects";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { ProjectForm } from "@/components/projects/project-form";

export const metadata: Metadata = { title: "Edit Project · Sarion" };

function toDateInput(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { agencyId } = await requireAgency();
  const { id } = await params;
  const [project, clients] = await Promise.all([
    getProject(agencyId, id),
    getClientOptions(agencyId),
  ]);

  if (!project) notFound();

  return (
    <PageWrapper
      title={`Edit ${project.name}`}
      description="Update this project's details."
    >
      <ProjectForm
        mode="edit"
        clients={clients}
        projectId={project.id}
        defaultValues={{
          name: project.name,
          clientId: project.clientId,
          status: project.status,
          description: project.description ?? "",
          startDate: toDateInput(project.startDate),
          dueDate: toDateInput(project.dueDate),
        }}
      />
    </PageWrapper>
  );
}

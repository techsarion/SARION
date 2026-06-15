import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPortalData, logPortalView } from "@/server/data/portal";
import { PortalAnalytics } from "@/components/portal/portal-analytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortalCommentForm } from "@/components/portal/portal-comment-form";
import { PROJECT_STATUS_VARIANT, statusLabel } from "@/lib/project-status";

// Token-gated client portal — must never be indexed. Each portal exposes a
// specific client's private project data behind an unguessable token.
export const metadata: Metadata = {
  title: "Client Portal · Sarion",
  robots: { index: false, follow: false },
};

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

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getPortalData(token);
  if (!data) notFound();

  // Record the visit (throttled to once per hour per client).
  await logPortalView(data.client.agencyId, data.client.id);

  return (
    <div className="min-h-screen bg-muted/30">
      <PortalAnalytics />
      {/* Branding header */}
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5">
          {data.agency.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.agency.logoUrl}
              alt={data.agency.name}
              className="h-9 w-auto rounded object-contain"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white">
              {data.agency.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="text-lg font-semibold">{data.agency.name}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {data.client.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your projects and share updates with the team.
          </p>
        </div>

        {data.projects.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-sm text-muted-foreground">
              No projects to show yet.
            </CardContent>
          </Card>
        ) : (
          data.projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle>{project.name}</CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant={PROJECT_STATUS_VARIANT[project.status]}>
                    {statusLabel(project.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Due {formatDate(project.dueDate)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Comments */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold">Discussion</p>
                  {project.comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No comments yet. Start the conversation below.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {project.comments.map((comment) => (
                        <li
                          key={comment.id}
                          className="rounded-lg border bg-background p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">
                              {comment.author}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                            {comment.message}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t pt-4">
                  <PortalCommentForm token={token} projectId={project.id} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>

      {data.showPoweredBy && (
        <footer className="border-t bg-card py-4 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <a
            href="https://trysarion.com"
            className="font-medium underline underline-offset-2"
          >
            Sarion
          </a>
        </footer>
      )}
    </div>
  );
}

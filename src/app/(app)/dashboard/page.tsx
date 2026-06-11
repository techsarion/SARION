import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  FolderKanban,
  DollarSign,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";

import { requireAgency } from "@/server/auth-context";
import { getDashboardData } from "@/server/data/dashboard";
import { ensureWorkspaceSeeded } from "@/server/services/seed-workspace";
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
import { OnboardingCard } from "@/components/dashboard/onboarding-card";
import { PROJECT_STATUS_VARIANT, statusLabel } from "@/lib/project-status";
import { ACTIVITY_VARIANT } from "@/lib/activity-style";

export const metadata: Metadata = { title: "Dashboard · Sarion" };

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
    maximumFractionDigits: 0,
  }).format(n);
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export default async function DashboardPage() {
  const { agencyId, name } = await requireAgency();

  // First visit on a fresh agency seeds a starter workspace (idempotent).
  await ensureWorkspaceSeeded(agencyId);

  const { metrics, recentProjects, recentActivity, onboarding } =
    await getDashboardData(agencyId);

  const firstName = name.split(" ")[0] ?? "there";

  const stats: { label: string; value: string; icon: LucideIcon }[] = [
    {
      label: "Total Clients",
      value: String(metrics.totalClients),
      icon: Users,
    },
    {
      label: "Active Projects",
      value: String(metrics.activeProjects),
      icon: FolderKanban,
    },
    {
      label: "Unpaid Total",
      value: formatMoney(metrics.unpaidTotal),
      icon: DollarSign,
    },
    {
      label: "Due This Week",
      value: String(metrics.dueThisWeek),
      icon: CalendarClock,
    },
  ];

  return (
    <PageWrapper
      title={`Welcome back, ${firstName} 👋`}
      description="Here's what's happening across your agency today."
      action={
        <Button asChild variant="brand">
          <Link href="/projects/new">+ New Project</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <OnboardingCard status={onboarding} />

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-bold tracking-tight tabular-nums">
                      {stat.value}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent projects + activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Recent Projects</CardTitle>
              <Button asChild variant="link" className="h-auto p-0 text-sm">
                <Link href="/projects">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentProjects.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No projects yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="pr-6 text-right">Due date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentProjects.map((project) => (
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
                        <TableCell className="pr-6 text-right text-muted-foreground">
                          {formatDate(project.dueDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  No activity yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {recentActivity.map((item) => (
                    <li key={item.id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={ACTIVITY_VARIANT[item.type] ?? "secondary"}>
                          {item.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

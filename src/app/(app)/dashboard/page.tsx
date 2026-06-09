import type { Metadata } from "next";
import {
  Users,
  FolderKanban,
  DollarSign,
  UsersRound,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from "lucide-react";

import { getSession } from "@/lib/session";
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
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard · Sarion",
};

interface Stat {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: LucideIcon;
}

const STATS: Stat[] = [
  {
    label: "Total Clients",
    value: "48",
    delta: "12.5%",
    trend: "up",
    icon: Users,
  },
  {
    label: "Active Projects",
    value: "23",
    delta: "8.2%",
    trend: "up",
    icon: FolderKanban,
  },
  {
    label: "Monthly Revenue",
    value: "$42,580",
    delta: "18.1%",
    trend: "up",
    icon: DollarSign,
  },
  {
    label: "Team Members",
    value: "9",
    delta: "2.3%",
    trend: "down",
    icon: UsersRound,
  },
];

type ProjectStatus = "In Progress" | "Review" | "Completed" | "Not Started";

const STATUS_VARIANT: Record<
  ProjectStatus,
  "info" | "warning" | "success" | "secondary"
> = {
  "In Progress": "info",
  Review: "warning",
  Completed: "success",
  "Not Started": "secondary",
};

const RECENT_PROJECTS: Array<{
  name: string;
  client: string;
  status: ProjectStatus;
  due: string;
}> = [
  {
    name: "Website Redesign",
    client: "Acme Corp",
    status: "In Progress",
    due: "May 24, 2026",
  },
  {
    name: "Mobile App Development",
    client: "TechFlow",
    status: "In Progress",
    due: "May 30, 2026",
  },
  {
    name: "Marketing Campaign",
    client: "BrightMind",
    status: "Review",
    due: "Jun 05, 2026",
  },
  {
    name: "Brand Identity Design",
    client: "Visionary",
    status: "Completed",
    due: "May 12, 2026",
  },
  {
    name: "SEO Audit",
    client: "Northwind",
    status: "Not Started",
    due: "Jun 18, 2026",
  },
];

const ACTIVITY: Array<{ who: string; action: string; when: string }> = [
  { who: "Sarah Johnson", action: "completed a task on Website Redesign", when: "2m ago" },
  { who: "Michael Brown", action: "updated the TechFlow project", when: "15m ago" },
  { who: "Emily Davis", action: "added a new client, BrightMind", when: "1h ago" },
  { who: "David Wilson", action: "sent invoice #1042 to Acme Corp", when: "2h ago" },
  { who: "Olivia Martin", action: "commented on Marketing Campaign", when: "4h ago" },
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function DashboardPage() {
  const session = await getSession();
  const firstName = session?.user.name.split(" ")[0] ?? "there";

  return (
    <PageWrapper
      title={`Good morning, ${firstName} 👋`}
      description="Here's what's happening across your agency today."
      action={<Button variant="brand">+ New Project</Button>}
    >
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon =
              stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
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
                  <div className="mt-4 flex items-end justify-between">
                    <span className="text-3xl font-bold tracking-tight">
                      {stat.value}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-sm font-medium",
                        stat.trend === "up"
                          ? "text-emerald-600"
                          : "text-destructive",
                      )}
                    >
                      <TrendIcon className="h-4 w-4" />
                      {stat.delta}
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
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Button variant="link" className="h-auto p-0 text-sm">
                View all
              </Button>
            </CardHeader>
            <CardContent className="p-0">
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
                  {RECENT_PROJECTS.map((project) => (
                    <TableRow key={project.name}>
                      <TableCell className="pl-6 font-medium">
                        {project.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {project.client}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[project.status]}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right text-muted-foreground">
                        {project.due}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {ACTIVITY.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                    {initialsOf(item.who)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-medium">{item.who}</span>{" "}
                      <span className="text-muted-foreground">
                        {item.action}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.when}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

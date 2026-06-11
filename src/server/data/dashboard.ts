import "server-only";

import { db } from "@/lib/db";

/**
 * All reads REQUIRE an agencyId and filter by it — tenant isolation at the data
 * layer. Dashboard metrics + feeds for F7.
 */

export interface DashboardMetrics {
  totalClients: number;
  activeProjects: number;
  unpaidTotal: number;
  dueThisWeek: number;
}

export interface RecentProject {
  id: string;
  name: string;
  status: string;
  dueDate: Date | null;
  clientName: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  createdAt: Date;
}

export interface OnboardingStatus {
  hasClient: boolean;
  hasProject: boolean;
  hasLogo: boolean;
  hasPortalView: boolean;
  hasInvoice: boolean;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recentProjects: RecentProject[];
  recentActivity: ActivityItem[];
  onboarding: OnboardingStatus;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(): Date {
  const d = startOfToday();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Load everything the dashboard needs in a single parallel batch — no N+1.
 * Counts use indexed aggregates; the unpaid total uses a SUM aggregate rather
 * than fetching rows.
 */
export async function getDashboardData(
  agencyId: string,
): Promise<DashboardData> {
  const weekEnd = endOfWeek();
  const todayStart = startOfToday();

  const [
    totalClients,
    activeProjects,
    unpaidAgg,
    dueThisWeek,
    recentProjectsRaw,
    recentActivity,
    agency,
    portalViewCount,
    invoiceCount,
  ] = await Promise.all([
    db.client.count({ where: { agencyId, deletedAt: null } }),
    db.project.count({ where: { agencyId, deletedAt: null, status: "ACTIVE" } }),
    db.invoice.aggregate({
      where: { agencyId, deletedAt: null, status: { not: "paid" } },
      _sum: { total: true },
    }),
    db.project.count({
      where: {
        agencyId,
        deletedAt: null,
        status: { not: "COMPLETED" },
        dueDate: { gte: todayStart, lte: weekEnd },
      },
    }),
    db.project.findMany({
      where: { agencyId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        dueDate: true,
        client: { select: { name: true } },
      },
    }),
    db.activity.findMany({
      where: { agencyId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, type: true, description: true, createdAt: true },
    }),
    db.agency.findUnique({
      where: { id: agencyId },
      select: { logoUrl: true },
    }),
    db.activity.count({ where: { agencyId, type: "Portal Viewed" } }),
    db.invoice.count({ where: { agencyId, deletedAt: null } }),
  ]);

  return {
    metrics: {
      totalClients,
      activeProjects,
      unpaidTotal: Number(unpaidAgg._sum.total ?? 0),
      dueThisWeek,
    },
    recentProjects: recentProjectsRaw.map(({ client, ...p }) => ({
      ...p,
      clientName: client.name,
    })),
    recentActivity,
    onboarding: {
      hasClient: totalClients > 0,
      hasProject: recentProjectsRaw.length > 0,
      hasLogo: Boolean(agency?.logoUrl),
      hasPortalView: portalViewCount > 0,
      hasInvoice: invoiceCount > 0,
    },
  };
}

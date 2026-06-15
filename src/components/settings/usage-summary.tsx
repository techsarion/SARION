import { getPlan } from "@/config/plans";
import type { PlanUsage } from "@/server/services/plan-limits";

/**
 * Read-only snapshot of how much of the current plan's quota the agency has
 * used. Renders one row per gated resource; unlimited quotas show "Unlimited".
 */
export function UsageSummary({ usage }: { usage: PlanUsage }) {
  const plan = getPlan(usage.tier);

  const rows = [
    { label: "Clients", used: usage.used.clients, limit: usage.limits.maxClients },
    { label: "Projects", used: usage.used.projects, limit: usage.limits.maxProjects },
    { label: "Invoices", used: usage.used.invoices, limit: usage.limits.maxInvoices },
    {
      label: "Team members",
      used: usage.used.teamMembers,
      limit: usage.limits.maxTeamMembers,
    },
  ];

  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-sm font-semibold">
        Plan usage{" "}
        <span className="font-normal text-muted-foreground">
          — {plan.name}
        </span>
      </p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((r) => {
          const unlimited = r.limit === null;
          const atLimit = !unlimited && r.used >= (r.limit as number);
          const pct = unlimited
            ? 0
            : Math.min(100, ((r.used / Math.max(1, r.limit as number)) * 100) | 0);
          return (
            <div key={r.label}>
              <dt className="text-xs text-muted-foreground">{r.label}</dt>
              <dd
                className={`text-sm font-semibold ${atLimit ? "text-amber-600" : ""}`}
              >
                {r.used}
                {unlimited ? (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · Unlimited
                  </span>
                ) : (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    / {r.limit}
                  </span>
                )}
              </dd>
              {!unlimited && (
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full ${atLimit ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

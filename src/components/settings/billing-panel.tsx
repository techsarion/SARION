"use client";

import { useState } from "react";
import { toast } from "sonner";

import { PLANS, type PlanKey } from "@/lib/stripe";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";

interface BillingInfo {
  plan: string;
  subscriptionStatus: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  trialing: "Free Trial",
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
};

const STATUS_CLASS: Record<string, string> = {
  trialing: "billing-status-trial",
  active: "billing-status-active",
  past_due: "billing-status-warning",
  canceled: "billing-status-canceled",
};

export function BillingPanel({
  billing,
  stripeConfigured,
}: {
  billing: BillingInfo;
  stripeConfigured: boolean;
}) {
  const [loading, setLoading] = useState<PlanKey | null>(null);

  async function handleUpgrade(plan: PlanKey) {
    setLoading(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Could not start checkout.");
        return;
      }
      trackEvent(AnalyticsEvent.BillingUpgrade, { plan });
      window.location.href = data.url;
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const currentPlan = billing.plan as PlanKey;
  const status = billing.subscriptionStatus;
  const statusLabel = STATUS_LABELS[status] ?? status;
  const statusClass = STATUS_CLASS[status] ?? "billing-status-default";
  const isActive = status === "active" || status === "trialing";

  return (
    <div className="space-y-6">
      {/* Stripe not configured — shown in dev / before production setup */}
      {!stripeConfigured && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
            Stripe is not configured
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
            Add{" "}
            <code className="rounded bg-amber-100 px-1 font-mono text-xs dark:bg-amber-900/50">
              STRIPE_SECRET_KEY
            </code>
            ,{" "}
            <code className="rounded bg-amber-100 px-1 font-mono text-xs dark:bg-amber-900/50">
              STRIPE_WEBHOOK_SECRET
            </code>
            , and the three price IDs to your environment to enable subscription
            billing. See{" "}
            <code className="rounded bg-amber-100 px-1 font-mono text-xs dark:bg-amber-900/50">
              docs/deployment.md
            </code>{" "}
            for setup instructions.
          </p>
        </div>
      )}

      {/* Current plan banner */}
      <div className="rounded-lg border bg-card p-5 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-xl font-semibold capitalize">
              {PLANS[currentPlan]?.name ?? currentPlan}
            </p>
          </div>
          <span className={`billing-status ${statusClass}`}>{statusLabel}</span>
        </div>
        {!isActive && (
          <p className="text-sm text-destructive">
            Your subscription is not active. Choose a plan below to continue
            using Sarion after your trial ends.
          </p>
        )}
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.entries(PLANS) as [PlanKey, (typeof PLANS)[PlanKey]][]).map(
          ([key, plan]) => {
            const isCurrent = key === currentPlan && isActive;
            return (
              <div
                key={key}
                className={`rounded-lg border p-5 space-y-3 ${
                  key === "growth"
                    ? "border-primary shadow-sm"
                    : "border-border"
                }`}
              >
                {key === "growth" && (
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    Most Popular
                  </span>
                )}
                <div>
                  <p className="font-semibold text-lg">{plan.name}</p>
                  <p className="text-2xl font-bold">
                    ${plan.amount / 100}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={!stripeConfigured || isCurrent || loading !== null}
                  className="w-full rounded-md border border-input bg-background hover:bg-accent text-sm font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === key
                    ? "Redirecting…"
                    : isCurrent
                      ? "Current Plan"
                      : "Upgrade"}
                </button>
              </div>
            );
          },
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Subscriptions are billed monthly. Cancel anytime from your settings.
        Payments are processed securely by Stripe.
      </p>
    </div>
  );
}

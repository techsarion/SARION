"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  PAID_PLAN_LIST,
  yearlySavingMonths,
  type BillingInterval,
  type PaidPlanTier,
  type PlanTier,
} from "@/config/plans";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";

export interface BillingInfo {
  planTier: PlanTier;
  billingInterval: BillingInterval;
  foundingMember: boolean;
  subscriptionStatus: string;
  lemonCustomerId: string | null;
  lemonSubscriptionId: string | null;
  trialDaysLeft: number | null;
}

const STATUS_LABELS: Record<string, string> = {
  trialing: "Free Trial",
  active: "Active",
  past_due: "Past Due",
  canceled: "Canceled",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
};

export function BillingPanel({
  billing,
  billingConfigured,
}: {
  billing: BillingInfo;
  billingConfigured: boolean;
}) {
  const [interval, setInterval] = useState<BillingInterval>(
    billing.billingInterval,
  );
  const [loading, setLoading] = useState<PaidPlanTier | "portal" | null>(null);

  async function handleUpgrade(tier: PaidPlanTier) {
    setLoading(tier);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, interval }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Could not start checkout.");
        return;
      }
      trackEvent(AnalyticsEvent.BillingUpgrade, { tier, interval });
      window.location.href = data.url;
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Could not open billing portal.");
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const status = billing.subscriptionStatus;
  const isActive = status === "active";
  const currentTier = billing.planTier;

  return (
    <div className="space-y-6">
      {!billingConfigured && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
            Lemon Squeezy is not configured
          </p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
            Add your Lemon Squeezy API key, store ID, webhook secret, and the
            monthly/yearly variant IDs to enable subscription billing. See{" "}
            <code className="rounded bg-amber-100 px-1 font-mono text-xs dark:bg-amber-900/50">
              docs/deployment.md
            </code>
            .
          </p>
        </div>
      )}

      {/* Current status */}
      <div className="rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="flex items-center gap-2 text-xl font-semibold capitalize">
              {currentTier}
              {billing.foundingMember && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Founding member
                </span>
              )}
            </p>
            {status === "trialing" && billing.trialDaysLeft !== null && (
              <p className="mt-1 text-sm text-muted-foreground">
                {billing.trialDaysLeft} day
                {billing.trialDaysLeft === 1 ? "" : "s"} left in your free trial
                — no card required.
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border px-3 py-1 text-xs font-medium">
              {STATUS_LABELS[status] ?? status}
            </span>
            {billing.lemonSubscriptionId && (
              <button
                onClick={handlePortal}
                disabled={loading !== null}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
              >
                {loading === "portal" ? "Opening…" : "Manage billing"}
              </button>
            )}
          </div>
        </div>
        {billing.foundingMember && (
          <p className="mt-3 text-xs text-muted-foreground">
            Your founding price is locked in for life — it carries across plan
            changes and never increases.
          </p>
        )}
      </div>

      {/* Interval toggle */}
      <div className="flex items-center justify-center gap-3">
        <IntervalToggle value={interval} onChange={setInterval} />
      </div>

      {/* Plan cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {PAID_PLAN_LIST.map((plan) => {
          const tier = plan.tier as PaidPlanTier;
          const isCurrent = tier === currentTier && isActive;
          const price =
            interval === "yearly" ? plan.pricing.yearly : plan.pricing.monthly;
          const saving = yearlySavingMonths(tier);
          return (
            <div
              key={tier}
              className={`flex flex-col rounded-lg border p-5 ${
                plan.featured ? "border-primary shadow-sm" : "border-border"
              }`}
            >
              {plan.featured && (
                <span className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  Most popular
                </span>
              )}
              <p className="text-lg font-semibold">{plan.name}</p>
              <p className="mb-1 text-sm text-muted-foreground">
                {plan.tagline}
              </p>
              <p className="text-2xl font-bold">
                ${price}
                <span className="text-sm font-normal text-muted-foreground">
                  /{interval === "yearly" ? "yr" : "mo"}
                </span>
              </p>
              {interval === "yearly" && saving > 0 && (
                <p className="text-xs font-medium text-emerald-600">
                  {saving} months free
                </p>
              )}
              <ul className="my-4 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(tier)}
                disabled={!billingConfigured || isCurrent || loading !== null}
                className={`mt-auto w-full rounded-md py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  plan.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background hover:bg-accent"
                }`}
              >
                {loading === tier
                  ? "Redirecting…"
                  : isCurrent
                    ? "Current plan"
                    : "Choose " + plan.name}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Cancel anytime. Plans are billed per agency through Lemon Squeezy.
        Switching plans is prorated automatically.
      </p>
    </div>
  );
}

function IntervalToggle({
  value,
  onChange,
}: {
  value: BillingInterval;
  onChange: (v: BillingInterval) => void;
}) {
  return (
    <div className="inline-flex rounded-full border bg-card p-1 text-sm">
      {(["monthly", "yearly"] as const).map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
            value === opt
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt === "monthly" ? "Monthly" : "Yearly"}
          {opt === "yearly" && (
            <span className="ml-1 text-xs opacity-80">· 2 months free</span>
          )}
        </button>
      ))}
    </div>
  );
}

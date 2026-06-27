import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

import { requireOwner } from "@/server/auth-context";
import { getAgencyBilling } from "@/server/data/agency";
import { getPlan } from "@/config/plans";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PortalButton } from "@/components/checkout/portal-button";

export const metadata: Metadata = {
  title: "Subscription active · Sarion",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage() {
  const ctx = await requireOwner();
  const billing = await getAgencyBilling(ctx.agencyId);

  const plan = getPlan(billing?.planTier ?? "free");
  const isActive = billing?.subscriptionStatus === "active";
  const hasSubscription = Boolean(billing?.lemonSubscriptionId);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <Card className="w-full max-w-md p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />
        </div>

        <h1 className="mt-6 text-center font-heading text-2xl font-bold tracking-tight">
          {isActive ? "Subscription active" : "Payment received"}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {isActive
            ? "You're all set — welcome aboard."
            : "We're finalizing your subscription. This usually takes a few seconds; refresh if your plan isn't updated yet."}
        </p>

        <dl className="mt-6 space-y-3 rounded-md border bg-muted/40 p-4 text-sm">
          <Row label="Name" value={ctx.name} />
          <Row label="Email" value={ctx.email} />
          <Row label="Plan" value={plan.name} />
        </dl>

        <div className="mt-6 space-y-3">
          <Button asChild variant="brand" size="lg" className="w-full">
            <Link href="/dashboard">
              Go to dashboard <ArrowRight aria-hidden />
            </Link>
          </Button>

          {hasSubscription && (
            <PortalButton className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-8 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Manage subscription &amp; invoices
            </PortalButton>
          )}
        </div>
      </Card>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}

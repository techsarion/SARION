import Link from "next/link";
import { Check, Circle } from "lucide-react";

import type { OnboardingStatus } from "@/server/data/dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Step {
  key: keyof OnboardingStatus;
  label: string;
  href: string;
}

const STEPS: Step[] = [
  { key: "hasClient", label: "Create First Client", href: "/clients/new" },
  { key: "hasProject", label: "Create First Project", href: "/projects/new" },
  { key: "hasLogo", label: "Upload Agency Logo", href: "/settings" },
  { key: "hasPortalView", label: "Open Client Portal", href: "/clients" },
  { key: "hasInvoice", label: "Create First Invoice", href: "/invoices/new" },
];

/**
 * Onboarding checklist (F8). Progress is computed dynamically from real data —
 * no extra table. Hides itself entirely once all five steps are complete.
 */
export function OnboardingCard({ status }: { status: OnboardingStatus }) {
  const completed = STEPS.filter((s) => status[s.key]).length;
  if (completed === STEPS.length) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Get your workspace ready</CardTitle>
        <span className="text-sm font-medium text-muted-foreground">
          {completed} / {STEPS.length} Completed
        </span>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => {
            const done = status[step.key];
            return (
              <li key={step.key}>
                <Link
                  href={step.href}
                  className="flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-accent"
                >
                  {done ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />
                  )}
                  <span
                    className={
                      done ? "text-muted-foreground line-through" : "font-medium"
                    }
                  >
                    {step.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

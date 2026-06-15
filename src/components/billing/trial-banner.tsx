import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";

/**
 * Slim, dismissible-feeling status strip shown under the header for agencies
 * that are still on a trial or whose trial/subscription has lapsed. Purely a
 * gentle upgrade nudge — access itself is governed server-side by plan limits.
 */
export function TrialBanner({
  state,
}: {
  state:
    | { kind: "trialing"; daysLeft: number; founding: boolean }
    | { kind: "expired" }
    | { kind: "none" };
}) {
  if (state.kind === "none") return null;

  if (state.kind === "expired") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
        <span className="font-medium">Your free trial has ended.</span>
        <span className="text-amber-700 dark:text-amber-400">
          You&apos;re on the Free plan — your data is safe. Upgrade to unlock
          everything again.
        </span>
        <Link
          href="/settings/billing"
          className="font-semibold underline underline-offset-2"
        >
          Choose a plan
        </Link>
      </div>
    );
  }

  const { daysLeft, founding } = state;
  const urgent = daysLeft <= 3;

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b px-4 py-2 text-sm ${
        urgent
          ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
          : "border-border bg-secondary/40 text-foreground"
      }`}
    >
      <Clock className="h-4 w-4 shrink-0" aria-hidden />
      <span className="font-medium">
        {daysLeft === 0
          ? "Last day of your free trial"
          : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in your free trial`}
      </span>
      {founding && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3 w-3" aria-hidden />
          Founding price locked
        </span>
      )}
      <Link
        href="/settings/billing"
        className="font-semibold underline underline-offset-2"
      >
        Upgrade now
      </Link>
    </div>
  );
}

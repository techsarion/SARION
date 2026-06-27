"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { RefreshCw, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Error boundary for the authenticated workspace. Protects navigation so a
 * failing page (e.g. a data query) doesn't white-screen the whole app. No stack
 * trace is shown; the error is reported to Sentry (no-op outside production).
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We hit an unexpected error loading this page. Your data is safe — please
        try again.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} variant="brand">
          <RefreshCw aria-hidden /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <LayoutDashboard aria-hidden /> Back to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { RefreshCw, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Segment-level error boundary for the public/marketing tree. Renders inside the
 * root layout, so it uses the app's theme tokens (dark-mode aware). No stack
 * trace is shown; the error is reported to Sentry (no-op outside production).
 */
export default function Error({
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
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        Sarion
      </p>
      <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred. Our team has been notified. You can try
        again or head back home.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} variant="brand">
          <RefreshCw aria-hidden /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home aria-hidden /> Go home
          </Link>
        </Button>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";

import { requireOwner } from "@/server/auth-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Checkout cancelled · Sarion",
  robots: { index: false, follow: false },
};

export default async function CheckoutCancelPage() {
  // Owner-only, consistent with the rest of the billing surface.
  await requireOwner();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <XCircle className="h-8 w-8 text-muted-foreground" aria-hidden />
        </div>

        <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight">
          Payment cancelled
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No charge was made. You can pick up where you left off whenever
          you&apos;re ready.
        </p>

        <div className="mt-6 space-y-3">
          <Button asChild variant="brand" size="lg" className="w-full">
            <Link href="/settings/billing">Resume checkout</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/dashboard">
              <ArrowLeft aria-hidden /> Return home
            </Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}

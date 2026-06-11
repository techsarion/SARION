import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "Set new password · Sarion",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  // Better Auth redirects here with ?error=INVALID_TOKEN when the link is bad.
  if (!token || error) {
    return (
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Link expired or invalid
          </h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is no longer valid. Request a new one to
            continue.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex font-medium text-primary hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your Sarion account.
        </p>
      </div>

      <ResetPasswordForm token={token} />

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}

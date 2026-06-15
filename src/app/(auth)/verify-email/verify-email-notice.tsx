"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

/**
 * Post-signup "check your inbox" notice. Email verification is sent on signup
 * (Better Auth `sendOnSignUp`); this screen tells the user to confirm it and
 * lets them resend. Verification is non-blocking, so a "Continue" link to the
 * dashboard is offered too.
 */
export function VerifyEmailNotice({ email }: { email?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function handleResend() {
    if (!email) return;
    setStatus("sending");
    setMessage(null);
    const { error } = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/dashboard",
    });
    if (error) {
      setStatus("error");
      setMessage("Couldn't resend right now. Please try again in a moment.");
      return;
    }
    setStatus("sent");
    setMessage("Verification email sent. Check your inbox.");
  }

  return (
    <div className="space-y-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <MailCheck className="h-6 w-6" aria-hidden />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a verification link to{" "}
          {email ? (
            <span className="font-medium text-foreground">{email}</span>
          ) : (
            "your inbox"
          )}
          . Click the link in that email to confirm your account.
        </p>
      </div>

      <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        Didn&apos;t get it? Check your spam folder, or resend below. The link
        expires after 24 hours.
      </div>

      {message && (
        <p
          role="status"
          className={`text-sm ${status === "error" ? "text-destructive" : "text-green-600 dark:text-green-400"}`}
        >
          {message}
        </p>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleResend}
          variant="outline"
          className="w-full"
          disabled={!email || status === "sending" || status === "sent"}
        >
          {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "sent"
            ? "Email sent"
            : status === "sending"
              ? "Sending…"
              : "Resend verification email"}
        </Button>

        <Button asChild variant="brand" className="w-full">
          <Link href="/dashboard">Continue to dashboard</Link>
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Wrong address?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Start over
        </Link>
      </p>
    </div>
  );
}

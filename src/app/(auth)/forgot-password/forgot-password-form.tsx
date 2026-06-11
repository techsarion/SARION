"use client";

import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const value = email.trim();
    if (!value) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    // Always surface the same success state regardless of whether the email
    // exists — avoids account enumeration. The reset link is dispatched by the
    // server's sendResetPassword handler (see src/lib/auth.ts).
    await authClient.requestPasswordReset({
      email: value,
      redirectTo: "/reset-password",
    });
    setIsLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-muted/40 py-8 px-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck size={24} />
        </span>
        <div className="space-y-1">
          <p className="font-semibold">Check your inbox</p>
          <p className="text-sm text-muted-foreground">
            If <strong>{email}</strong> is registered, you&apos;ll receive a
            password reset link within a few minutes.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@agency.com"
          required
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            aria-hidden
          >
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 10.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm.75-3.25a.75.75 0 0 1-1.5 0V5.25a.75.75 0 0 1 1.5 0v3z" />
          </svg>
          {error}
        </div>
      )}

      <Button type="submit" variant="brand" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {isLoading ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { trackEvent, AnalyticsEvent } from "@/lib/analytics";
import type { PublicInvite } from "@/server/data/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignupFormProps {
  inviteToken?: string;
  invite?: PublicInvite | null;
}

const INVITE_ERROR: Record<string, string> = {
  invalid: "This invite link is invalid.",
  expired: "This invite link has expired. Ask the agency owner to resend it.",
  accepted: "This invite has already been used.",
};

// Pragmatic email shape check — mirrors the server's validation so users get a
// friendly inline message instead of the raw "[body.email] Invalid input" 400.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type StrengthLevel = 0 | 1 | 2 | 3;

function getPasswordStrength(pw: string): { level: StrengthLevel; label: string } {
  if (!pw) return { level: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Weak" };
  if (score === 2) return { level: 2, label: "Fair" };
  return { level: 3, label: "Strong" };
}

/**
 * Map Better Auth / server validation errors to clean, user-facing copy so a
 * raw string like "[body.email] Invalid input" never reaches the UI.
 */
function friendlyAuthError(err: { message?: string; code?: string }): string {
  const raw = (err.message ?? "").toLowerCase();
  if (raw.includes("email") && (raw.includes("invalid") || raw.includes("valid"))) {
    return "Please enter a valid email address (e.g. you@agency.com).";
  }
  if (raw.includes("already") || err.code === "USER_ALREADY_EXISTS") {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (raw.includes("password")) {
    return "Password must be at least 8 characters.";
  }
  // Never surface internal field-path noise (e.g. "[body.x] ...").
  if (!err.message || err.message.startsWith("[")) {
    return "Could not create your account. Please check your details and try again.";
  }
  return err.message;
}

const STRENGTH_COLOR: Record<StrengthLevel, string> = {
  0: "",
  1: "bg-destructive",
  2: "bg-yellow-500",
  3: "bg-green-500",
};

export function SignupForm({ inviteToken, invite }: SignupFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const strength = getPasswordStrength(password);

  const inviteBlocked = Boolean(inviteToken) && invite?.status !== "valid";
  const invitedEmail = invite?.status === "valid" ? invite.email : undefined;
  const agencyName = invite?.status === "valid" ? invite.agencyName : undefined;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = (invitedEmail ?? String(formData.get("email") ?? ""))
      .trim()
      .toLowerCase();
    const pw = String(formData.get("password") ?? "");

    if (!name || !email || !pw) {
      setError("Please fill in all fields.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address (e.g. you@agency.com).");
      return;
    }
    if (pw.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    const { error: signUpError } = await authClient.signUp.email({
      name,
      email,
      password: pw,
      callbackURL: "/dashboard",
      ...(inviteToken ? { inviteToken } : {}),
    } as Parameters<typeof authClient.signUp.email>[0]);

    if (signUpError) {
      setError(friendlyAuthError(signUpError));
      setIsLoading(false);
      return;
    }

    trackEvent(AnalyticsEvent.Signup);
    // Invited members join an existing, already-trusted workspace → straight in.
    // Brand-new signups land on the "verify your email" notice first.
    if (inviteToken) {
      router.push("/dashboard");
    } else {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">
          {agencyName ? `Join ${agencyName}` : "Create your agency"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {agencyName
            ? "Set up your account to join the team."
            : "Start managing clients and projects in minutes."}
        </p>
      </div>

      {inviteBlocked ? (
        <div className="space-y-4">
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
            {INVITE_ERROR[invite?.status ?? "invalid"] ?? INVITE_ERROR.invalid}
          </div>
          <Button asChild variant="brand" className="w-full">
            <Link href="/signup">Create a new agency instead</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="John Smith"
              required
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@agency.com"
              required
              disabled={isLoading || Boolean(invitedEmail)}
              defaultValue={invitedEmail}
              readOnly={Boolean(invitedEmail)}
            />
            {invitedEmail && (
              <p className="text-xs text-muted-foreground">
                This invite is tied to {invitedEmail}.
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                required
                disabled={isLoading}
                className="pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength meter */}
            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {([1, 2, 3] as StrengthLevel[]).map((n) => (
                    <div
                      key={n}
                      className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                        strength.level >= n
                          ? STRENGTH_COLOR[strength.level]
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${
                  strength.level === 1
                    ? "text-destructive"
                    : strength.level === 2
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-green-600 dark:text-green-400"
                }`}>
                  {strength.label} password
                  {strength.level === 1 && " — add numbers or symbols to improve it"}
                  {strength.level === 2 && " — add uppercase letters or symbols"}
                </p>
              </div>
            )}
          </div>

          {/* Error */}
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

          <Button
            type="submit"
            variant="brand"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Creating account…" : "Create account"}
          </Button>

          {/* Terms consent */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
        </div>
      </div>

      <Button asChild variant="outline" className="w-full">
        <Link href="/login">Log in instead</Link>
      </Button>
    </div>
  );
}

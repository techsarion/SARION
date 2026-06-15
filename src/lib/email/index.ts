/**
 * Email dispatch hub — production-hardened.
 *
 * Public surface:
 *   • sendEmail(kind, to, data, opts?)      — type-safe send; THROWS on failure
 *     after retries. Use for CRITICAL paths where the caller must know it failed
 *     (e.g. contact-form internal notification).
 *   • sendEmailSafe(kind, to, data, opts?)  — never throws; logs + returns a
 *     result. Use for BEST-EFFORT paths that must not break the user action
 *     (welcome, billing notices, acknowledgements). Returns { ok }.
 *   • sendPasswordResetEmail / sendInviteEmail / sendContactEmail — back-compat.
 *
 * Hardening:
 *   • Transient failures (network / 429 / 5xx) are retried with exponential
 *     backoff before giving up.
 *   • Every attempt emits a structured JSON log line ([email] events) suitable
 *     for log-based alerting; a monitoring hook captures hard failures.
 *   • Sender selection is automatic via the ownership matrix (senders.ts).
 */
import type { EmailProvider } from "./types";
import { ConsoleProvider } from "./providers/console";
import { fromFor, type EmailKind } from "./senders";
import { TEMPLATES, type EmailPayloads } from "./templates";

export type { EmailKind } from "./senders";
export type { EmailPayloads } from "./templates";

/** Render a template to {subject, html, text} without sending — for previews/tests. */
export function renderEmail<K extends EmailKind>(kind: K, data: EmailPayloads[K]) {
  return TEMPLATES[kind](data);
}

// ── Structured logging + monitoring hook ────────────────────────────────────

type LogLevel = "info" | "warn" | "error";

function logEmail(level: LogLevel, event: string, fields: Record<string, unknown> = {}) {
  const line = JSON.stringify({ scope: "email", event, ...fields });
  if (level === "error") console.error(`[email] ${line}`);
  else if (level === "warn") console.warn(`[email] ${line}`);
  else console.info(`[email] ${line}`);
}

/**
 * Monitoring hook for hard failures. Wire this to Sentry/Datadog at app startup:
 *   import { onEmailFailure } from "@/lib/email";
 *   onEmailFailure((info) => Sentry.captureException(info.error, { extra: info }));
 */
export interface EmailFailureInfo {
  kind: EmailKind;
  to: string | string[];
  attempts: number;
  error: unknown;
}
let failureHook: ((info: EmailFailureInfo) => void) | null = null;
export function onEmailFailure(hook: (info: EmailFailureInfo) => void) {
  failureHook = hook;
}

// ── Provider singleton ──────────────────────────────────────────────────────
let _provider: EmailProvider | null = null;

async function getProvider(): Promise<EmailProvider> {
  if (_provider) return _provider;

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const { ResendProvider } = await import("./providers/resend");
    _provider = new ResendProvider(apiKey);
    logEmail("info", "provider.init", { provider: "resend" });
  } else {
    _provider = new ConsoleProvider();
    logEmail(
      process.env.NODE_ENV === "production" ? "warn" : "info",
      "provider.init",
      {
        provider: "console",
        note:
          process.env.NODE_ENV === "production"
            ? "RESEND_API_KEY missing — emails will NOT be delivered"
            : "dev fallback",
      },
    );
  }
  return _provider;
}

/** Test seam: reset the memoized provider (used by the email test route). */
export function _resetProvider() {
  _provider = null;
}

export interface SendOptions {
  /** Override the reply-to (e.g. route contact replies to the visitor). */
  replyTo?: string;
  /** Max delivery attempts (default 3). */
  maxAttempts?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Core send (with retry) ──────────────────────────────────────────────────

async function dispatch<K extends EmailKind>(
  kind: K,
  to: string | string[],
  data: EmailPayloads[K],
  opts: SendOptions,
): Promise<void> {
  const content = TEMPLATES[kind](data);
  const provider = await getProvider();
  const from = fromFor(kind);
  const maxAttempts = Math.max(1, opts.maxAttempts ?? 3);

  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await provider.send({
        from,
        to,
        subject: content.subject,
        html: content.html,
        text: content.text,
        replyTo: opts.replyTo,
      });
      logEmail("info", "send.ok", { kind, to, from, attempt });
      return;
    } catch (err) {
      lastErr = err;
      logEmail("warn", "send.retry", {
        kind,
        to,
        attempt,
        maxAttempts,
        error: err instanceof Error ? err.message : String(err),
      });
      if (attempt < maxAttempts) {
        // Exponential backoff: 300ms, 900ms, …
        await sleep(300 * 3 ** (attempt - 1));
      }
    }
  }

  logEmail("error", "send.failed", {
    kind,
    to,
    attempts: maxAttempts,
    error: lastErr instanceof Error ? lastErr.message : String(lastErr),
  });
  try {
    failureHook?.({ kind, to, attempts: maxAttempts, error: lastErr });
  } catch {
    /* hook must never break sending */
  }
  throw lastErr instanceof Error ? lastErr : new Error("Email send failed");
}

/**
 * Type-safe send that THROWS on ultimate failure (after retries). Use on paths
 * where the caller needs to react to a failure.
 */
export async function sendEmail<K extends EmailKind>(
  kind: K,
  to: string | string[],
  data: EmailPayloads[K],
  opts: SendOptions = {},
): Promise<void> {
  await dispatch(kind, to, data, opts);
}

export interface SafeSendResult {
  ok: boolean;
  error?: string;
}

/**
 * Best-effort send that NEVER throws — failures are logged + reported to the
 * monitoring hook and surfaced as `{ ok: false }`. Use wherever an email must
 * not be able to break the user-facing action (signup, billing, etc.).
 */
export async function sendEmailSafe<K extends EmailKind>(
  kind: K,
  to: string | string[],
  data: EmailPayloads[K],
  opts: SendOptions = {},
): Promise<SafeSendResult> {
  try {
    await dispatch(kind, to, data, opts);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ── Back-compat helpers (existing callers) ──────────────────────────────────

/** Password reset — wired into Better Auth (src/lib/auth.ts). Critical: throws. */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  await sendEmail("passwordReset", to, { resetUrl });
}

/** Team invite — used by src/server/actions/team.ts. Best-effort there. */
export async function sendInviteEmail(opts: {
  to: string;
  toName: string;
  agencyName: string;
  inviteUrl: string;
  expiryDays: number;
}): Promise<void> {
  await sendEmail("teamInvite", opts.to, {
    toName: opts.toName,
    agencyName: opts.agencyName,
    inviteUrl: opts.inviteUrl,
    expiryDays: opts.expiryDays,
  });
}

/**
 * Contact form — notifies the Sarion inbox (critical, throws) and sends the
 * visitor a branded acknowledgement (best-effort, never throws).
 */
export async function sendContactEmail(opts: {
  name: string;
  email: string;
  agency?: string;
  message: string;
}): Promise<void> {
  const to =
    process.env.CONTACT_EMAIL ??
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
    "contact@trysarion.com";

  // 1. Internal notification — must succeed.
  await sendEmail(
    "contactInternal",
    to,
    { name: opts.name, email: opts.email, agency: opts.agency, message: opts.message },
    { replyTo: opts.email },
  );

  // 2. Visitor acknowledgement — best-effort.
  await sendEmailSafe(
    "contactConfirmation",
    opts.email,
    { name: opts.name, message: opts.message, contactEmail: to },
    { replyTo: to },
  );
}

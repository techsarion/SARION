/**
 * Email dispatch hub.
 *
 * Public surface:
 *   • sendEmail(kind, to, data, opts?)  — type-safe, sender-aware send for any
 *     of the registered templates. THIS is what new code should use.
 *   • sendPasswordResetEmail / sendInviteEmail / sendContactEmail — thin
 *     back-compat wrappers kept for existing callers (auth, team, contact form).
 *
 * Sender selection is automatic via the ownership matrix (senders.ts), so the
 * correct from-address (support@ / sales@ / hello@) is always used.
 */
import type { EmailProvider } from "./types";
import { ConsoleProvider } from "./providers/console";
import { fromFor, type EmailKind } from "./senders";
import { TEMPLATES, type EmailPayloads } from "./templates";

export type { EmailKind } from "./senders";
export type { EmailPayloads } from "./templates";

// ── Provider singleton ──────────────────────────────────────────────────────
let _provider: EmailProvider | null = null;

async function getProvider(): Promise<EmailProvider> {
  if (_provider) return _provider;

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const { ResendProvider } = await import("./providers/resend");
    _provider = new ResendProvider(apiKey);
  } else {
    _provider = new ConsoleProvider();
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[email] RESEND_API_KEY is not set — falling back to console logger. " +
          "Emails will NOT be delivered in production.",
      );
    }
  }
  return _provider;
}

export interface SendOptions {
  /** Override the reply-to (e.g. route contact replies to the visitor). */
  replyTo?: string;
}

/**
 * Render `kind` with `data`, resolve its owning sender, and dispatch to `to`.
 * Type-safe: `data` must match the template's payload.
 */
export async function sendEmail<K extends EmailKind>(
  kind: K,
  to: string | string[],
  data: EmailPayloads[K],
  opts: SendOptions = {},
): Promise<void> {
  const content = TEMPLATES[kind](data);
  const provider = await getProvider();
  await provider.send({
    from: fromFor(kind),
    to,
    subject: content.subject,
    html: content.html,
    text: content.text,
    replyTo: opts.replyTo,
  });
}

// ── Back-compat helpers (existing callers) ──────────────────────────────────

/** Password reset — wired into Better Auth (src/lib/auth.ts). */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  await sendEmail("passwordReset", to, { resetUrl });
}

/** Team invite — used by src/server/actions/team.ts. */
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
 * Contact form — notifies the Sarion inbox (critical) and sends the visitor a
 * branded acknowledgement (best-effort). Notification comes from support@ with
 * replyTo set to the visitor; the acknowledgement comes from hello@.
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

  // 1. Internal notification — must succeed (throws on failure).
  await sendEmail(
    "contactInternal",
    to,
    { name: opts.name, email: opts.email, agency: opts.agency, message: opts.message },
    { replyTo: opts.email },
  );

  // 2. Visitor acknowledgement — best-effort, never fails the request.
  try {
    await sendEmail(
      "contactConfirmation",
      opts.email,
      { name: opts.name, message: opts.message, contactEmail: to },
      { replyTo: to },
    );
  } catch (err) {
    console.error("[email] contact acknowledgement failed:", err);
  }
}

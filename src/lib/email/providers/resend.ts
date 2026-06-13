import { Resend } from "resend";

import type {
  EmailProvider,
  SendContactOptions,
  SendInviteOptions,
  SendPasswordResetOptions,
} from "../types";
import {
  passwordResetHtml,
  passwordResetText,
  inviteHtml,
  inviteText,
  contactHtml,
  contactText,
  contactAckHtml,
  contactAckText,
} from "../templates";

/**
 * Production email provider — Resend.
 * Requires RESEND_API_KEY and EMAIL_FROM env vars.
 * This module is only imported when RESEND_API_KEY is present (see email/index.ts).
 */
export class ResendProvider implements EmailProvider {
  private readonly resend: Resend;
  private readonly from: string;

  constructor(apiKey: string, from: string) {
    this.resend = new Resend(apiKey);
    this.from = from;
  }

  async sendPasswordReset({ to, resetUrl }: SendPasswordResetOptions) {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: "Reset your Sarion password",
      html: passwordResetHtml(resetUrl),
      text: passwordResetText(resetUrl),
    });
    if (error) throw new Error(`Resend error: ${error.message}`);
  }

  async sendInvite(opts: SendInviteOptions) {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: opts.to,
      subject: `You've been invited to join ${opts.agencyName} on Sarion`,
      html: inviteHtml(opts),
      text: inviteText(opts),
    });
    if (error) throw new Error(`Resend error: ${error.message}`);
  }

  async sendContact({ to, name, email, agency, message }: SendContactOptions) {
    // 1. Notify the Sarion inbox. This is the critical send — if it fails we
    //    throw so the visitor is told their message wasn't delivered.
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      // Replies go straight to the visitor instead of the verified sender domain.
      replyTo: email,
      subject: `New enquiry from ${name}${agency ? ` (${agency})` : ""}`,
      html: contactHtml({ name, email, agency, message }),
      text: contactText({ name, email, agency, message }),
    });
    if (error) throw new Error(`Resend error: ${error.message}`);

    // 2. Send a branded acknowledgement to the visitor. Best-effort — a failure
    //    here must not fail the request, since the enquiry was already received.
    try {
      const { error: ackError } = await this.resend.emails.send({
        from: this.from,
        to: email,
        replyTo: to,
        subject: "We've received your message — Sarion",
        html: contactAckHtml({ name, message, contactEmail: to }),
        text: contactAckText({ name, message, contactEmail: to }),
      });
      if (ackError) {
        console.error("[email] contact acknowledgement failed:", ackError.message);
      }
    } catch (err) {
      console.error("[email] contact acknowledgement threw:", err);
    }
  }
}

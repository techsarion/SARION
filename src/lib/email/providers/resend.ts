import { Resend } from "resend";

import type {
  EmailProvider,
  SendInviteOptions,
  SendPasswordResetOptions,
} from "../types";
import {
  passwordResetHtml,
  passwordResetText,
  inviteHtml,
  inviteText,
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
}

import type {
  EmailProvider,
  SendContactOptions,
  SendInviteOptions,
  SendPasswordResetOptions,
} from "../types";

/**
 * Development fallback — logs email content to the console instead of sending.
 * Automatically used when RESEND_API_KEY is absent. Never use in production.
 */
export class ConsoleProvider implements EmailProvider {
  async sendPasswordReset({ to, resetUrl }: SendPasswordResetOptions) {
    console.info(
      `\n[email:dev] PASSWORD RESET\n  To:  ${to}\n  URL: ${resetUrl}\n`,
    );
  }

  async sendInvite({ to, toName, agencyName, inviteUrl }: SendInviteOptions) {
    console.info(
      `\n[email:dev] TEAM INVITE\n  To:      ${toName} <${to}>\n  Agency:  ${agencyName}\n  URL:     ${inviteUrl}\n`,
    );
  }

  async sendContact({ to, name, email, agency, message }: SendContactOptions) {
    console.info(
      `\n[email:dev] CONTACT ENQUIRY\n` +
        `  Notification → ${to}\n` +
        `  Auto-reply   → ${name} <${email}>\n` +
        `  Agency:  ${agency ?? "—"}\n` +
        `  Message: ${message}\n`,
    );
  }
}

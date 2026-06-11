import type { EmailProvider } from "./types";
import { ConsoleProvider } from "./providers/console";

export type { SendPasswordResetOptions, SendInviteOptions } from "./types";

// Provider singleton — resolved once at first use.
let _provider: EmailProvider | null = null;

async function getProvider(): Promise<EmailProvider> {
  if (_provider) return _provider;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "hello@trysarion.com";

  if (apiKey) {
    const { ResendProvider } = await import("./providers/resend");
    _provider = new ResendProvider(apiKey, from);
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

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<void> {
  const provider = await getProvider();
  await provider.sendPasswordReset({ to, resetUrl });
}

export async function sendInviteEmail(opts: {
  to: string;
  toName: string;
  agencyName: string;
  inviteUrl: string;
  expiryDays: number;
}): Promise<void> {
  const provider = await getProvider();
  await provider.sendInvite(opts);
}

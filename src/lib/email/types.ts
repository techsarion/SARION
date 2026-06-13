export interface SendPasswordResetOptions {
  to: string;
  resetUrl: string;
}

export interface SendInviteOptions {
  to: string;
  toName: string;
  agencyName: string;
  inviteUrl: string;
  expiryDays: number;
}

export interface SendContactOptions {
  /** The monitored Sarion inbox the enquiry is delivered to. */
  to: string;
  name: string;
  email: string;
  agency?: string;
  message: string;
}

export interface EmailProvider {
  sendPasswordReset(opts: SendPasswordResetOptions): Promise<void>;
  sendInvite(opts: SendInviteOptions): Promise<void>;
  sendContact(opts: SendContactOptions): Promise<void>;
}

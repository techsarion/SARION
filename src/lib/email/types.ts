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

export interface EmailProvider {
  sendPasswordReset(opts: SendPasswordResetOptions): Promise<void>;
  sendInvite(opts: SendInviteOptions): Promise<void>;
}

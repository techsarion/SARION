// Plain-HTML email templates. No external templating library required.
// Keep structure simple — wide client compatibility is more important than
// pretty code here.

export function passwordResetHtml(resetUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;border:1px solid #e2e8f0;overflow:hidden;max-width:100%;">
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.02em;">Sarion</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;">Reset your password</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
            You requested a password reset for your Sarion account. Click the button below to set a new password. This link expires in&nbsp;1&nbsp;hour.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:4px;">
            Reset Password
          </a>
          <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">
            If you did not request this, you can safely ignore this email. Your password will not change.
          </p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;background:#f8fafc;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">© 2026 Sarion · Built for modern agencies.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function passwordResetText(resetUrl: string): string {
  return `Reset your Sarion password

You requested a password reset. Visit the link below to set a new password.
This link expires in 1 hour.

${resetUrl}

If you did not request this, ignore this email.

— The Sarion team`;
}

export function inviteHtml(opts: {
  toName: string;
  agencyName: string;
  inviteUrl: string;
  expiryDays: number;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;border:1px solid #e2e8f0;overflow:hidden;max-width:100%;">
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #e2e8f0;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.02em;">Sarion</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;">
            You've been invited to join ${opts.agencyName}
          </h1>
          <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
            Hi ${opts.toName}, <strong>${opts.agencyName}</strong> has invited you to join their workspace on Sarion.
            Accept below to get started. This invitation expires in&nbsp;${opts.expiryDays}&nbsp;days.
          </p>
          <a href="${opts.inviteUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:4px;">
            Accept Invitation
          </a>
          <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">
            If you were not expecting this invitation, you can safely ignore it.
          </p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #e2e8f0;background:#f8fafc;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">© 2026 Sarion · Built for modern agencies.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function inviteText(opts: {
  toName: string;
  agencyName: string;
  inviteUrl: string;
  expiryDays: number;
}): string {
  return `You've been invited to join ${opts.agencyName} on Sarion

Hi ${opts.toName},

${opts.agencyName} has invited you to join their workspace. Visit the link below to accept.
This invitation expires in ${opts.expiryDays} days.

${opts.inviteUrl}

If you were not expecting this, ignore this email.

— The Sarion team`;
}

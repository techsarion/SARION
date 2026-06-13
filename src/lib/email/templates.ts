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

// Escape interpolated visitor input before placing it in HTML, so a message
// containing markup can never break the layout or inject content.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Shared brand chrome so every Sarion email looks consistent and trustworthy:
// a clean wordmark header, a white card on a soft background, and a footer
// carrying the company identity. `preheader` is the hidden inbox-preview line.
function brandShell(opts: {
  preheader: string;
  body: string;
  footer?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${escapeHtml(
    opts.preheader,
  )}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:100%;">
        <tr><td style="padding:0 8px 20px;">
          <span style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.03em;">Sarion</span>
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#2563eb;margin-left:2px;vertical-align:middle;"></span>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,0.04);">
          ${opts.body}
        </td></tr>
        <tr><td style="padding:24px 8px 0;">
          <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;line-height:1.5;">
            ${opts.footer ?? "Sarion — the agency CRM &amp; client portal built for modern teams."}
          </p>
          <p style="margin:0;font-size:12px;color:#cbd5e1;">© 2026 Sarion. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Internal notification (delivered to the Sarion inbox) ───────────────────
export function contactHtml(opts: {
  name: string;
  email: string;
  agency?: string;
  message: string;
}): string {
  const row = (label: string, value: string) => `
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#94a3b8;width:88px;vertical-align:top;">${label}</td>
              <td style="padding:6px 0;font-size:15px;color:#0f172a;font-weight:500;">${escapeHtml(value)}</td>
            </tr>`;
  const body = `
          <div style="height:4px;background:#2563eb;"></div>
          <div style="padding:32px 40px;">
            <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2563eb;">New enquiry</p>
            <h1 style="margin:0 0 24px;font-size:21px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;">Someone wants to talk to Sarion</h1>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;width:100%;">
              ${row("Name", opts.name)}
              ${row("Email", opts.email)}
              ${opts.agency ? row("Agency", opts.agency) : ""}
            </table>
            <div style="border-top:1px solid #e2e8f0;padding-top:20px;">
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">Message</p>
              <p style="margin:0;font-size:15px;color:#0f172a;line-height:1.65;white-space:pre-wrap;">${escapeHtml(
                opts.message,
              )}</p>
            </div>
            <div style="margin-top:28px;">
              <a href="mailto:${escapeHtml(
                opts.email,
              )}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 24px;border-radius:8px;">Reply to ${escapeHtml(
                opts.name,
              )}</a>
            </div>
          </div>`;
  return brandShell({
    preheader: `New enquiry from ${opts.name}${opts.agency ? ` at ${opts.agency}` : ""}`,
    body,
    footer:
      "You're receiving this because someone submitted the Sarion contact form. Reply directly to reach them.",
  });
}

export function contactText(opts: {
  name: string;
  email: string;
  agency?: string;
  message: string;
}): string {
  return `NEW CONTACT ENQUIRY — SARION

Name:   ${opts.name}
Email:  ${opts.email}${opts.agency ? `\nAgency: ${opts.agency}` : ""}

Message:
${opts.message}

— Reply directly to this email to respond to ${opts.name}.`;
}

// ── Acknowledgement / auto-reply (delivered to the visitor) ─────────────────
export function contactAckHtml(opts: {
  name: string;
  message: string;
  contactEmail: string;
}): string {
  const firstName = opts.name.trim().split(/\s+/)[0] || opts.name;
  const body = `
          <div style="height:4px;background:#2563eb;"></div>
          <div style="padding:32px 40px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;">Thanks for reaching out, ${escapeHtml(
              firstName,
            )}</h1>
            <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.65;">
              We've received your message and a member of the Sarion team will get
              back to you personally — usually within <strong>one business day</strong>.
            </p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#94a3b8;">Your message</p>
              <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;white-space:pre-wrap;">${escapeHtml(
                opts.message,
              )}</p>
            </div>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.65;">
              In the meantime, feel free to explore Sarion or start a free trial — no
              credit card required.
            </p>
            <a href="https://trysarion.com/signup" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 28px;border-radius:8px;">Start your free trial</a>
            <p style="margin:28px 0 0;font-size:14px;color:#475569;line-height:1.6;">
              Warm regards,<br>
              <strong style="color:#0f172a;">The Sarion Team</strong>
            </p>
          </div>`;
  return brandShell({
    preheader:
      "We've received your message and will reply within one business day.",
    body,
    footer: `This is an automated confirmation. Need to add something? Just reply to this email or write to ${escapeHtml(
      opts.contactEmail,
    )}.`,
  });
}

export function contactAckText(opts: {
  name: string;
  message: string;
  contactEmail: string;
}): string {
  const firstName = opts.name.trim().split(/\s+/)[0] || opts.name;
  return `Thanks for reaching out, ${firstName}

We've received your message and a member of the Sarion team will get back to
you personally — usually within one business day.

Your message:
${opts.message}

In the meantime, you're welcome to start a free trial (no credit card required):
https://trysarion.com/signup

Warm regards,
The Sarion Team

—
This is an automated confirmation. Need to add something? Just reply to this
email or write to ${opts.contactEmail}.`;
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

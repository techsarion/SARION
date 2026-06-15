import { brand, escapeHtml, type EmailContent } from "../design";
import {
  emailLayout,
  heading,
  paragraph,
  button,
  mutedNote,
  infoCard,
  textSignature,
} from "../layout";

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

// ── Welcome ─────────────────────────────────────────────────────────────────
export function welcome(data: { name: string; ctaUrl?: string }): EmailContent {
  const cta = data.ctaUrl ?? `${brand.url}/dashboard`;
  const body =
    heading(`Welcome to Sarion, ${escapeHtml(firstName(data.name))} 👋`) +
    paragraph(
      "Your workspace is ready. Sarion brings your clients, projects, invoices, and a branded client portal into one place — so you can spend less time wrangling tools and more time on the work.",
    ) +
    paragraph("Here's a great first step:") +
    infoCard(
      `<p class="email-body" style="margin:0;font-size:14px;color:${brand.body};line-height:1.6;">Add your first client and create a project — your branded client portal goes live the moment you do.</p>`,
    ) +
    button({ href: cta, label: "Open your dashboard" }) +
    mutedNote(
      `Questions? Just reply to this email — a real person on our team reads every message.`,
    );
  return {
    subject: "Welcome to Sarion — your workspace is ready",
    html: emailLayout({ preheader: "Your Sarion workspace is ready to go.", body, headerTitle: "Welcome aboard" }),
    text: `Welcome to Sarion, ${firstName(data.name)}!

Your workspace is ready. Add your first client and create a project to bring your branded client portal live.

Open your dashboard: ${cta}

${textSignature()}`,
  };
}

// ── Verify email ──────────────────────────────────────────────────────────
export function verifyEmail(data: { verifyUrl: string; name?: string }): EmailContent {
  const body =
    heading("Confirm your email address") +
    paragraph(
      "Thanks for signing up for Sarion. Please confirm this is your email address so we can secure your account and keep you in the loop.",
    ) +
    button({ href: data.verifyUrl, label: "Verify email" }) +
    mutedNote("This link expires in 24 hours. If you didn't create a Sarion account, you can safely ignore this email.");
  return {
    subject: "Confirm your email address",
    html: emailLayout({ preheader: "Confirm your email to activate your Sarion account.", body }),
    text: `Confirm your email address

Please verify your email to activate your Sarion account:
${data.verifyUrl}

This link expires in 24 hours. If you didn't sign up, ignore this email.

${textSignature()}`,
  };
}

// ── Password reset ──────────────────────────────────────────────────────────
export function passwordReset(data: { resetUrl: string }): EmailContent {
  const body =
    heading("Reset your password") +
    paragraph(
      "We received a request to reset the password for your Sarion account. Click below to choose a new one. This link expires in 1 hour.",
    ) +
    button({ href: data.resetUrl, label: "Reset password" }) +
    mutedNote("If you didn't request this, you can safely ignore this email — your password won't change.");
  return {
    subject: "Reset your Sarion password",
    html: emailLayout({ preheader: "Reset your Sarion password (link expires in 1 hour).", body }),
    text: `Reset your password

We received a request to reset your Sarion password. Use the link below within 1 hour:
${data.resetUrl}

If you didn't request this, ignore this email.

${textSignature()}`,
  };
}

// ── Magic login link ──────────────────────────────────────────────────────
export function magicLink(data: { loginUrl: string }): EmailContent {
  const body =
    heading("Your login link") +
    paragraph("Click below to securely sign in to Sarion. No password needed.") +
    button({ href: data.loginUrl, label: "Sign in to Sarion" }) +
    mutedNote("This link expires in 15 minutes and can be used once. If you didn't request it, you can ignore this email.");
  return {
    subject: "Your Sarion login link",
    html: emailLayout({ preheader: "Your secure sign-in link for Sarion.", body }),
    text: `Your login link

Sign in to Sarion securely (expires in 15 minutes, single use):
${data.loginUrl}

If you didn't request this, ignore this email.

${textSignature()}`,
  };
}

// ── Email changed confirmation ───────────────────────────────────────────
export function emailChanged(data: { newEmail: string; name?: string }): EmailContent {
  const body =
    heading("Your email address was changed") +
    paragraph(
      `The email address on your Sarion account was updated to <strong style="color:${brand.ink};">${escapeHtml(data.newEmail)}</strong>. You'll use this address to sign in from now on.`,
    ) +
    infoCard(
      `<p class="email-body" style="margin:0;font-size:14px;color:${brand.body};line-height:1.6;">Didn't make this change? <a href="mailto:${brand.supportEmail}" style="color:${brand.primary};text-decoration:none;font-weight:600;">Contact support</a> immediately so we can secure your account.</p>`,
      "warning",
    );
  return {
    subject: "Your Sarion email address was changed",
    html: emailLayout({ preheader: "Your account email address was updated.", body, accentColor: brand.warning }),
    text: `Your email address was changed

The email on your Sarion account is now ${data.newEmail}.

Didn't make this change? Contact ${brand.supportEmail} immediately.

${textSignature()}`,
  };
}

// ── Password changed confirmation ─────────────────────────────────────────
export function passwordChanged(data: { name?: string }): EmailContent {
  const hi = data.name ? `${escapeHtml(firstName(data.name))}, this` : "This";
  const body =
    heading("Your password was changed") +
    paragraph(`${hi} is a confirmation that the password for your Sarion account was just changed successfully.`) +
    infoCard(
      `<p class="email-body" style="margin:0;font-size:14px;color:${brand.body};line-height:1.6;">If this wasn't you, <a href="mailto:${brand.supportEmail}" style="color:${brand.primary};text-decoration:none;font-weight:600;">contact support</a> right away — your account may be at risk.</p>`,
      "warning",
    );
  return {
    subject: "Your Sarion password was changed",
    html: emailLayout({ preheader: "Your account password was changed.", body, accentColor: brand.warning }),
    text: `Your password was changed

The password for your Sarion account was changed successfully.

If this wasn't you, contact ${brand.supportEmail} immediately.

${textSignature()}`,
  };
}

// ── Team invite ───────────────────────────────────────────────────────────
export function teamInvite(data: {
  toName: string;
  agencyName: string;
  inviteUrl: string;
  expiryDays: number;
}): EmailContent {
  const body =
    heading(`You've been invited to join ${escapeHtml(data.agencyName)}`) +
    paragraph(
      `Hi ${escapeHtml(firstName(data.toName))}, <strong style="color:${brand.ink};">${escapeHtml(data.agencyName)}</strong> has invited you to collaborate on Sarion. Accept below to set up your account and get started.`,
    ) +
    button({ href: data.inviteUrl, label: "Accept invitation" }) +
    mutedNote(`This invitation expires in ${data.expiryDays} days. If you weren't expecting it, you can ignore this email.`);
  return {
    subject: `You've been invited to join ${data.agencyName} on Sarion`,
    html: emailLayout({ preheader: `Join ${data.agencyName} on Sarion.`, body }),
    text: `You've been invited to join ${data.agencyName} on Sarion

Hi ${firstName(data.toName)}, ${data.agencyName} has invited you to collaborate on Sarion. Accept your invitation:
${data.inviteUrl}

This invitation expires in ${data.expiryDays} days.

${textSignature()}`,
  };
}

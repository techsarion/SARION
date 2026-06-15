import { brand, escapeHtml, type EmailContent } from "../design";
import {
  emailLayout,
  heading,
  eyebrow,
  paragraph,
  button,
  infoCard,
  metaTable,
  textSignature,
} from "../layout";

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

// ── Visitor confirmation / auto-reply (from hello@) ─────────────────────────
export function contactConfirmation(data: {
  name: string;
  message: string;
  contactEmail: string;
}): EmailContent {
  const body =
    heading(`Thanks for reaching out, ${escapeHtml(firstName(data.name))}`) +
    paragraph(
      "We've received your message and a member of the Sarion team will get back to you personally — usually within <strong>one business day</strong>.",
    ) +
    infoCard(
      `<p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${brand.muted};">Your message</p>` +
        `<p class="email-body" style="margin:0;font-size:14px;color:${brand.body};line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.message)}</p>`,
    ) +
    paragraph("In the meantime, feel free to explore Sarion or start a free trial — no credit card required.") +
    button({ href: `${brand.url}/signup`, label: "Start your free trial" });
  return {
    subject: "We've received your message — Sarion",
    html: emailLayout({
      preheader: "We've received your message and will reply within one business day.",
      body,
      footerNote: `This is an automated confirmation. Need to add something? Reply to this email or write to ${data.contactEmail}.`,
    }),
    text: `Thanks for reaching out, ${firstName(data.name)}

We've received your message and will reply personally — usually within one business day.

Your message:
${data.message}

Start a free trial (no card required): ${brand.url}/signup

${textSignature()}`,
  };
}

// ── Internal team notification (from support@, replyTo visitor) ─────────────
export function contactInternal(data: {
  name: string;
  email: string;
  agency?: string;
  message: string;
}): EmailContent {
  const body =
    eyebrow("New enquiry") +
    heading("Someone wants to talk to Sarion") +
    metaTable([
      { label: "Name", value: escapeHtml(data.name) },
      { label: "Email", value: `<a href="mailto:${escapeHtml(data.email)}" style="color:${brand.primary};text-decoration:none;">${escapeHtml(data.email)}</a>` },
      ...(data.agency ? [{ label: "Agency", value: escapeHtml(data.agency) }] : []),
    ]) +
    infoCard(
      `<p style="margin:0 0 6px;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${brand.muted};">Message</p>` +
        `<p class="email-body" style="margin:0;font-size:15px;color:${brand.ink};line-height:1.65;white-space:pre-wrap;">${escapeHtml(data.message)}</p>`,
    ) +
    button({ href: `mailto:${escapeHtml(data.email)}`, label: `Reply to ${escapeHtml(firstName(data.name))}` });
  return {
    subject: `New enquiry from ${data.name}${data.agency ? ` (${data.agency})` : ""}`,
    html: emailLayout({
      preheader: `New enquiry from ${data.name}${data.agency ? ` at ${data.agency}` : ""}`,
      body,
      withSignature: false,
      footerNote: "You're receiving this because someone submitted the Sarion contact form. Reply directly to reach them.",
    }),
    text: `NEW CONTACT ENQUIRY — SARION

Name:   ${data.name}
Email:  ${data.email}${data.agency ? `\nAgency: ${data.agency}` : ""}

Message:
${data.message}

— Reply directly to this email to respond to ${data.name}.`,
  };
}

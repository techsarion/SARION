import { brand, escapeHtml, type EmailContent } from "../design";
import {
  emailLayout,
  heading,
  paragraph,
  button,
  mutedNote,
  metaTable,
  infoCard,
  textSignature,
} from "../layout";

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

// ── Demo booking confirmation ───────────────────────────────────────────────
export function demoBookingConfirmation(data: {
  name: string;
  dateTime: string;
  meetingUrl?: string;
  host?: string;
}): EmailContent {
  const body =
    heading(`Your Sarion demo is booked, ${escapeHtml(firstName(data.name))}`) +
    paragraph("Looking forward to showing you around. Here are your details:") +
    metaTable([
      { label: "When", value: escapeHtml(data.dateTime) },
      ...(data.host ? [{ label: "Host", value: escapeHtml(data.host) }] : []),
      ...(data.meetingUrl ? [{ label: "Where", value: `<a href="${data.meetingUrl}" style="color:${brand.primary};text-decoration:none;">Join link</a>` }] : []),
    ]) +
    (data.meetingUrl ? button({ href: data.meetingUrl, label: "Join the demo" }) : "") +
    mutedNote("Need to reschedule? Just reply to this email and we'll find a better time.");
  return {
    subject: "Your Sarion demo is confirmed",
    html: emailLayout({ preheader: `Demo confirmed for ${data.dateTime}.`, body }),
    text: `Your Sarion demo is booked, ${firstName(data.name)}

When: ${data.dateTime}${data.host ? `\nHost: ${data.host}` : ""}${data.meetingUrl ? `\nJoin: ${data.meetingUrl}` : ""}

Need to reschedule? Just reply.

${textSignature()}`,
  };
}

// ── Quote request received ──────────────────────────────────────────────────
export function quoteRequestReceived(data: { name: string }): EmailContent {
  const body =
    heading(`Thanks for your interest, ${escapeHtml(firstName(data.name))}`) +
    paragraph("We've received your quote request and our team is putting together pricing tailored to your needs. You'll hear back from us within one business day.") +
    infoCard(
      `<p class="email-body" style="margin:0;font-size:14px;color:${brand.body};line-height:1.6;">In the meantime, feel free to explore our plans and what's included.</p>`,
    ) +
    button({ href: `${brand.url}/pricing`, label: "View pricing" });
  return {
    subject: "We've received your quote request — Sarion",
    html: emailLayout({ preheader: "Your quote request is in — we'll reply within a business day.", body }),
    text: `Thanks for your interest, ${firstName(data.name)}

We've received your quote request and will reply within one business day with tailored pricing.

View pricing: ${brand.url}/pricing

${textSignature()}`,
  };
}

// ── Proposal sent ───────────────────────────────────────────────────────────
export function proposalSent(data: {
  name: string;
  proposalUrl: string;
  summary?: string;
}): EmailContent {
  const body =
    heading(`Your Sarion proposal is ready`) +
    paragraph(`Hi ${escapeHtml(firstName(data.name))}, as discussed, here's the proposal we put together for you.`) +
    (data.summary ? infoCard(`<p class="email-body" style="margin:0;font-size:14px;color:${brand.body};line-height:1.6;">${escapeHtml(data.summary)}</p>`) : "") +
    button({ href: data.proposalUrl, label: "Review proposal" }) +
    mutedNote("Have questions or want to adjust anything? Reply directly — we're happy to tailor it.");
  return {
    subject: "Your Sarion proposal",
    html: emailLayout({ preheader: "Your tailored Sarion proposal is ready to review.", body }),
    text: `Your Sarion proposal is ready

Hi ${firstName(data.name)}, here's the proposal we prepared.${data.summary ? `\n\n${data.summary}` : ""}

Review it: ${data.proposalUrl}

${textSignature()}`,
  };
}

// ── Lead follow-up ──────────────────────────────────────────────────────────
export function leadFollowUp(data: { name: string }): EmailContent {
  const body =
    heading(`Still thinking it over, ${escapeHtml(firstName(data.name))}?`) +
    paragraph("Just checking in after your interest in Sarion. If you have questions about features, pricing, or migrating from your current tools, I'm a reply away — happy to help however I can.") +
    paragraph("If now isn't the right time, no worries at all. Whenever you're ready, you can jump straight in:") +
    button({ href: `${brand.url}/signup`, label: "Start a free trial" });
  return {
    subject: "Quick follow-up from Sarion",
    html: emailLayout({ preheader: "Checking in — any questions about Sarion?", body }),
    text: `Still thinking it over, ${firstName(data.name)}?

Checking in after your interest in Sarion. Questions about features, pricing, or migrating? Just reply.

Start a free trial: ${brand.url}/signup

${textSignature()}`,
  };
}

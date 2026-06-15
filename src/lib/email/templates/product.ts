import { brand, escapeHtml, type EmailContent } from "../design";
import {
  emailLayout,
  heading,
  eyebrow,
  paragraph,
  button,
  mutedNote,
  infoCard,
  textSignature,
} from "../layout";

// Footer micro-copy for marketing emails — includes a one-click unsubscribe
// path when available (CAN-SPAM / good-citizen requirement for bulk sends).
function unsubscribeNoteText(url?: string): string {
  return url
    ? `You're receiving this because you subscribed to Sarion updates. Unsubscribe: ${url}`
    : "You're receiving this because you have a Sarion account.";
}

// ── New feature released ────────────────────────────────────────────────────
export function newFeature(data: {
  featureName: string;
  description: string;
  ctaUrl?: string;
  unsubscribeUrl?: string;
}): EmailContent {
  const cta = data.ctaUrl ?? `${brand.url}/dashboard`;
  const body =
    eyebrow("New in Sarion") +
    heading(escapeHtml(data.featureName)) +
    paragraph(escapeHtml(data.description)) +
    button({ href: cta, label: "Try it now" }) +
    mutedNote("Built from your feedback — keep it coming by replying to this email.");
  return {
    subject: `New in Sarion: ${data.featureName}`,
    html: emailLayout({
      preheader: `${data.featureName} is now live in Sarion.`,
      body,
      footerNote: unsubscribeNoteText(data.unsubscribeUrl),
    }),
    text: `New in Sarion: ${data.featureName}

${data.description}

Try it now: ${cta}

${textSignature()}`,
  };
}

// ── Product announcement ────────────────────────────────────────────────────
export function productAnnouncement(data: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  unsubscribeUrl?: string;
}): EmailContent {
  const content =
    eyebrow("Announcement") +
    heading(escapeHtml(data.title)) +
    paragraph(escapeHtml(data.body)) +
    (data.ctaUrl ? button({ href: data.ctaUrl, label: data.ctaLabel ?? "Learn more" }) : "");
  return {
    subject: data.title,
    html: emailLayout({
      preheader: data.title,
      body: content,
      footerNote: unsubscribeNoteText(data.unsubscribeUrl),
    }),
    text: `${data.title}

${data.body}${data.ctaUrl ? `\n\n${data.ctaLabel ?? "Learn more"}: ${data.ctaUrl}` : ""}

${textSignature()}`,
  };
}

// ── Newsletter ──────────────────────────────────────────────────────────────
export function newsletter(data: {
  headline: string;
  intro: string;
  items: { title: string; body: string; url?: string }[];
  unsubscribeUrl?: string;
}): EmailContent {
  const blocks = data.items
    .map(
      (it) =>
        infoCard(
          `<p class="email-ink" style="margin:0 0 6px;font-size:15px;font-weight:600;color:${brand.ink};">${escapeHtml(it.title)}</p>` +
            `<p class="email-body" style="margin:0 0 ${it.url ? "10px" : "0"};font-size:14px;color:${brand.body};line-height:1.6;">${escapeHtml(it.body)}</p>` +
            (it.url ? `<a href="${it.url}" style="color:${brand.primary};text-decoration:none;font-weight:600;font-size:14px;">Read more →</a>` : ""),
        ),
    )
    .join("");
  const body =
    eyebrow("The Sarion Brief") +
    heading(escapeHtml(data.headline)) +
    paragraph(escapeHtml(data.intro)) +
    blocks;
  return {
    subject: data.headline,
    html: emailLayout({
      preheader: data.intro,
      body,
      footerNote: unsubscribeNoteText(data.unsubscribeUrl),
    }),
    text: `${data.headline}

${data.intro}

${data.items.map((it) => `• ${it.title}\n  ${it.body}${it.url ? `\n  ${it.url}` : ""}`).join("\n\n")}

${textSignature()}`,
  };
}


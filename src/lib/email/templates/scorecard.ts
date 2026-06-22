import { brand, escapeHtml, type EmailContent } from "../design";
import {
  emailLayout,
  heading,
  eyebrow,
  paragraph,
  button,
  infoCard,
  metaTable,
  divider,
} from "../layout";

/**
 * Lead-magnet report delivery — sent (best-effort) when a visitor unlocks their
 * Agency Operations Scorecard with their email. Sent from hello@ (relationship).
 *
 * All values arrive pre-formatted as primitives from the caller so this template
 * stays presentational. `topFixes` text is template-authored copy (from config),
 * not user input — but we still escape defensively.
 */
export function scorecardReport(data: {
  scoreLabel: string; // e.g. "47 / 100"
  maturityLabel: string; // e.g. "Firefighting"
  maturityHeadline: string;
  revenueLeak: string; // e.g. "$12,300 / year"
  timeLost: string; // e.g. "8.5 hrs / week"
  reportUrl: string;
  trialUrl: string;
  topFixes: { feature: string; fix: string }[];
}): EmailContent {
  const fixesHtml = data.topFixes
    .slice(0, 3)
    .map(
      (f) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid ${brand.line};">` +
        `<p class="email-ink" style="margin:0 0 2px;font-size:14px;font-weight:600;color:${brand.ink};">${escapeHtml(f.feature)}</p>` +
        `<p class="email-body" style="margin:0;font-size:13px;color:${brand.body};line-height:1.55;">${escapeHtml(f.fix)}</p>` +
        `</td></tr>`,
    )
    .join("");

  const body =
    eyebrow("Your scorecard") +
    heading("Your Agency Operations Scorecard is ready") +
    paragraph(
      "Here's the snapshot from your assessment. Your full interactive report — with the pillar breakdown and every recommendation — is one click away.",
    ) +
    metaTable([
      { label: "Operations score", value: `<strong>${escapeHtml(data.scoreLabel)}</strong> · ${escapeHtml(data.maturityLabel)}` },
      { label: "Revenue leakage", value: escapeHtml(data.revenueLeak) },
      { label: "Time lost", value: escapeHtml(data.timeLost) },
    ]) +
    infoCard(
      `<p class="email-body" style="margin:0;font-size:14px;color:${brand.body};line-height:1.6;">${escapeHtml(data.maturityHeadline)}</p>`,
    ) +
    button({ href: data.reportUrl, label: "View your full report" }) +
    (fixesHtml
      ? divider() +
        `<p class="email-ink" style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${brand.muted};">Your top fixes</p>` +
        `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">${fixesHtml}</table>`
      : "") +
    paragraph(
      "Want Sarion to close these gaps for you? Start a free trial — no credit card required — and we'll set you up around your weakest areas first.",
    ) +
    button({ href: data.trialUrl, label: "Start your free trial", variant: "secondary" });

  return {
    subject: `Your agency scored ${data.scoreLabel} — here's your report`,
    html: emailLayout({
      preheader: `Operations score ${data.scoreLabel} · ${data.maturityLabel}. View your full report and top fixes.`,
      body,
      footerNote:
        "You're receiving this because you completed the Sarion Agency Operations Scorecard.",
    }),
    text: `Your Agency Operations Scorecard is ready

Operations score: ${data.scoreLabel} (${data.maturityLabel})
Revenue leakage: ${data.revenueLeak}
Time lost: ${data.timeLost}

${data.maturityHeadline}

View your full report: ${data.reportUrl}

Top fixes:
${data.topFixes.slice(0, 3).map((f) => `• ${f.feature} — ${f.fix}`).join("\n")}

Start a free trial (no card required): ${data.trialUrl}

— The Sarion Team`,
  };
}

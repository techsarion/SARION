import { brand, escapeHtml, type EmailContent } from "../design";
import {
  emailLayout,
  heading,
  paragraph,
  button,
  mutedNote,
  infoCard,
  metaTable,
  statusBadge,
  textSignature,
} from "../layout";

const billingUrl = `${brand.url}/settings/billing`;

// ── Payment successful ──────────────────────────────────────────────────────
export function paymentSuccessful(data: {
  planName: string;
  amount: string; // pre-formatted, e.g. "$49.00"
  interval: string; // "month" | "year"
  invoiceUrl?: string;
}): EmailContent {
  const body =
    heading("Payment received — thank you") +
    paragraph(`Your payment for the <strong style="color:${brand.ink};">${escapeHtml(data.planName)}</strong> plan went through successfully.`) +
    metaTable([
      { label: "Plan", value: escapeHtml(data.planName) },
      { label: "Amount", value: escapeHtml(data.amount) },
      { label: "Billing", value: `per ${escapeHtml(data.interval)}` },
      { label: "Status", value: statusBadge("Paid", "success") },
    ]) +
    button({ href: data.invoiceUrl ?? billingUrl, label: data.invoiceUrl ? "View invoice" : "View billing" }) +
    mutedNote("This receipt is for your records. Manage your subscription anytime from billing settings.");
  return {
    subject: `Payment received — ${data.planName} plan`,
    html: emailLayout({ preheader: `We received your payment for the ${data.planName} plan.`, body, accentColor: brand.success }),
    text: `Payment received — thank you

Plan: ${data.planName}
Amount: ${data.amount} per ${data.interval}
Status: Paid

Manage billing: ${data.invoiceUrl ?? billingUrl}

${textSignature()}`,
  };
}

// ── Payment failed ──────────────────────────────────────────────────────────
export function paymentFailed(data: {
  planName: string;
  amount: string;
  retryUrl?: string;
}): EmailContent {
  const body =
    heading("Action needed: your payment didn't go through") +
    paragraph(`We weren't able to process your payment for the <strong style="color:${brand.ink};">${escapeHtml(data.planName)}</strong> plan (${escapeHtml(data.amount)}). This usually happens when a card has expired or has insufficient funds.`) +
    infoCard(
      `<p class="email-body" style="margin:0;font-size:14px;color:${brand.body};line-height:1.6;">To avoid any interruption to your workspace, please update your payment method. We'll retry automatically once it's fixed.</p>`,
      "danger",
    ) +
    button({ href: data.retryUrl ?? billingUrl, label: "Update payment method", variant: "danger" }) +
    mutedNote("If you think this is a mistake, reply to this email and we'll help sort it out.");
  return {
    subject: "Action needed: your Sarion payment failed",
    html: emailLayout({ preheader: "Please update your payment method to avoid interruption.", body, accentColor: brand.danger }),
    text: `Action needed: your payment didn't go through

We couldn't process your payment for the ${data.planName} plan (${data.amount}).

Update your payment method to avoid interruption:
${data.retryUrl ?? billingUrl}

${textSignature()}`,
  };
}

// ── Subscription activated ──────────────────────────────────────────────────
export function subscriptionActivated(data: {
  planName: string;
  amount: string;
  interval: string;
}): EmailContent {
  const body =
    heading(`You're on the ${escapeHtml(data.planName)} plan 🎉`) +
    paragraph("Your subscription is active and every feature in your plan is unlocked. Here's a summary:") +
    metaTable([
      { label: "Plan", value: escapeHtml(data.planName) },
      { label: "Price", value: `${escapeHtml(data.amount)} / ${escapeHtml(data.interval)}` },
      { label: "Status", value: statusBadge("Active", "success") },
    ]) +
    button({ href: `${brand.url}/dashboard`, label: "Go to dashboard" }) +
    mutedNote("You can upgrade, downgrade, or cancel anytime from billing settings.");
  return {
    subject: `Your ${data.planName} subscription is active`,
    html: emailLayout({ preheader: `Your ${data.planName} plan is now active.`, body, accentColor: brand.success }),
    text: `You're on the ${data.planName} plan!

Plan: ${data.planName}
Price: ${data.amount} / ${data.interval}
Status: Active

Go to dashboard: ${brand.url}/dashboard

${textSignature()}`,
  };
}

// ── Subscription renewed ────────────────────────────────────────────────────
export function subscriptionRenewed(data: {
  planName: string;
  amount: string;
  nextBillingDate: string;
}): EmailContent {
  const body =
    heading("Your subscription has renewed") +
    paragraph(`Thanks for staying with Sarion. Your <strong style="color:${brand.ink};">${escapeHtml(data.planName)}</strong> plan has renewed successfully.`) +
    metaTable([
      { label: "Plan", value: escapeHtml(data.planName) },
      { label: "Amount", value: escapeHtml(data.amount) },
      { label: "Next billing", value: escapeHtml(data.nextBillingDate) },
    ]) +
    button({ href: billingUrl, label: "View billing" });
  return {
    subject: `Your ${data.planName} plan has renewed`,
    html: emailLayout({ preheader: `Your ${data.planName} subscription renewed successfully.`, body }),
    text: `Your subscription has renewed

Plan: ${data.planName}
Amount: ${data.amount}
Next billing: ${data.nextBillingDate}

View billing: ${billingUrl}

${textSignature()}`,
  };
}

// ── Subscription cancelled ──────────────────────────────────────────────────
export function subscriptionCancelled(data: {
  planName: string;
  accessUntil: string;
}): EmailContent {
  const body =
    heading("Your subscription has been cancelled") +
    paragraph(`We've cancelled your <strong style="color:${brand.ink};">${escapeHtml(data.planName)}</strong> plan as requested. You'll keep full access until <strong style="color:${brand.ink};">${escapeHtml(data.accessUntil)}</strong>, after which your workspace moves to the Free plan. Nothing is deleted — your data stays put.`) +
    button({ href: billingUrl, label: "Reactivate anytime" }) +
    mutedNote("Mind sharing why you cancelled? Just reply — your feedback genuinely shapes what we build next.");
  return {
    subject: "Your Sarion subscription was cancelled",
    html: emailLayout({ preheader: `Access continues until ${data.accessUntil}.`, body, accentColor: brand.warning }),
    text: `Your subscription has been cancelled

Your ${data.planName} plan is cancelled. You keep full access until ${data.accessUntil}, then move to the Free plan. Your data is preserved.

Reactivate anytime: ${billingUrl}

${textSignature()}`,
  };
}

// ── Invoice available ───────────────────────────────────────────────────────
export function invoiceAvailable(data: {
  invoiceNumber: string;
  amount: string;
  dueDate?: string;
  invoiceUrl: string;
  fromAgency?: string;
}): EmailContent {
  const who = data.fromAgency ? escapeHtml(data.fromAgency) : "Sarion";
  const body =
    heading(`Invoice ${escapeHtml(data.invoiceNumber)} is ready`) +
    paragraph(`A new invoice from <strong style="color:${brand.ink};">${who}</strong> is available to view and download.`) +
    metaTable([
      { label: "Invoice", value: escapeHtml(data.invoiceNumber) },
      { label: "Amount", value: escapeHtml(data.amount) },
      ...(data.dueDate ? [{ label: "Due", value: escapeHtml(data.dueDate) }] : []),
    ]) +
    button({ href: data.invoiceUrl, label: "View invoice" });
  return {
    subject: `Invoice ${data.invoiceNumber} — ${data.amount}`,
    html: emailLayout({ preheader: `Invoice ${data.invoiceNumber} is ready to view.`, body }),
    text: `Invoice ${data.invoiceNumber} is ready

From: ${data.fromAgency ?? "Sarion"}
Amount: ${data.amount}${data.dueDate ? `\nDue: ${data.dueDate}` : ""}

View invoice: ${data.invoiceUrl}

${textSignature()}`,
  };
}

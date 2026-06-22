/**
 * Sender mapping matrix — the single authority for WHICH address sends WHAT.
 * Follows the TrySarion email-ownership rules:
 *
 *   support@  → system + transactional + support (auth, billing, invoices, welcome)
 *   sales@    → revenue (demos, quotes, proposals, lead follow-up)
 *   hello@    → marketing + relationship (newsletter, announcements, features, contact reply)
 *   contact@  → public inbox only — never an automated sender (used as `to`/`replyTo`)
 *
 * `from` uses a friendly display name so inboxes show "Sarion" / "Sarion Team".
 */

export type SenderKey = "support" | "sales" | "hello" | "contact";

interface SenderProfile {
  address: string;
  displayName: string;
}

export const SENDERS: Record<SenderKey, SenderProfile> = {
  support: { address: "support@trysarion.com", displayName: "Sarion" },
  sales: { address: "sales@trysarion.com", displayName: "Sarion Sales" },
  hello: { address: "hello@trysarion.com", displayName: "Sarion" },
  contact: { address: "contact@trysarion.com", displayName: "Sarion Team" },
};

/** Every template the system can send. */
export type EmailKind =
  // Authentication (support@)
  | "welcome"
  | "verifyEmail"
  | "passwordReset"
  | "magicLink"
  | "emailChanged"
  | "passwordChanged"
  | "teamInvite"
  // Billing (support@)
  | "paymentSuccessful"
  | "paymentFailed"
  | "subscriptionActivated"
  | "subscriptionRenewed"
  | "subscriptionCancelled"
  | "invoiceAvailable"
  // Sales (sales@)
  | "demoBookingConfirmation"
  | "quoteRequestReceived"
  | "proposalSent"
  | "leadFollowUp"
  // Contact forms
  | "contactConfirmation" // → visitor (hello@, relationship)
  | "contactInternal" // → team inbox (support@ system, replyTo visitor)
  // Product / marketing (hello@)
  | "newFeature"
  | "productAnnouncement"
  | "newsletter"
  // Lead magnet (hello@)
  | "scorecardReport";

/** Workflow → sender. Drives deliverability + brand-voice correctness. */
export const SENDER_FOR: Record<EmailKind, SenderKey> = {
  welcome: "support",
  verifyEmail: "support",
  passwordReset: "support",
  magicLink: "support",
  emailChanged: "support",
  passwordChanged: "support",
  teamInvite: "support",

  paymentSuccessful: "support",
  paymentFailed: "support",
  subscriptionActivated: "support",
  subscriptionRenewed: "support",
  subscriptionCancelled: "support",
  invoiceAvailable: "support",

  demoBookingConfirmation: "sales",
  quoteRequestReceived: "sales",
  proposalSent: "sales",
  leadFollowUp: "sales",

  contactConfirmation: "hello",
  contactInternal: "support",

  newFeature: "hello",
  productAnnouncement: "hello",
  newsletter: "hello",

  scorecardReport: "hello",
};

/** RFC 5322 "Display Name <addr>" string for the Resend `from` field. */
export function fromFor(kind: EmailKind): string {
  const profile = SENDERS[SENDER_FOR[kind]];
  return `${profile.displayName} <${profile.address}>`;
}

/** The bare address (e.g. for documentation / reply-to defaults). */
export function addressFor(kind: EmailKind): string {
  return SENDERS[SENDER_FOR[kind]].address;
}

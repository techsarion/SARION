/**
 * Template registry — maps each EmailKind to its typed payload and builder.
 * This is what makes `sendEmail("welcome", to, { name })` fully type-safe: the
 * payload shape is checked against the template at the call site.
 */
import type { EmailContent } from "../design";
import type { EmailKind } from "../senders";
import * as auth from "./auth";
import * as billing from "./billing";
import * as sales from "./sales";
import * as contact from "./contact";
import * as product from "./product";
import * as scorecard from "./scorecard";

export interface EmailPayloads {
  // Auth
  welcome: { name: string; ctaUrl?: string };
  verifyEmail: { verifyUrl: string; name?: string };
  passwordReset: { resetUrl: string };
  magicLink: { loginUrl: string };
  emailChanged: { newEmail: string; name?: string };
  passwordChanged: { name?: string };
  teamInvite: { toName: string; agencyName: string; inviteUrl: string; expiryDays: number };
  // Billing
  paymentSuccessful: { planName: string; amount: string; interval: string; invoiceUrl?: string };
  paymentFailed: { planName: string; amount: string; retryUrl?: string };
  subscriptionActivated: { planName: string; amount: string; interval: string };
  subscriptionRenewed: { planName: string; amount: string; nextBillingDate: string };
  subscriptionCancelled: { planName: string; accessUntil: string };
  invoiceAvailable: { invoiceNumber: string; amount: string; dueDate?: string; invoiceUrl: string; fromAgency?: string };
  // Sales
  demoBookingConfirmation: { name: string; dateTime: string; meetingUrl?: string; host?: string };
  quoteRequestReceived: { name: string };
  proposalSent: { name: string; proposalUrl: string; summary?: string };
  leadFollowUp: { name: string };
  // Contact
  contactConfirmation: { name: string; message: string; contactEmail: string };
  contactInternal: { name: string; email: string; agency?: string; message: string };
  // Product
  newFeature: { featureName: string; description: string; ctaUrl?: string; unsubscribeUrl?: string };
  productAnnouncement: { title: string; body: string; ctaLabel?: string; ctaUrl?: string; unsubscribeUrl?: string };
  newsletter: { headline: string; intro: string; items: { title: string; body: string; url?: string }[]; unsubscribeUrl?: string };
  // Lead magnet
  scorecardReport: {
    scoreLabel: string;
    maturityLabel: string;
    maturityHeadline: string;
    revenueLeak: string;
    timeLost: string;
    reportUrl: string;
    trialUrl: string;
    topFixes: { feature: string; fix: string }[];
  };
}

// Compile-time guarantee that EmailPayloads covers exactly the EmailKind union.
type _AssertComplete = EmailKind extends keyof EmailPayloads ? true : never;
const _assert: _AssertComplete = true;
void _assert;

export const TEMPLATES: {
  [K in EmailKind]: (data: EmailPayloads[K]) => EmailContent;
} = {
  welcome: auth.welcome,
  verifyEmail: auth.verifyEmail,
  passwordReset: auth.passwordReset,
  magicLink: auth.magicLink,
  emailChanged: auth.emailChanged,
  passwordChanged: auth.passwordChanged,
  teamInvite: auth.teamInvite,

  paymentSuccessful: billing.paymentSuccessful,
  paymentFailed: billing.paymentFailed,
  subscriptionActivated: billing.subscriptionActivated,
  subscriptionRenewed: billing.subscriptionRenewed,
  subscriptionCancelled: billing.subscriptionCancelled,
  invoiceAvailable: billing.invoiceAvailable,

  demoBookingConfirmation: sales.demoBookingConfirmation,
  quoteRequestReceived: sales.quoteRequestReceived,
  proposalSent: sales.proposalSent,
  leadFollowUp: sales.leadFollowUp,

  contactConfirmation: contact.contactConfirmation,
  contactInternal: contact.contactInternal,

  newFeature: product.newFeature,
  productAnnouncement: product.productAnnouncement,
  newsletter: product.newsletter,

  scorecardReport: scorecard.scorecardReport,
};

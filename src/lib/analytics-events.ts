/**
 * Canonical analytics event names — the single source of truth shared by the
 * client tracker (src/lib/analytics.ts) and the server tracker
 * (src/lib/posthog-server.ts). No "use client" / "server-only" here so both
 * runtimes can import it.
 *
 * Privacy note: event *names* and the property keys we attach are deliberately
 * non-PII. Never put emails, names, or free-text into properties — use stable
 * ids (userId / agencyId) and enums (tier, interval, type) only.
 */
export const ANALYTICS_EVENTS = {
  // ── Marketing (client-side) ──
  LandingViewed: "Landing Viewed",
  PricingViewed: "Pricing Viewed",
  ContactViewed: "Contact Viewed",
  SignupClicked: "Signup Clicked",

  // ── Product (server-side) ──
  WorkspaceCreated: "Workspace Created",
  ClientCreated: "Client Created",
  ProjectCreated: "Project Created",
  InvoiceCreated: "Invoice Created",
  TeamMemberInvited: "Team Member Invited",
  FeedbackSubmitted: "Feedback Submitted",

  // ── Billing (server-side) ──
  CheckoutStarted: "Checkout Started",
  CheckoutCompleted: "Checkout Completed",
  SubscriptionActivated: "Subscription Activated",
  SubscriptionCancelled: "Subscription Cancelled",

  // ── Legacy (kept for existing Plausible dashboards) ──
  Signup: "Signup",
  BillingUpgrade: "Billing Upgrade",
  PortalOpen: "Portal Open",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Property values we allow on events — primitives only, never objects/PII. */
export type AnalyticsProps = Record<string, string | number | boolean>;

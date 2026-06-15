# Sarion Email Notification System

Production email architecture: a branded design system + typed template registry + automatic sender selection, sending through Resend (with a console fallback in dev).

## 1. Audit of the previous system

| Area | Before | After |
|------|--------|-------|
| Templates | 3 (reset, invite, contact) | **22** across auth/billing/sales/contact/product |
| Sender | single `EMAIL_FROM` for everything | **ownership matrix** (support/sales/hello/contact) |
| Layout | one `brandShell` string | reusable `emailLayout` + components (button, infoCard, metaTable, signature, badge, divider) |
| Branding | 12px radius, generic | matches site exactly: `#2563EB` primary, cyan accent, sharp 2px radius, Inter + Fraunces, real logo |
| Dark mode | none | `prefers-color-scheme` dark layer + `color-scheme` meta |
| Signature | inconsistent | standard signature on every customer-facing email |
| Type safety | per-function | `sendEmail(kind, to, data)` checks payload against template |
| Provider | template-coupled | provider transmits a resolved `OutgoingEmail` only |

## 2. Sender mapping matrix

Defined in [`src/lib/email/senders.ts`](../src/lib/email/senders.ts).

| Workflow | Template kind | From |
|----------|---------------|------|
| Welcome after signup | `welcome` | support@ |
| Verify email | `verifyEmail` | support@ |
| Password reset | `passwordReset` | support@ |
| Magic login link | `magicLink` | support@ |
| Email changed | `emailChanged` | support@ |
| Password changed | `passwordChanged` | support@ |
| Team invite | `teamInvite` | support@ |
| Payment successful | `paymentSuccessful` | support@ |
| Payment failed | `paymentFailed` | support@ |
| Subscription activated | `subscriptionActivated` | support@ |
| Subscription renewed | `subscriptionRenewed` | support@ |
| Subscription cancelled | `subscriptionCancelled` | support@ |
| Invoice available | `invoiceAvailable` | support@ |
| Demo booking confirmation | `demoBookingConfirmation` | sales@ |
| Quote request received | `quoteRequestReceived` | sales@ |
| Proposal sent | `proposalSent` | sales@ |
| Lead follow-up | `leadFollowUp` | sales@ |
| Contact — visitor confirmation | `contactConfirmation` | hello@ |
| Contact — internal notification | `contactInternal` | support@ (replyTo = visitor) |
| New feature released | `newFeature` | hello@ |
| Product announcement | `productAnnouncement` | hello@ |
| Newsletter | `newsletter` | hello@ |

`contact@` is the public address only — never an automated sender (used as the `to`/`replyTo` inbox).

## 3. Architecture

```
src/lib/email/
  design.ts        — brand tokens (colours, radius, fonts, logo) + EmailContent type
  layout.ts        — emailLayout() + reusable components (button, infoCard, metaTable,
                     statusBadge, signature, divider, heading, paragraph, footer)
  senders.ts       — EmailKind union, ownership matrix, fromFor()
  types.ts         — OutgoingEmail + EmailProvider contract
  index.ts         — sendEmail(kind, to, data) + back-compat helpers + provider singleton
  providers/
    resend.ts      — production (transmits a resolved OutgoingEmail)
    console.ts     — dev fallback (logs summary)
  templates/
    index.ts       — EmailPayloads + TEMPLATES registry (type-safe)
    auth.ts billing.ts sales.ts contact.ts product.ts
```

## 4. Usage

```ts
import { sendEmail } from "@/lib/email";

// Type-safe: payload is checked against the template; sender is automatic.
await sendEmail("welcome", user.email, { name: user.name });
await sendEmail("invoiceAvailable", client.email, {
  invoiceNumber: "INV-001", amount: "$1,200.00", invoiceUrl, fromAgency: "Northbeam",
});

// Contact form (back-compat helper handles both sends):
import { sendContactEmail } from "@/lib/email";
await sendContactEmail({ name, email, agency, message });
```

## 5. Wired triggers (live now)

| Template | Trigger | Source | Failure mode |
|----------|---------|--------|--------------|
| `welcome` | New owner signup | `auth.ts` after-hook | safe (never blocks signup) |
| `verifyEmail` | Signup (`sendOnSignUp`) | `auth.ts` emailVerification | safe; non-required (login not gated) |
| `passwordReset` | Reset request | `auth.ts` sendResetPassword | **throws** (user told if it fails) |
| `passwordChanged` | After reset | `auth.ts` onPasswordReset | safe |
| `teamInvite` | Invite a member | `server/actions/team.ts` | safe |
| `contactInternal` | Contact form | `api/contact/route.ts` | **throws** (critical inbox notify) |
| `contactConfirmation` | Contact form | `api/contact/route.ts` | safe (acknowledgement) |
| `subscriptionActivated` | `checkout.session.completed` | billing webhook | safe |
| `subscriptionRenewed` | `invoice.paid` (cycle) | billing webhook | safe |
| `subscriptionCancelled` | `customer.subscription.deleted` | billing webhook | safe |
| `paymentFailed` | `invoice.payment_failed` | billing webhook | safe |
| `invoiceAvailable` | Agency creates client invoice | `server/actions/invoices.ts` | safe (only if client has email) |

## 6. Test surface

- **Preview script:** `npx tsx scripts/email-preview.ts` → renders all 22 templates to `.email-previews/*.html` + a gallery `index.html` (open on desktop / phone / dark mode).
- **Guarded route:** `GET /api/dev/email-test`
  - no params → JSON list of every kind + its sender
  - `?kind=welcome` → live HTML preview in the browser
  - `?kind=welcome&to=you@x.com` → actually sends via Resend
  - In production it 404s unless `EMAIL_TEST_TOKEN` is set and passed as `?token=`.

## 7. Remaining manual/feature-gated triggers

These templates are built, type-safe, sample-tested, and callable via the test
route, but have **no automatic trigger** because the product surface doesn't
exist yet. Wire with a one-line `sendEmail(...)` when the flow ships:

| Template | Needs |
|----------|-------|
| `magicLink` | Passwordless login (Better Auth magic-link plugin + UI) |
| `emailChanged` | Change-email flow in account settings |
| `paymentSuccessful` | Decide vs. Stripe's own receipts (avoid duplicate) — wire on `invoice.paid` create if desired |
| `demoBookingConfirmation`, `quoteRequestReceived`, `proposalSent`, `leadFollowUp` | A sales/CRM pipeline |
| `newFeature`, `productAnnouncement`, `newsletter` | A marketing broadcast tool / audience list |

## 8. Production hardening (in `src/lib/email/index.ts`)

- `sendEmail` (throws after retries) vs `sendEmailSafe` (never throws) — best-effort paths use the safe variant so **email never breaks a user action**.
- **Retry** with exponential backoff (3 attempts: 0 / 300ms / 900ms).
- **Structured JSON logs** (`[email] {event,...}`) for `provider.init`, `send.ok`, `send.retry`, `send.failed`.
- **Monitoring hook:** `onEmailFailure(cb)` — wire to Sentry/Datadog at startup.

## 7. Deliverability — manual setup

1. **Verify `trysarion.com` in Resend** and configure **SPF, DKIM, DMARC** so all six addresses authenticate.
2. Each sender address (support@, sales@, hello@, contact@) must be a verified sender on the domain.
3. Set `RESEND_API_KEY` in production (without it, emails only log to console).
4. For bulk/marketing sends (`newsletter`, `productAnnouncement`), pass `unsubscribeUrl` and consider a `List-Unsubscribe` header.
5. Logo loads from `${NEXT_PUBLIC_APP_URL}/light-theme-logo-SARION.png` — ensure that asset is publicly reachable in production.

# Sarion — Launch Checklist

Last updated: 2026-06-11

Status key: ✅ Done · ⚠️ Needs action · ❌ Blocker

---

## Product

| # | Item | Status |
|---|------|--------|
| 1 | F1 Authentication (signup, login, forgot/reset password) | ✅ |
| 2 | F2 Team invites (token-gated, email-scoped) | ✅ |
| 3 | F3 Client management (CRUD, portal token, soft-delete) | ✅ |
| 4 | F4 Project management (CRUD, tasks, status, soft-delete) | ✅ |
| 5 | F5 Client portal (unauthenticated, token-gated, rate-limited) | ✅ |
| 6 | F6 Invoice management (CRUD, race-safe numbering, status) | ✅ |
| 7 | F7 Dashboard (real metrics — revenue, clients, projects, overdue) | ✅ |
| 8 | F8 Onboarding (one-time seed, 5-step checklist, `seeded` flag) | ✅ |
| 9 | F9 Stripe billing (Checkout, webhooks, billing page) | ✅ |

---

## Authentication

| # | Item | Status |
|---|------|--------|
| 1 | `BETTER_AUTH_SECRET` is a strong random value (not the dev placeholder) | ⚠️ Set in production |
| 2 | `BETTER_AUTH_URL` matches the production domain | ⚠️ Set in production |
| 3 | Password reset email delivery is wired (Resend / SMTP) | ✅ ResendProvider wired; ConsoleProvider fallback in dev |
| 4 | Team invite emails are sent (not just token generated) | ✅ sendInviteEmail() called in inviteTeamMember() |
| 5 | Session expiry is appropriate for your user base | ✅ Better Auth default |

---

## Clients / Projects / Invoices

| # | Item | Status |
|---|------|--------|
| 1 | All queries are scoped by `agencyId` from session — no client-supplied IDs trusted | ✅ |
| 2 | Soft-delete implemented for clients, projects, invoices | ✅ |
| 3 | Invoice numbers are race-safe (atomic sequence increment) | ✅ |
| 4 | Portal token is a `cuid()`, rotated on demand | ✅ |

---

## Portal

| # | Item | Status |
|---|------|--------|
| 1 | Portal is unauthenticated (no session required by client) | ✅ |
| 2 | Rate limiting on comments (5 per client per 10 min, DB-backed) | ✅ |
| 3 | No cross-client access possible (token → clientId → agencyId verified) | ✅ |
| 4 | Portal branding uses agency name/logo | ✅ |

---

## Billing (Stripe)

| # | Item | Status |
|---|------|--------|
| 1 | `STRIPE_SECRET_KEY` is set (live key for production) | ⚠️ Set in production |
| 2 | `STRIPE_WEBHOOK_SECRET` is set and matches Stripe Dashboard endpoint | ⚠️ Set in production |
| 3 | Three Stripe prices created (Starter $29, Growth $59, Agency $99) | ⚠️ Create in Stripe Dashboard |
| 4 | `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_AGENCY` env vars set | ⚠️ Set in production |
| 5 | Webhook endpoint registered in Stripe Dashboard (`/api/billing/webhook`) | ⚠️ Register after deploy |
| 6 | Webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` | ✅ Implemented |
| 7 | Billing page is owner-only (`requireOwner()`) | ✅ |
| 8 | `requireActiveSubscription()` built but not yet enforced | ✅ Ready to wire |

---

## Technical

| # | Item | Status |
|---|------|--------|
| 1 | `DATABASE_URL` points to production Postgres (pgbouncer pooler) | ⚠️ Set in production |
| 2 | `DIRECT_URL` points to session pooler (for migrations) | ⚠️ Set in production |
| 3 | `NEXT_PUBLIC_APP_URL` set to production domain (no trailing slash) | ⚠️ Set in production |
| 4 | `prisma migrate deploy` run against production database | ⚠️ Run on first deploy |
| 5 | `output: "standalone"` in `next.config.ts` for Docker/Coolify | ✅ |
| 6 | TypeScript compiles clean (`npx tsc --noEmit`) | ✅ |
| 7 | No secrets committed to git (`.env` in `.gitignore`) | ✅ |

---

## Monitoring & Analytics

| # | Item | Status |
|---|------|--------|
| 1 | Sentry DSN set (`NEXT_PUBLIC_SENTRY_DSN`) | ⚠️ Set in production |
| 2 | Sentry org/project set for source map uploads | ⚠️ Set in production |
| 3 | Plausible domain set (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) | ⚠️ Set in production |
| 4 | Plausible custom events: Signup, Billing Upgrade, Portal Open | ✅ Wired |
| 5 | Sentry captures server + client + edge errors | ✅ Config in place |

---

## Marketing

| # | Item | Status |
|---|------|--------|
| 1 | All pages resolve without 404 (`/`, `/features`, `/pricing`, `/contact`, `/privacy`, `/terms`) | ✅ |
| 2 | "Book Demo" CTA replaced with real actions everywhere | ✅ |
| 3 | Hero screenshot re-captured with clean demo account (no test emails, no empty data) | ⚠️ **Must do before launch** |
| 4 | Footer links all resolve | ✅ |
| 5 | Privacy Policy contact email is live and monitored | ⚠️ Verify `hello@trysarion.com` |
| 6 | Terms of Service contact email is live and monitored | ⚠️ Verify `hello@trysarion.com` |
| 7 | Signup consent links to real Terms/Privacy pages | ✅ |
| 8 | No fake testimonials or fabricated metrics | ✅ |

---

## Deployment

| # | Item | Status |
|---|------|--------|
| 1 | Docker image builds (`next build` succeeds) | ⚠️ Verify after env vars set |
| 2 | Health check endpoint returns 200 | ⚠️ Add `/api/health` or use `/` |
| 3 | Custom domain configured (DNS + TLS) | ⚠️ Configure in host |
| 4 | `NEXT_PUBLIC_APP_URL` updated to final domain | ⚠️ After domain confirmed |
| 5 | Stripe webhook URL updated to production domain | ⚠️ After domain confirmed |
| 6 | `BETTER_AUTH_URL` updated to production domain | ⚠️ After domain confirmed |

---

## Pre-launch Smoke Test (run manually after deploy)

- [ ] Sign up as owner → onboarding appears → complete all 5 steps
- [ ] Create a client, project, and invoice
- [ ] Invite a team member → accept via email link → verify member cannot access billing/team management
- [ ] Open client portal via token URL → leave a comment
- [ ] Subscribe to a plan → Stripe Checkout completes → dashboard shows active plan
- [ ] Trigger webhook locally with `stripe listen` → verify DB updates
- [ ] Log out → log back in → session restores correctly
- [ ] Password reset flow end-to-end
- [ ] Verify Sentry receives a test error (console trigger in staging)
- [ ] Verify Plausible receives Signup and Portal Open events

---

## Remaining blockers before `READY FOR DEPLOYMENT`

1. **Purchase a domain** and configure DNS → Coolify → TLS.
2. **Set production env vars** — `BETTER_AUTH_SECRET` (real secret), database URLs, `NEXT_PUBLIC_APP_URL`.
3. **Stripe production configuration** — create 3 prices, register webhook, set live keys.
4. **Resend production configuration** — verify sending domain, create API key, set `RESEND_API_KEY` + `EMAIL_FROM`.
5. **Re-capture hero/product screenshots** — visible test email in hero screenshot.

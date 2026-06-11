# Sarion — Deployment Guide

Step-by-step production deployment on **Coolify (VPS)**. Adapt for Vercel, Railway, or Render as needed.

---

## Prerequisites

- VPS with Coolify installed ([coolify.io/docs](https://coolify.io/docs))
- Domain name purchased and DNS pointed at your server
- Supabase (or self-hosted Postgres) database
- Stripe account
- Resend account with a verified sending domain

---

## 1. Database

### Option A — Supabase (recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. **Project Settings → Database → Connection string**, copy:
   - **Transaction pooler URL** → `DATABASE_URL` (append `?pgbouncer=true` if absent)
   - **Session pooler URL** → `DIRECT_URL`

```
DATABASE_URL=postgresql://postgres.[ref]:[pw]@aws-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[pw]@aws-[region].pooler.supabase.com:5432/postgres
```

### Option B — Coolify managed Postgres

1. Coolify → **Databases → New → PostgreSQL**
2. Use the connection string for both `DATABASE_URL` and `DIRECT_URL`

### Run migrations on first deploy

```bash
# Run with DIRECT_URL pointing to production:
npx prisma migrate deploy
```

Set this as a **Release Command** in Coolify so it runs automatically on every deploy.

---

## 2. Environment Variables

Set in Coolify (or your platform's env UI). Never commit to git.

### Required — app will not start without these

| Variable | Example value | Source |
|---|---|---|
| `DATABASE_URL` | `postgresql://...?pgbouncer=true` | Supabase |
| `DIRECT_URL` | `postgresql://...:5432/postgres` | Supabase |
| `NEXT_PUBLIC_APP_URL` | `https://trysarion.com` | Your domain |
| `BETTER_AUTH_SECRET` | `<32-char random string>` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://trysarion.com` | Your domain |

### Required — Stripe billing

| Variable | Example value | Source |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe → Webhooks (after registering) |
| `STRIPE_PRICE_STARTER` | `price_...` | Stripe → Products |
| `STRIPE_PRICE_GROWTH` | `price_...` | Stripe → Products |
| `STRIPE_PRICE_AGENCY` | `price_...` | Stripe → Products |

### Required — Email delivery

| Variable | Example value | Source |
|---|---|---|
| `RESEND_API_KEY` | `re_...` | Resend → API Keys |
| `EMAIL_FROM` | `hello@trysarion.com` | Your verified Resend domain |

### Optional — Monitoring and analytics

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry project DSN |
| `SENTRY_ORG` | Sentry org slug |
| `SENTRY_PROJECT` | Sentry project slug |
| `SENTRY_AUTH_TOKEN` | For source map uploads at build time |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | e.g. `trysarion.com` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact email shown on marketing site |

---

## 3. Domain Configuration

1. Add an **A record** in your DNS pointing to your VPS IP:
   ```
   A   app   →   <vps-ip>   TTL 300
   ```
2. In Coolify → your app → **Domains** → add `trysarion.com`
3. Coolify provisions a Let's Encrypt TLS cert automatically
4. Update `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` to `https://trysarion.com`

---

## 4. Stripe Setup

### Create products and prices

1. Stripe Dashboard → **Products → Add Product** — create three:
   - **Sarion Starter** — $29/month recurring
   - **Sarion Growth** — $59/month recurring
   - **Sarion Agency** — $99/month recurring
2. Copy each **Price ID** (`price_...`) → set `STRIPE_PRICE_STARTER`, `_GROWTH`, `_AGENCY`

### Register the webhook

1. Stripe → **Developers → Webhooks → Add endpoint**
2. URL: `https://trysarion.com/api/billing/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** → set as `STRIPE_WEBHOOK_SECRET`

### Test webhooks locally

```bash
stripe listen --forward-to localhost:3001/api/billing/webhook
# Copy the webhook signing secret output → STRIPE_WEBHOOK_SECRET for local testing
```

---

## 5. Resend Setup

1. Sign up at [resend.com](https://resend.com)
2. **Domains → Add Domain** → enter your domain (e.g. `trysarion.com`)
3. Add the 3 DNS records Resend provides (SPF, DKIM, DMARC)
4. Wait for domain verification (minutes)
5. **API Keys → Create API Key** → name `sarion-production`, permission: Sending access
6. Set `RESEND_API_KEY` and `EMAIL_FROM=hello@trysarion.com`

> Without `RESEND_API_KEY`, the app falls back to logging emails to the console.
> A warning banner is shown in the billing page if Stripe is not configured.

---

## 6. Sentry Setup

1. Create a **Next.js** project at [sentry.io](https://sentry.io)
2. Copy the DSN → `NEXT_PUBLIC_SENTRY_DSN`
3. Create an auth token → `SENTRY_AUTH_TOKEN` (enables source map uploads)
4. Set `SENTRY_ORG` and `SENTRY_PROJECT`
5. Verify: open your production site, check Sentry for incoming events

---

## 7. Plausible Setup

1. Add your site at [plausible.io](https://plausible.io)
2. Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` to the domain you registered (e.g. `trysarion.com`)
3. Verify via Plausible → Realtime after opening the site

---

## 8. Coolify Deployment

### First deploy

1. Coolify → **New Resource → Application → Public Git Repository**
2. Repository: your GitHub URL, branch `main`
3. Build command: `npm run build`
4. Start command: `node .next/standalone/server.js`
5. Port: `3000`
6. Add all environment variables from Section 2
7. Release command: `npx prisma migrate deploy`
8. **Deploy**

### Subsequent deploys

Push to `main` → Coolify auto-builds → migrations run → app restarts. Zero manual steps.

---

## 9. Final Verification Checklist

Run through this after first production deploy:

- [ ] Site loads at `https://trysarion.com`
- [ ] Marketing homepage loads: `/`, `/features`, `/pricing`, `/about`, `/contact`
- [ ] Sign up → onboarding appears → complete all 5 steps
- [ ] Create a client, project, and invoice
- [ ] Open client portal via portal token URL
- [ ] Leave a comment on the portal
- [ ] Invite a team member → email arrives → accept invite → confirm member access
- [ ] Password reset: request reset → email arrives → new password works
- [ ] Subscribe to a plan → Stripe Checkout opens → complete with test card `4242 4242 4242 4242`
- [ ] After checkout: billing page shows **Active** + correct plan name
- [ ] Stripe Dashboard → webhook shows **200** delivery status
- [ ] Sentry Dashboard → no unexpected errors on initial load
- [ ] Plausible Dashboard → Signup and Portal Open events visible

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| App fails to start | Missing required env var | Check logs for the validation error banner |
| Auth loops or 401s | `BETTER_AUTH_URL` mismatch | Match it exactly to `NEXT_PUBLIC_APP_URL` |
| Stripe checkout fails | Wrong key type | Use `sk_live_` for production, not `sk_test_` |
| Webhook returns 400 | Wrong `STRIPE_WEBHOOK_SECRET` | Re-copy signing secret from Stripe Dashboard |
| Emails not arriving | Missing API key or unverified domain | Check Resend → Logs → email status |
| Migration errors | `DIRECT_URL` wrong | Confirm it uses the session pooler (port 5432) |
| Portal 404 | Missing portal token in URL | Confirm client has a `portalToken` in DB |

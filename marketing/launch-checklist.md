# Sarion — Launch Checklist

> Practical, MVP-focused launch checklist for a solo founder. Goal: **launch in 7 days, acquire first 10 paying customers.** Matches the frozen [MVP-PRD](../docs/MVP-PRD.md).
>
> **Owner:** Founder (all items) · **Default status:** Not Started
> **Priority:** 🔴 Critical (blocks launch) · 🟡 Important (should have) · 🟢 Nice-to-have (post-launch OK)

---

## 1. Product

| # | Item | Priority | Owner | Status |
|---|---|---|---|---|
| P-1 | **Authentication** — signup, login, logout, protected routes work | 🔴 Critical | Founder | Not Started |
| P-2 | **Agency workspace** — auto-created on signup; name + logo editable | 🔴 Critical | Founder | Not Started |
| P-3 | **Clients** — create/edit/delete/list; detail page works | 🔴 Critical | Founder | Not Started |
| P-4 | **Projects** — CRUD, status, due date; tied to client | 🔴 Critical | Founder | Not Started |
| P-5 | **Tasks** — checklist add/toggle/delete inside project | 🟡 Important | Founder | Not Started |
| P-6 | **Client Portal** — token link, branded, read-only + comments | 🔴 Critical | Founder | Not Started |
| P-7 | **Invoices** — create with line items, totals, mark paid/unpaid | 🟡 Important | Founder | Not Started |
| P-8 | **Dashboard** — client count, projects-by-status, unpaid total, due this week | 🟡 Important | Founder | Not Started |
| P-9 | **Onboarding** — demo seed data + 5-step activation checklist | 🟡 Important | Founder | Not Started |
| P-10 | Empty states present on every list (no blank crashes) | 🔴 Critical | Founder | Not Started |
| P-11 | Tenant scoping verified — no cross-agency data leak | 🔴 Critical | Founder | Not Started |

---

## 2. Payments

| # | Item | Priority | Owner | Status |
|---|---|---|---|---|
| PAY-1 | **Stripe account** live mode activated + business details verified | 🔴 Critical | Founder | Not Started |
| PAY-2 | **Subscription plans** created in Stripe — Starter $29, Growth $59, Agency $99 | 🔴 Critical | Founder | Not Started |
| PAY-3 | **Stripe Checkout** — plan selection → checkout session works | 🔴 Critical | Founder | Not Started |
| PAY-4 | **Stripe Webhooks** — endpoint live, signature verified, updates subscription status | 🔴 Critical | Founder | Not Started |
| PAY-5 | **Trial logic** — trial starts on signup; lapsed trial gates app / shows banner | 🔴 Critical | Founder | Not Started |
| PAY-6 | Billing page — current plan + upgrade button | 🔴 Critical | Founder | Not Started |
| PAY-7 | Test mode → live mode keys swapped in production env | 🔴 Critical | Founder | Not Started |
| PAY-8 | Successful real test payment with a real card (then refund) | 🔴 Critical | Founder | Not Started |

---

## 3. Marketing

| # | Item | Priority | Owner | Status |
|---|---|---|---|---|
| M-1 | **Landing page** — headline, subheadline, CTA → signup | 🔴 Critical | Founder | Not Started |
| M-2 | **Pricing page/section** — 3 plans, clear CTA | 🔴 Critical | Founder | Not Started |
| M-3 | **Product screenshots** — dashboard, client portal, invoice (3–5 clean shots) | 🟡 Important | Founder | Not Started |
| M-4 | **Demo video** — 60–90s screen recording of the core flow | 🟢 Nice-to-have | Founder | Not Started |
| M-5 | **Launch announcement** — copy for Twitter/X, LinkedIn, relevant communities | 🟡 Important | Founder | Not Started |
| M-6 | OG image + meta tags (title, description) for sharing | 🟡 Important | Founder | Not Started |
| M-7 | Founder email + reply-to set up (support@ / hello@) | 🟡 Important | Founder | Not Started |
| M-8 | List of first 20–30 target agencies to DM/email directly | 🔴 Critical | Founder | Not Started |

> **Strategic note:** the first 10 customers come from **direct outreach (M-8)**, not broadcast. The landing page closes them; your DMs start the conversation.

---

## 4. Technical

| # | Item | Priority | Owner | Status |
|---|---|---|---|---|
| T-1 | **PostgreSQL** — production DB provisioned (Coolify managed service) | 🔴 Critical | Founder | Not Started |
| T-2 | **Domain** — purchased + DNS pointed to VPS | 🔴 Critical | Founder | Not Started |
| T-3 | **SSL** — Let's Encrypt cert auto-provisioned, HTTPS forced | 🔴 Critical | Founder | Not Started |
| T-4 | **Environment variables** — all set in Coolify; boot validation passes | 🔴 Critical | Founder | Not Started |
| T-5 | **Database migrations** — `prisma migrate deploy` runs on release | 🔴 Critical | Founder | Not Started |
| T-6 | **Error monitoring** — Sentry (or similar) wired for client + server | 🟡 Important | Founder | Not Started |
| T-7 | **Backups** — automated daily Postgres backup enabled + restore tested once | 🔴 Critical | Founder | Not Started |
| T-8 | Docker image builds and deploys cleanly from `main` | 🔴 Critical | Founder | Not Started |
| T-9 | Stripe webhook URL points to production domain | 🔴 Critical | Founder | Not Started |

---

## 5. Analytics

| # | Item | Priority | Owner | Status |
|---|---|---|---|---|
| A-1 | **PostHog** — installed; capturing pageviews + key events (signup, add client, share portal, create invoice, subscribe) | 🟡 Important | Founder | Not Started |
| A-2 | **Google Analytics** — GA4 on marketing pages | 🟢 Nice-to-have | Founder | Not Started |
| A-3 | **Conversion tracking** — funnel: landing → signup → activation → paid | 🟡 Important | Founder | Not Started |
| A-4 | Activation event defined & tracked (first portal link shared) | 🟡 Important | Founder | Not Started |

> Keep analytics light. **One tool (PostHog) covers product events + funnel.** GA is optional for marketing attribution only.

---

## 6. Launch Readiness (pre-flight QA)

| # | Item | Priority | Owner | Status |
|---|---|---|---|---|
| LR-1 | **Create test agency** — fresh signup end to end | 🔴 Critical | Founder | Not Started |
| LR-2 | **Create test client** | 🔴 Critical | Founder | Not Started |
| LR-3 | **Create test project** — with status + tasks | 🔴 Critical | Founder | Not Started |
| LR-4 | **Test client portal** — open token link in incognito; verify only that client's data shows | 🔴 Critical | Founder | Not Started |
| LR-5 | **Test invoices** — create, line items, total, mark paid; appears in portal | 🟡 Important | Founder | Not Started |
| LR-6 | **Test billing** — real checkout, webhook updates status, trial gating works | 🔴 Critical | Founder | Not Started |
| LR-7 | **Mobile testing** — landing + portal + core app usable on phone | 🔴 Critical | Founder | Not Started |
| LR-8 | **Browser testing** — Chrome, Safari, Firefox, Edge | 🟡 Important | Founder | Not Started |
| LR-9 | **Cross-tenant security check** — second agency cannot see first agency's data | 🔴 Critical | Founder | Not Started |
| LR-10 | **Critical bug review** — no blocking bugs in core flow | 🔴 Critical | Founder | Not Started |

---

## 7. Post-Launch Monitoring

| # | Item | Priority | Owner | Status |
|---|---|---|---|---|
| PM-1 | **Monitor signups** — check PostHog daily | 🔴 Critical | Founder | Not Started |
| PM-2 | **Monitor errors** — Sentry alerts to email/phone | 🔴 Critical | Founder | Not Started |
| PM-3 | **Monitor Stripe events** — watch checkout, payment, webhook failures | 🔴 Critical | Founder | Not Started |
| PM-4 | **Collect user feedback** — reply to every signup personally; ask 1–2 questions | 🔴 Critical | Founder | Not Started |
| PM-5 | Watch activation rate (signups reaching first portal share) | 🟡 Important | Founder | Not Started |
| PM-6 | Daily backup completion check (first week) | 🟡 Important | Founder | Not Started |

---

## 🚀 Launch Day Checklist

| # | Item | Status |
|---|---|---|
| LD-1 | Final smoke test on production (signup → client → portal → invoice → pay) | Not Started |
| LD-2 | Stripe in **live mode**, real payment confirmed + refunded | Not Started |
| LD-3 | Backups confirmed running | Not Started |
| LD-4 | Error monitoring live and alerting | Not Started |
| LD-5 | Landing + pricing pages live over HTTPS | Not Started |
| LD-6 | Publish launch announcement (Twitter/X, LinkedIn, communities) | Not Started |
| LD-7 | Send direct outreach to first 20–30 target agencies | Not Started |
| LD-8 | Be available all day to reply to signups within minutes | Not Started |
| LD-9 | Pin a "got feedback? reply here" message / support channel | Not Started |

---

## 📅 Week 1 Checklist

| # | Item | Status |
|---|---|---|
| W1-1 | Personally onboard every signup (offer a 15-min call) | Not Started |
| W1-2 | Reply to 100% of inbound messages same day | Not Started |
| W1-3 | Daily: check errors, Stripe, signups | Not Started |
| W1-4 | Fix any critical/blocking bug within 24h | Not Started |
| W1-5 | Log every feature request in [POST-LAUNCH.md](../docs/POST-LAUNCH.md) (do NOT build mid-launch) | Not Started |
| W1-6 | Follow up with trial users who haven't activated | Not Started |
| W1-7 | Second wave of direct outreach (next 20–30 agencies) | Not Started |
| W1-8 | Ask first paying customers for a testimonial / quote | Not Started |

---

## 📈 Month 1 Success Metrics

| Metric | Target | Why it matters |
|---|---|---|
| **Paying customers** | **10** | The core launch goal |
| Signups (trials) | 40–60 | ~20% trial→paid conversion gets you to 10 |
| Activation rate | ≥ 50% | % of signups who share a client portal link (the aha moment) |
| Trial → paid conversion | ≥ 20% | Health of the offer + onboarding |
| Week-4 retention | ≥ 80% of payers | Are they actually using it daily? |
| Critical bugs open | 0 | Trust in a money/CRM tool is fragile |
| Time-to-first-response (support) | < 4 hours | Solo founder advantage — outservice incumbents |
| Customer-reported time saved | 5–10 hrs/week | The PRD success metric; validate in feedback calls |

---

### Notes for the solo founder

- **Cut order if behind (per frozen PRD):** drop Invoices → Team → Dashboard. Never cut Auth, Clients, Projects, Portal, Billing, Deploy.
- **Your unfair advantage is response speed.** Reply to every signup personally — incumbents can't. This is how you close the first 10.
- **Do not build new features during launch week.** Every request goes to POST-LAUNCH.md. Scope is frozen.

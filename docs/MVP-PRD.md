# Sarion — Final Product Requirements Document (PRD)

### Status: FROZEN for MVP · One developer · 7-day build · Goal = first 10 paying customers

---

## 0. Strategic Note — Why Agencies, and Why They Won't Build Their Own

Targeting 1–20 person agencies is sound:

1. **Building is not their business — billing clients is.** Every hour spent on internal tooling is an hour not billed at $80–$200/hr. The opportunity cost kills DIY even for dev shops.
2. **Maintenance is the real killer.** Auth, payments, security, bug fixes, client feature requests — a self-built portal becomes a second unpaid product.
3. **Most targets can't build at all.** Marketing, SEO, design, and branding agencies have no engineering capacity — the majority of the ICP.
4. **The market is validated.** HoneyBook, Dubsado, Bonsai, SuiteDash, ClientJoy, Plutio all make real money here.

**Caveat:** It's a crowded, churny, price-sensitive market. The edge must be the **agency-shaped client portal at flat pricing** — not "another PM tool."

---

## 1. Product Summary

Sarion is an agency-shaped CRM + branded client portal. The MVP exists to deliver one moment: **add a client → create a project with visible status → share a branded portal link the client can open → send/track an invoice.** Everything in this PRD serves that loop. Everything else is cut.

**The 4-action activation spine:** Add client → Create project → Share portal link → Create invoice.

---

## 2. Features — MUST be included (in scope)

| # | Feature | Why it's in |
|---|---|---|
| F1 | Email/password auth + single agency workspace | Entry point |
| F2 | Team member invites (flat — owner + members, no granular roles) | Agencies have ≥2 people |
| F3 | Client management (CRUD + notes/activity log) | The "one place" wedge |
| F4 | Projects tied to clients, with status + due date + task checklist | Project visibility pain |
| F5 | **Branded client portal** (shareable link, read-only + comment) | The differentiator |
| F6 | Invoices as records (line items, Paid/Unpaid/Overdue, manual mark-paid) | Highest willingness-to-pay |
| F7 | Dashboard (client count, projects by status, unpaid total, due this week) | "One glance" value proof |
| F8 | Onboarding seed + checklist (demo client, guided first actions) | Protects activation |
| F9 | Subscription billing (Stripe Checkout for *Sarion's own* plans) | Required to take money |

> Stripe appears **only** for collecting Sarion's subscription revenue (F9). It is **not** used for processing the agency's client invoices in MVP — those are manual mark-as-paid records (F6).

---

## 3. Features — MUST NOT be included (frozen out)

- ❌ Payment processing on client invoices (Stripe/ACH on the agency's invoices)
- ❌ Recurring/retainer billing automation
- ❌ Granular roles & permissions
- ❌ Any AI features
- ❌ Mobile app / native apps
- ❌ Third-party integrations (Slack, QuickBooks, Zapier, Google, Zoho)
- ❌ Automation, workflows, triggers
- ❌ Email sequences / follow-up automation / lead pipeline / CRM stages
- ❌ Reporting, analytics, exports
- ❌ Time tracking
- ❌ File storage / uploads / version control
- ❌ Proposals, contracts, e-signatures
- ❌ Multiple workspaces / agencies per account
- ❌ Custom domains for the portal
- ❌ In-app chat / messaging beyond simple portal comments
- ❌ Notifications system beyond transactional auth/invite emails

---

## 4. Prioritization

**CRITICAL (no launch without these):**
F1 Auth + workspace · F3 Client CRUD · F4 Projects + status · F5 Client portal · F9 Stripe subscription billing

**IMPORTANT (strongly want, cut only if days run out):**
F6 Invoices · F7 Dashboard · F8 Onboarding seed · F2 Team invites

**FUTURE (post-launch, do NOT build now):**
Client-invoice payments · recurring billing · integrations · automation · file uploads · reporting · roles · mobile · custom domains · notifications.

> **Cut order under time pressure:** drop **F6 invoices** first, then **F2 team invites** (allow single-user), then **F7 dashboard** (replace with a list view). Never cut F1, F3, F4, F5, F9.

---

## 5. User Roles

| Role | Capabilities |
|---|---|
| **Owner** | Full access; manages billing (F9), invites team, all CRUD |
| **Team Member** | All CRUD on clients/projects/invoices; cannot manage subscription or remove the workspace |
| **Client (portal viewer)** | No login/account. Accesses via tokenized share link. Read-only view of *their* projects + invoices; can leave comments. |

*Two internal roles only. Clients are link-based, not accounts — saves ~1.5 days of auth work.*

---

## 6. Pages Required

**Marketing (minimal):**
1. Landing page (headline, portal demo, pricing, signup CTA)
2. Pricing page (can be a section on landing)

**App (authenticated):**
3. Signup / Login
4. Onboarding checklist
5. Dashboard
6. Clients — list
7. Client — detail (info, notes, projects, invoices)
8. Projects — list
9. Project — detail (status, due date, task checklist)
10. Invoices — list
11. Invoice — create/edit
12. Team / Settings (invite members, agency name + logo for branding)
13. Billing / Subscription (Stripe)

**Public:**
14. Client Portal (tokenized link — projects + invoices + comments for one client)

---

## 7. Database Entities

```
Agency        id, name, logo_url, plan, stripe_customer_id, subscription_status, created_at
User          id, agency_id, name, email, password_hash, role (owner|member), created_at
Client        id, agency_id, name, company, email, phone, notes, portal_token, created_at
Project       id, agency_id, client_id, title, description, status, due_date, created_at
Task          id, project_id, title, is_done, sort_order
Invoice       id, agency_id, client_id, number, status (paid|unpaid|overdue),
              issue_date, due_date, total, created_at
InvoiceItem   id, invoice_id, description, qty, unit_price, line_total
Comment       id, client_id, project_id (nullable), author_name, body, created_at
```

*8 tables. `portal_token` on Client powers the no-login portal. No file/attachment tables.*

---

## 8. API Endpoints

**Auth**
- `POST /auth/signup` · `POST /auth/login` · `POST /auth/logout`

**Agency / Settings**
- `GET /agency` · `PATCH /agency` (name, logo)
- `POST /team/invite` · `GET /team` · `DELETE /team/:userId`

**Clients**
- `GET /clients` · `POST /clients` · `GET /clients/:id` · `PATCH /clients/:id` · `DELETE /clients/:id`

**Projects**
- `GET /projects` · `POST /projects` · `GET /projects/:id` · `PATCH /projects/:id` · `DELETE /projects/:id`
- `POST /projects/:id/tasks` · `PATCH /tasks/:id` · `DELETE /tasks/:id`

**Invoices**
- `GET /invoices` · `POST /invoices` · `GET /invoices/:id` · `PATCH /invoices/:id` (incl. mark paid) · `DELETE /invoices/:id`

**Dashboard**
- `GET /dashboard` (aggregated counts)

**Public Portal (token-auth, no session)**
- `GET /portal/:token` (client's projects + invoices + branding)
- `POST /portal/:token/comments`

**Billing**
- `POST /billing/checkout` (Stripe Checkout session) · `POST /billing/webhook` (Stripe events)

---

## 9. Onboarding Flow

1. **Signup** → email/password → agency auto-created.
2. **Seed data** → one demo client + one demo project + one demo invoice auto-inserted so the app is never empty.
3. **Checklist** (forces the activation spine, dismissible):
   - ☐ Add your first real client
   - ☐ Create a project for them
   - ☐ Add your logo + agency name (branding)
   - ☐ Copy & open your client portal link
   - ☐ Create your first invoice
4. **Aha moment** = owner opens the live portal link and sees their branded client view.
5. **Trial → Paid:** 7- or 14-day trial, then Stripe Checkout. Recommend trial-without-card to maximize signups for the first 10.

---

## 10. 7-Day Build Plan (one developer)

| Day | Deliverable |
|---|---|
| **Day 1** | Project scaffold, DB schema (8 tables), auth (signup/login/logout), agency workspace. |
| **Day 2** | Client CRUD + notes; clients list & detail pages. |
| **Day 3** | Projects CRUD + status + due date + task checklist; project list & detail. |
| **Day 4** | Client portal (tokenized public route, branded layout, read-only projects); agency branding in settings. |
| **Day 5** | Invoices (CRUD, line items, mark paid/unpaid/overdue); invoice surfaced in portal. |
| **Day 6** | Dashboard aggregation; team invites; portal comments; onboarding seed + checklist. |
| **Day 7** | Stripe subscription (Checkout + webhook), landing/pricing page, polish, deploy, smoke test. |

*Buffer rule: if Day 5 slips, push invoices to post-launch and use Day 6–7 for polish + billing. Billing (Day 7) and portal (Day 4) are immovable.*

---

# ✅ FINAL LOCKED MVP LIST

**These 9 features are frozen. Nothing is added until after launch.**

1. **Auth + single agency workspace**
2. **Team member invites** (owner + member, no granular roles)
3. **Client management** — CRUD + notes
4. **Projects** — tied to clients, status, due date, task checklist
5. **Branded client portal** — tokenized share link, read-only + comments
6. **Invoices** — records with line items, Paid/Unpaid/Overdue, manual mark-paid
7. **Dashboard** — clients, projects-by-status, unpaid total, due this week
8. **Onboarding** — demo seed data + activation checklist
9. **Stripe subscription billing** — for Sarion's own plans only

**Locked roles:** Owner · Team Member · Client (link-based viewer)

**Scope is now frozen.** Any new idea between now and launch goes into [POST-LAUNCH.md](POST-LAUNCH.md) — it does not enter the build. The only permitted changes during the 7 days are *cuts* (per the cut-order in §4), never additions.

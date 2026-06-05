# Sarion — MVP Recommendation (Ruthless Edition)

## Phase 6: MVP Recommendation

**Goal:** First 10 paying customers. **Constraint:** One developer, 7 days. **Mandate:** Cut everything that doesn't directly create the "one place to run my agency, and my client can see it" moment.

### The MVP thesis
Your aha moment is exactly three actions: **(1) add a client → (2) create a project with status → (3) share a branded portal link the client can actually open.** Invoicing is the cash hook layered on top as simple records. Build *only* what serves that loop.

### ✅ Build these (and nothing else)

1. **Auth + single workspace** — email/password signup, one agency account, basic team members (invite by email, no granular roles). *(Day 1)*
2. **Client management (CRM core)** — add/edit clients, contact info, notes, and a simple activity/notes log. This is the "one place." *(Day 2)*
3. **Projects with visible status** — projects tied to a client; status field (e.g., Not Started / In Progress / Review / Done); due date; simple task checklist inside. *(Day 3–4)*
4. **Client Portal (the differentiator)** — a shareable, read-only (+ comment) link per client showing their projects, statuses, and invoices. Light branding (agency name + logo). **Do not skip this — it's why they pick you over ClickUp.** *(Day 4–5)*
5. **Invoicing as records** — create an invoice, line items, mark **Paid / Unpaid / Overdue**, and surface unpaid total on the dashboard. **No payment processing, no Stripe integration in v1** — manual "mark as paid." Captures the cash pain without the payments rabbit hole. *(Day 5–6)*
6. **Dashboard** — clients count, projects by status, total unpaid invoices, this-week's due items. The "one glance" value proof. *(Day 6)*
7. **Onboarding seed + import** — auto-create one demo client/project on signup and a dead-simple "add your first client" checklist. **This protects activation and is non-negotiable.** *(Day 7)*

### ❌ Explicitly cut from v1
Payment processing/Stripe checkout · recurring billing · granular roles/permissions · AI anything · mobile app · third-party integrations (Slack/QuickBooks/Zoho) · automation/workflows · email sequences/follow-up automation · reporting/analytics exports · time tracking · file storage/versioning · proposals/contracts · multi-workspace.

> Several of these (Stripe payments, follow-up reminders, file uploads) are your **strongest fast-follow** features — ship them in weeks 2–6 based on what the first 10 customers shout for. But not in the 7-day build.

### The 7-day build sequence
- **Day 1:** Auth, workspace, team invites, schema.
- **Day 2:** Client CRUD + notes.
- **Day 3–4:** Projects + status + tasks.
- **Day 4–5:** Client portal (shareable link + branding).
- **Day 5–6:** Invoice records + unpaid tracking.
- **Day 6:** Dashboard.
- **Day 7:** Onboarding seed, polish, deploy.

### One honest risk flag
Doing *all seven* well in 7 solo days is aggressive. If you slip, **cut invoicing first** (it's the easiest fast-follow) and protect the **client + project + portal + onboarding** core — that quartet alone is a sellable "agency client portal" and is enough to land your first 10 design/dev/marketing customers who are starving for a clean client-facing experience.

---

### Bottom line
Your edge is **not** more features — it's being the only tool *shaped like an agency* with a *client portal built in* at *flat pricing*. Win the activation flow, lead with the portal + invoicing-cash story to Dev-Shop Daniel and Marketing Maya, and ship the ruthless 7-day core. Everything else is fast-follow.

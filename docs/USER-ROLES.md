# Sarion — User Roles Specification

> Final, production-ready role spec for the frozen MVP. **Exactly 3 roles. No granular permissions, no RBAC engine, no enterprise access controls.** Matches [MVP-PRD.md](MVP-PRD.md) §5.

---

## Role Model (the whole system in one paragraph)

Sarion has **two account roles** stored on the `User` model (`owner`, `member`) and **one non-account role** (`Client`) that exists only as a tokenized link. Owners and Members both belong to exactly one Agency and share full access to that agency's working data — the *only* meaningful difference between them is **billing and workspace control**. Clients never log in; they view a single client's data through a unique `portalToken` URL. That's the entire access model — deliberately flat, implementable in a day.

---

## Role 1 — Owner

**Description**
The agency founder / account holder. Created automatically on signup (the first user of an Agency is always the Owner). Has full control of everything in the workspace, including money and team.

**Permissions**
- Full CRUD on Clients, Projects, Tasks, Invoices, Comments
- Manage agency settings (name, logo / branding)
- Invite and remove Team Members
- Manage subscription & billing (Stripe checkout, plan, payment)
- Generate / copy / revoke client portal links
- View the Dashboard

**Restrictions**
- Scoped to **their own agency only** — cannot see any other agency's data.
- Cannot create additional agencies (MVP = one agency per account).

**Allowed pages**
- All `(app)` pages: Dashboard, Clients (+ detail), Projects (+ detail), Invoices (+ new/detail), Settings, **Settings → Billing**, Onboarding
- Public: Landing, Portal (as a viewer of any of their own clients)

**Allowed actions**
- Everything a Team Member can do, **plus**: manage team, manage billing, edit agency branding.

---

## Role 2 — Team Member

**Description**
A staff member invited by the Owner. Does the day-to-day delivery work — manages clients, projects, and invoices — but does not control the business account.

**Permissions**
- Full CRUD on Clients, Projects, Tasks, Invoices, Comments
- Generate / copy client portal links
- View the Dashboard
- View agency settings

**Restrictions**
- **Cannot manage billing / subscription** (no access to Settings → Billing actions).
- **Cannot invite or remove team members.**
- **Cannot delete the agency** or change ownership.
- Scoped to **their own agency only**.

**Allowed pages**
- `(app)`: Dashboard, Clients (+ detail), Projects (+ detail), Invoices (+ new/detail), Settings (read), Onboarding
- **Blocked:** Settings → Billing (write/manage), Team management actions

**Allowed actions**
- Create / edit / delete clients, projects, tasks, invoices.
- Mark invoices paid/unpaid/overdue.
- Share client portal links.
- **Not allowed:** invite/remove teammates, change plan, enter payment details.

---

## Role 3 — Client (Portal Viewer)

**Description**
The agency's customer. **Has no Sarion account and no password.** Accesses a read-only portal for a *single* client record through a unique, unguessable `portalToken` link shared by the agency.

**Permissions**
- View their **own** projects and statuses
- View their **own** invoices and payment status
- Post comments on their projects/portal

**Restrictions**
- **No login, no dashboard, no agency data.** Sees only the one client record the token maps to.
- Cannot view other clients of the same agency.
- Cannot create, edit, or delete projects, invoices, or tasks.
- Cannot see internal notes, team, billing, or any `(app)` page.
- Read-only **except** for posting comments.

**Allowed pages**
- Public only: `portal/[token]`

**Allowed actions**
- Read their projects + invoices.
- Add a comment (with an author name; no account required).

---

## Role Matrix

| Feature / Action | Owner | Team Member | Client |
|---|:---:|:---:|:---:|
| **Dashboard** | ✅ View | ✅ View | ❌ |
| **Clients** — view/create/edit/delete | ✅ | ✅ | ❌ |
| **Client internal notes** | ✅ | ✅ | ❌ |
| **Projects** — view/create/edit/delete | ✅ | ✅ | 👁️ Own (read-only) |
| **Project status** — change | ✅ | ✅ | ❌ |
| **Tasks** — add/toggle/delete | ✅ | ✅ | ❌ |
| **Invoices** — create/edit/delete | ✅ | ✅ | 👁️ Own (read-only) |
| **Invoices** — mark paid/unpaid/overdue | ✅ | ✅ | ❌ |
| **Comments** — post | ✅ | ✅ | ✅ (own portal) |
| **Client portal links** — generate/share/revoke | ✅ | ✅ | ❌ |
| **Branding** (agency name/logo) | ✅ | ❌ | ❌ |
| **Team Management** (invite/remove) | ✅ | ❌ | ❌ |
| **Billing / Subscription** | ✅ | ❌ | ❌ |
| **Agency Settings** | ✅ Edit | 👁️ View | ❌ |
| **Cross-agency data** | ❌ | ❌ | ❌ |

Legend: ✅ full · 👁️ read-only · ❌ no access

> The **only** capability gap between Owner and Team Member is the bottom block: **Branding, Team Management, and Billing are Owner-only.** Everything operational is shared. This keeps enforcement to a single `role === "owner"` check on three surfaces — no permission system required.

---

## Implementation Notes (one developer, one week)

- **Storage:** `User.role` enum = `owner | member`. No permissions table, no policy engine.
- **Owner-only enforcement:** a single server-side guard — `if (user.role !== "owner") deny` — applied to exactly three action groups: team invite/remove, billing actions, branding edit. That's the entire RBAC surface.
- **Client role is not a `User`:** it is a `portalToken` on the `Client` row. No auth records, no sessions for clients.
- **First user = Owner:** set automatically at signup when the Agency is created. Invited users default to `member`.

---

## Security Recommendations

1. **Enforce roles on the server, never the client.** Hiding the "Invite" or "Billing" button in the UI is UX, not security. Every owner-only Server Action must re-check `role === "owner"` server-side.
2. **Tenant scoping is the #1 control.** Every authenticated query must filter by the current user's `agencyId` (via a single `getCurrentAgency()` helper). A missing filter leaks another agency's data — this matters more than the role split.
3. **Portal tokens must be unguessable and revocable.** Use the `portalToken` cuid (already unique). To revoke access, regenerate the token. Never expose `agencyId` or `clientId` in the portal URL — the token is the only key.
4. **Portal is hard-scoped to one client.** The portal query resolves `token → client → that client's projects/invoices only`. It must never accept an id from the URL or return sibling clients' data.
5. **Portal comments: validate and rate-limit.** Comments are the only unauthenticated write. Sanitize input, cap length, and basic rate-limit to prevent spam — clients are anonymous.
6. **Members cannot escalate.** A Team Member must not be able to change their own role, invite an owner, or reach billing endpoints — guard the invite/role mutations Owner-only.
7. **Email is the unique login identity.** One person = one account = one agency in MVP. No shared logins.
8. **Stripe/billing endpoints are Owner-only and webhook-verified.** Checkout and subscription actions check Owner; the Stripe webhook verifies its signature independently of any user role.

---

## Out of Scope (explicitly NOT in MVP)

❌ Granular / custom permissions · ❌ RBAC policy engine · ❌ per-resource ACLs · ❌ multiple owners / ownership transfer · ❌ client accounts with passwords · ❌ multi-agency users · ❌ guest/viewer sub-roles · ❌ audit logs.

These are post-launch considerations — see [POST-LAUNCH.md](POST-LAUNCH.md). Adding any now violates the frozen scope.

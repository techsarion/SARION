# Day 3 Summary

Client Management (F3) — implemented, audited, and verified production-ready.

## Features Completed

- **Create Client** — `/clients/new`, Zod-validated (name required), logs `Client Created`, redirects to detail.
- **View All Clients** — `/clients`, table (Name, Company, Email, Projects count, Created, Actions). Hides archived (`deletedAt: null`).
- **Search Clients** — debounced, URL-driven (`?q=`), matches name / company / email (case-insensitive).
- **Edit Client** — `/clients/[id]/edit`, prefilled form, logs `Client Updated`.
- **Add / Edit Notes** — inline editor on detail page, logs `Note Added`.
- **Archive Client** — soft delete (`deletedAt = now()`) with confirmation dialog, logs `Client Archived`, removed from lists.
- **Activity History** — per-client trail shown newest-first on the detail page.
- **Empty state** — "No clients yet" + CTA when an agency has no clients.

## Routes Added

| Route | Type | Purpose |
|---|---|---|
| `/clients` | Server | List + search + empty state |
| `/clients/new` | Server + form | Create |
| `/clients/[id]` | Server | Detail: info, notes, projects/invoices placeholders, activity |
| `/clients/[id]/edit` | Server + form | Edit |

> Removed the unused scaffold folder `clients/[clientId]/` to avoid a Next.js dynamic-segment conflict with `[id]`.

## Database Changes

- **New migration** `20260612_add_activity` (applied via `prisma migrate deploy`).
- **`Activity` model** — `id, agencyId, clientId, type, description, createdAt`.
  - FKs: `agencyId → Agency` (CASCADE), `clientId → Client` (CASCADE).
  - Indexes: `Activity_agencyId_idx`, `Activity_clientId_createdAt_idx`.
- **`Client` model** — already complete (`id, agencyId, name, company, email, phone, notes, portalToken, createdAt, updatedAt, deletedAt`); no change required.
- Migration history clean: `0_init` → `20260610_schema_hardening` → `20260611_launch_critical` → `20260612_add_activity`.

## Security Decisions

- **Tenant isolation is mandatory and centralized.** `agencyId` comes only from the session via `requireAgency()` (`src/server/auth-context.ts`) — never from user input.
- **Reads** (`src/server/data/clients.ts`) filter `where: { agencyId, deletedAt: null }`. Detail uses `findFirst` scoped by `{ id, agencyId, deletedAt: null }` → `notFound()` otherwise.
- **Writes** (`src/server/actions/clients.ts`) use `updateMany({ where: { id, agencyId, deletedAt: null }})`; a `count === 0` (wrong agency or archived) returns "Client not found" — no cross-tenant write is possible.
- **Atomicity** — every mutation and its activity row are written in a single `$transaction`.
- **Soft delete only** — clients are never hard-deleted; archived rows are excluded from all lists/detail.

## Activity System

- Reusable helper `logActivity({ agencyId, clientId, type, description }, tx?)` in `src/server/activity.ts`.
- Transaction-aware (accepts a `tx` client) so the activity is recorded atomically with its triggering mutation.
- Typed event set: `Client Created`, `Client Updated`, `Note Added`, `Client Archived`.
- Append-only; surfaced newest-first (latest 20) on the client detail page.

## Testing Completed

- `next lint` — 0 warnings, 0 errors.
- `tsc --noEmit` (strict) — clean, no `any`.
- `next build` — succeeds; all 4 client routes compile.
- Live DB structural verification of `Client` + `Activity` (columns, FKs, indexes, cascade).
- `npm run db:seed` — idempotent demo client ("Acme Marketing") created + re-run is a no-op.
- Manual checklist (create/validate/search/edit/notes/archive/cross-tenant 404) per Day 3 deliverables.

## Known Limitations

- **Projects** and **Invoices** sections on the detail page are intentional static placeholders (F4/F5 scope).
- **DB-level RLS** is not yet enforced for the app's connection role; isolation is guaranteed at the application layer (the centralized `agencyId` scoping above). RLS remains a planned defense-in-depth step (see launch migration appendix).
- Search is unpaginated — fine at MVP client volumes; add pagination if a single agency exceeds a few hundred clients.
- Activity is client-scoped only (no global/agency activity feed) — by design for F3.
- One non-blocking build warning: `jose` (pulled in by Better Auth) references a Node API in the Edge middleware bundle; harmless for the cookie-only check.

## Next Feature

**Project Management (F4)** — see [day-4-projects-plan.md](day-4-projects-plan.md). Not started; Day 3 is ready to tag.

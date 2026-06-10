# Day 4 Summary

Project Management (F4) — implemented mirroring F3 Client Management. Production-ready, audited, verified.

## Features Completed

- **Create Project** — `/projects/new`. Zod-validated (name, client, status required). Client dropdown shows only **active clients in the current agency**. Logs `Project Created`, redirects to detail.
- **View Projects** — `/projects`. Table: Name, Client, Status, Due Date, Created, Actions. Hides archived (`deletedAt: null`), newest first.
- **Search** — debounced, URL-driven (`?q=`), matches **project name or client name** (case-insensitive). Same pattern as clients.
- **Project Detail** — `/projects/[id]`. Project Information (Name, Client, Status, Start Date, Due Date, Description) + Activity History (newest first) + "Tasks coming soon" / "Invoices coming soon" placeholders.
- **Edit Project** — `/projects/[id]/edit`. Prefilled form (name, client, status, description, start/due dates). Logs `Project Updated` or `Status Changed`.
- **Archive Project** — soft delete with confirmation dialog (mirrors `archive-client-button`). Logs `Project Archived`, redirects to list.
- **Empty state** — "No projects yet" + CTA; plus an "Add a client first" guard on `/projects/new` when the agency has no clients.

## Routes Added

| Route | Type | Purpose |
|---|---|---|
| `/projects` | Server | List + search + empty state |
| `/projects/new` | Server + form | Create (client-required guard) |
| `/projects/[id]` | Server | Detail: info, activity, Tasks/Invoices placeholders |
| `/projects/[id]/edit` | Server + form | Edit |

> Removed the unused scaffold folder `projects/[projectId]/` (conflicted with `[id]`).

## Database Changes

Migration **`20260613_projects_f4`** (applied via `prisma migrate deploy`; validated against the live DB in a rolled-back transaction first):

- `Project.title` → **renamed to `name`**.
- Added **`Project.startDate`** (`TIMESTAMP(3)`, nullable).
- **`ProjectStatus` enum migrated**: `not_started/in_progress/review/done` → `PLANNED/ACTIVE/COMPLETED/ON_HOLD` (with value mapping; default `PLANNED`). Safe — the table was empty.
- **`Activity.projectId`** added (nullable `TEXT`) + FK to `Project` (CASCADE) + index `(projectId, createdAt)`.
- Existing indexes reused: `Project(agencyId)`, `Project(clientId)`, `Project(agencyId, status)` — the composite already covers status-within-tenant queries, so no new index was needed.

## Security Decisions

- **Tenant isolation centralized**: `agencyId` only ever comes from `requireAgency()` — never from request input.
- **Reads** (`src/server/data/projects.ts`) filter `{ agencyId, deletedAt: null }`; detail uses `findFirst` scoped by `{ id, agencyId, deletedAt: null }` → `notFound()` otherwise.
- **`clientId` is never trusted**: create/update verify the client is active and owned by the session agency (`assertClientOwned`) before writing; invalid client returns a field error.
- **Writes** are agency-guarded: update/archive do a scoped `findFirst` ownership check inside the transaction before mutating; a missing row returns "Project not found".
- **Soft delete only** — no hard deletes; archived projects excluded everywhere.
- Verified live: cross-tenant `getProject` with a foreign `agencyId` returns `null`.

## Activity System Updates

- `Activity` extended with optional `projectId` (smallest clean solution). `clientId` stays NOT NULL and is populated from the project's client, so project activities link to both.
- `logActivity` helper extended with an optional `projectId` and new typed events: `Project Created`, `Project Updated`, `Status Changed`, `Project Archived`.
- All activity writes are **transactional** (atomic with their mutation) and **append-only** — same standard as F3.
- `Status Changed` is logged (instead of `Project Updated`) when an edit changes the status, with a descriptive message.

## Testing Results

- `tsc --noEmit` (strict): **clean**, no `any`.
- `next lint`: **0 warnings / 0 errors**.
- `next build`: **success** — all 4 project routes compile.
- Live smoke test: create + activity ✅, agency-scoped list ✅, cross-tenant blocked ✅, status-change activity ✅, archive hides project ✅.

## Known Limitations

- **Tasks** and **Invoices** on the detail page are intentional placeholders (future features).
- No pagination on the list — fine at MVP volumes; add when an agency exceeds a few hundred projects.
- Client dropdown is unfiltered/unsearchable beyond native select — acceptable for MVP client counts.
- DB-level RLS still not enforced for the app role (isolation guaranteed at the app layer, as in F3); planned defense-in-depth.

## Next

F5 — Invoices (not started). Tasks, team assignment, and kanban boards are explicitly out of scope.

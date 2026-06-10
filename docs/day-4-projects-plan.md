# Day 4 Plan — Project Management (F4)

> **Planning document only. Nothing here is implemented.** It mirrors the F3
> Client Management architecture so F4 stays consistent.

## Scope

Allow an agency owner to create, view, search, edit, and archive **Projects**,
each belonging to a **Client** within the agency. Lean scope — no tasks,
milestones, time tracking, or attachments (those are post-MVP / later features).

## Project Fields

| Field | Type | Notes |
|---|---|---|
| Name | string (required) | Project title |
| Client | relation (required) | Must be an active client in the same agency |
| Status | enum | See statuses below |
| Description | string? | Optional |
| Start Date | date? | Optional |
| Due Date | date? | Optional |

## Statuses

- Planned
- Active
- Completed
- On Hold

> **Schema reconciliation needed (decision for F4 kickoff):** the existing
> `Project` model already has a `ProjectStatus` enum with values
> `not_started, in_progress, review, done` and **no `startDate`**. F4 must
> either (a) migrate the enum to `planned, active, completed, on_hold` and add
> `startDate`, or (b) keep DB values and map to these labels in the UI. Recommend
> (a) — a small, additive migration (add `startDate`; alter enum) following the
> same validated-SQL workflow used in Day 2/3. Do not change scope without
> approval.

## Routes

| Route | Mirrors F3 |
|---|---|
| `/projects` | `/clients` — list + search + empty state |
| `/projects/new` | `/clients/new` — create form |
| `/projects/[id]` | `/clients/[id]` — detail + activity |
| `/projects/[id]/edit` | `/clients/[id]/edit` — edit form |

## Relationships

```
Agency
 └── Clients
       └── Projects   (Project.agencyId AND Project.clientId, both required)
```

- `Project.agencyId` already exists and is indexed (added in launch-critical migration).
- `Project.clientId` already exists with an index.
- Client deletion is `RESTRICT`/soft-delete (Day 2 hardening) — a client with projects cannot be hard-deleted.

## Architecture to reuse (no new patterns)

- **Auth/tenant**: `requireAgency()` for `agencyId` — never trust input.
- **Data layer**: `src/server/data/projects.ts` (`listProjects(agencyId, q)`, `getProject(agencyId, id)`), all scoped by `agencyId`, `deletedAt: null`.
- **Server actions**: `src/server/actions/projects.ts` (`createProject`, `updateProject`, `archiveProject`) — Zod validation, `updateMany` ownership guard, `$transaction` + activity.
- **Activity**: reuse `logActivity` — but note the current `Activity` model is `clientId`-bound. F4 must decide: add a nullable `projectId` to `Activity`, or a separate project activity stream. Recommend adding `projectId String?` to `Activity` (additive migration).
- **UI**: reuse `PageWrapper`, `Card`, `Table`, `Badge` (status), `Dialog` (archive confirm), `sonner` toasts, shared form pattern from `client-form.tsx`.
- **Soft delete + archive confirmation** identical to F3.

## Security requirements (same bar as F3)

Every project read/write scoped by `agencyId`; client selection validated to
belong to the same agency; archive is soft delete only; mutations atomic with
their activity row.

## Out of scope for F4

Tasks, kanban board, assignees/team, time tracking, file uploads, project
templates, client-portal project visibility. Anything new lands in
`POST-LAUNCH.md`, not F4.

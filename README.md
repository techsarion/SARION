# Sarion

> Agency CRM + Client Portal — work smarter, achieve more.

Sarion centralizes clients, projects, and invoices in one premium B2B workspace, and
gives every agency a branded client portal. This repo ships the **Day 2 foundation**:
design system, database, authentication, and a production-ready dashboard shell.

## Tech Stack

- **Next.js** 15 (App Router, Server Components & Server Actions)
- **TypeScript** (strict mode, no `any`)
- **PostgreSQL**
- **Prisma** (ORM + migrations)
- **Better Auth** (email/password, no OAuth)
- **Tailwind CSS**
- **shadcn/ui** (Radix primitives + Lucide icons)

## Setup

### Prerequisites

- Node 20 (`nvm use`)
- npm
- Docker (for local Postgres) — or any reachable PostgreSQL instance

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then set the required values in `.env`:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Session signing secret — `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | App origin (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Public app origin |

### 3. Start the database & apply migrations

```bash
docker compose up -d     # local Postgres on :5432
npm run db:deploy        # applies prisma/migrations (the `init` migration)
# or, for an interactive dev migration cycle:
npm run db:migrate
```

### 4. Run the app

```bash
npm run dev              # http://localhost:3000
```

Visit `/signup` to create an agency + owner account, then land on `/dashboard`.

### Useful scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (runs `prisma generate`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Prisma migrate (dev) |
| `npm run db:deploy` | Prisma migrate (prod / CI) |
| `npm run db:studio` | Prisma Studio |

## Development Workflow

Single Next.js app. UI is composed from a shared design system; data access goes through
Prisma; auth is handled by Better Auth via a catch-all API route and edge middleware.

```
app/                      # Next.js App Router
  (auth)/                 #   public auth pages — /login, /signup (split-screen brand layout)
  (app)/                  #   authenticated shell — sidebar + header, guarded by middleware
    dashboard/            #     dashboard (stats, recent projects, activity)
    clients/ projects/ … #     nav routes
  api/auth/[...all]/      #   Better Auth handler
  layout.tsx globals.css  #   root layout + brand design tokens
components/
  ui/                     # shadcn/ui primitives (button, card, input, badge, dialog, table…)
  layout/                 # sidebar, header, page-wrapper, logo, user-menu
lib/                      # db (Prisma singleton), auth, auth-client, session, utils, env
prisma/                   # schema.prisma + migrations (init)
types/                    # shared app types
docs/                     # product & engineering docs (PRD is frozen)
public/                   # static assets
```

Conventions:

- **TypeScript strict**, no `any`. Prefer Prisma-generated types.
- **Server Components by default**; `"use client"` only for interactivity (forms, menus).
- **Route protection**: `middleware.ts` does a fast cookie check; the `(app)` layout
  re-validates the full session server-side before rendering.
- **Brand**: blue→cyan ribbon gradient exposed as Tailwind tokens (`bg-brand-gradient`,
  `text-brand-gradient`) and CSS variables in `globals.css`.

## Documentation

- [docs/MVP-PRD.md](docs/MVP-PRD.md) — **frozen spec**
- [docs/POST-LAUNCH.md](docs/POST-LAUNCH.md) — future ideas backlog (nothing enters MVP unless approved)
- [docs/architecture.md](docs/architecture.md) · [docs/database.md](docs/database.md) · [docs/deployment.md](docs/deployment.md)

## License

Proprietary — see [LICENSE](LICENSE).

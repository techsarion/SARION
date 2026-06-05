# Sarion

> Agency CRM + Client Portal for small agencies.

## Overview

Sarion is an agency-shaped CRM with a branded client portal. It centralizes clients,
projects, and invoices in one place, and gives each client a professional portal link.
See [docs/MVP-PRD.md](docs/MVP-PRD.md) for the frozen product spec.

## Tech Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · PostgreSQL · Prisma ·
Better Auth · Stripe · Docker / Coolify

## Getting Started

### Prerequisites

- Node 20 (`nvm use`)
- pnpm 9
- Docker (for local Postgres)

### Installation

```bash
git clone https://github.com/<you>/sarion.git && cd sarion
nvm use
pnpm install
```

### Environment

```bash
cp .env.example .env.local
# fill DATABASE_URL, BETTER_AUTH_SECRET (openssl rand -base64 32), Stripe keys
```

### Database

```bash
docker compose up -d     # local Postgres
pnpm db:migrate          # apply migrations
pnpm db:seed             # demo client / project / invoice
```

### Run

```bash
pnpm dev                 # http://localhost:3000
```

## Project Structure

See [docs/architecture.md](docs/architecture.md). Single Next.js app — Server Actions for
CRUD, API routes only for auth, Stripe webhook, and the client portal.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build (runs `prisma generate`) |
| `pnpm start` | Run production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:migrate` | Prisma migrate (dev) |
| `pnpm db:deploy` | Prisma migrate (prod) |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:studio` | Prisma Studio |

## Deployment

See [docs/deployment.md](docs/deployment.md) — Docker image deployed via Coolify on a VPS.

## Documentation

- [docs/ICP.md](docs/ICP.md) — Ideal Customer Profile
- [docs/Customer-Personas.md](docs/Customer-Personas.md)
- [docs/Competitor-Analysis.md](docs/Competitor-Analysis.md)
- [docs/MVP-PRD.md](docs/MVP-PRD.md) — **frozen spec**
- [docs/POST-LAUNCH.md](docs/POST-LAUNCH.md) — backlog
- [docs/architecture.md](docs/architecture.md)
- [docs/database.md](docs/database.md)
- [docs/deployment.md](docs/deployment.md)

## License

Proprietary — see [LICENSE](LICENSE).

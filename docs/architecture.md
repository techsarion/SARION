# Architecture

## Decision: Single Next.js app (monolith)

One Next.js App Router application. No separate backend — Route Handlers + Server Actions
provide backend logic with end-to-end TypeScript types. Justified for a solo founder
shipping in 7 days and scaling to ~100 customers.

## Layers

- **`src/app/`** — routes. Route Groups `(marketing)`, `(auth)`, `(app)` isolate layouts.
  `portal/[token]` is public/token-authed, outside `(app)`.
- **`src/app/api/`** — only auth (Better Auth), Stripe webhook (raw body), and portal JSON.
- **`src/server/`** — server-only logic: `actions/` (mutations), `services/` (domain logic),
  `data/` (read queries). Never imported into client components.
- **`src/lib/`** — infra singletons: `db`, `auth`, `stripe`, validated `env`.
- **`src/config/`** — static config (plans, site metadata).

## Why Server Actions over REST

CRUD (clients/projects/invoices) is consumed only by our own frontend → typed Server
Actions, zero API boilerplate. REST routes reserved for external consumers (Stripe, portal).

## Roles

- **Owner** — full access + billing.
- **Member** — CRUD, no billing/workspace control.
- **Client** — no account; token-based portal link, read-only + comments.

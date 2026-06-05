# Database

PostgreSQL + Prisma. Schema: [../prisma/schema.prisma](../prisma/schema.prisma).

## Entities (8)

| Entity | Purpose |
|---|---|
| `Agency` | Tenant — name, logo, plan, Stripe subscription |
| `User` | Team member (owner / member) |
| `Client` | Agency's client; holds `portalToken` for the public portal |
| `Project` | Belongs to a client; status, due date |
| `Task` | Checklist item inside a project |
| `Invoice` | Record with status (paid/unpaid/overdue) |
| `InvoiceItem` | Line item on an invoice |
| `Comment` | Portal comment on a client/project |

## Conventions

- IDs: `cuid()`. Money: `Decimal(10,2)`. Tenancy: every row scoped by `agencyId`.
- `onDelete: Cascade` from Agency down. Indexes on all foreign keys.

## Commands

```bash
pnpm db:migrate    # dev migration
pnpm db:deploy     # production migration
pnpm db:seed       # demo data
pnpm db:studio     # GUI
```

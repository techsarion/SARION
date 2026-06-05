# Deployment

## Target: Coolify on a VPS

1. **Postgres** — run as a managed Coolify service with automated backups.
2. **App** — Coolify watches `main`, builds the [Dockerfile](../Dockerfile) (`output: standalone`),
   injects env vars, runs `pnpm db:deploy` on release, starts the container on port 3000.
3. **Env vars** — set in Coolify UI, never committed. See [.env.example](../.env.example).
4. **Stripe webhook** — point to `https://app.sarion.app/api/billing/webhook`.
5. **Domain + TLS** — Coolify provisions Let's Encrypt automatically.

## Release checklist

- [ ] Migrations applied (`db:deploy`)
- [ ] Env vars present (boot validation via `src/lib/env.ts`)
- [ ] Stripe webhook verified
- [ ] Smoke test: signup → add client → portal link → create invoice

# Sarion — Launch Readiness Audit

**Product:** Sarion — Agency CRM + Client Portal
**Production URL:** https://sarion.vercel.app/ (intended canonical: https://trysarion.com)
**Audit date:** 2026-06-12
**Auditor scope:** Functional QA · Responsive · Production · Security · SEO · Conversion · Screenshot readiness
**Method:** Static code review of the full `src/` tree, Prisma schema, configs; live HTTP probes of production. The app is behind authentication, so authed flows were verified by reading server actions, data-layer scoping, and route guards rather than by exercising a live session.

---

## 1. Executive Summary

Sarion is a **well-engineered, disciplined codebase** that is genuinely close to launch. Tenant isolation, authorization, and input validation are implemented thoroughly and consistently — the security posture is the strongest part of the product. TypeScript typecheck and ESLint both pass clean. The marketing site is responsive, the copy is honest and benefit-led, and the app UI handles mobile/tablet/desktop correctly in almost all places.

The gaps that hold it back from "Ready" are **not architectural** — they are launch-hygiene items concentrated in three areas:

1. **SEO is largely unimplemented.** No `robots.txt`, no sitemap, no Open Graph / Twitter cards, no `metadataBase`, no canonicals, missing meta descriptions and `<h1>`s on most marketing pages. Both `robots.txt` and `sitemap.xml` return **404 in production** (verified).
2. **The contact form can silently drop high-intent leads.** It is `mailto:`-based; on machines with no configured mail client nothing happens, yet the UI claims success.
3. **Pricing tiers expose no seat/client limits**, so a buyer cannot self-select a plan.

None of these are hard blockers to *flipping the switch*, but #1 and #2 should be fixed before any paid traffic or launch announcement.

**Launch Readiness Score: 78 / 100 — Nearly Ready.**

---

## 2. Functional Issues

The functional core is solid. Every mutating server action calls `requireAgency()` / `requireOwner()`, validates with Zod, scopes writes by `agencyId`, and wraps multi-step writes in transactions with activity logging. Findings below are real but mostly low-severity.

### F-1 — Contact form silently drops leads (High)
- **Where:** [src/components/marketing/contact-form.tsx:50-54](src/components/marketing/contact-form.tsx#L50-L54)
- **Repro:** Open `/contact` on a desktop browser with no OS mail client configured → fill the form → "Send Message". Browser attempts `window.location.href = mailto:` which does nothing; the UI still flips to the "Almost there" success state.
- **Root cause:** Submission relies entirely on the visitor's local mail client. No server-side capture.
- **Fix:** Replace with a server action / API route that emails via Resend (already a dependency) or persists the lead, then render a true success state only on a 2xx. Keep the raw address visible as a fallback.

### F-2 — Stripe webhook `subscription.updated/deleted` depends on `metadata.agencyId` (Medium)
- **Where:** [src/app/api/billing/webhook/route.ts:55-84](src/app/api/billing/webhook/route.ts#L55-L84)
- **Issue:** These handlers `break` (no-op) when `sub.metadata.agencyId` is absent. Checkout sets `subscription_data.metadata` so it's normally present, but subscriptions created/edited outside that flow (Stripe dashboard, future migrations) will silently fail to sync, leaving `subscriptionStatus` stale.
- **Fix:** Fall back to looking up the agency by `stripeCustomerId` / `stripeSubscriptionId` when metadata is missing. Also consider event idempotency (store processed `event.id`).

### F-3 — Password reset has no rate limiting / generic-response guarantee (Low)
- **Where:** [src/lib/auth.ts:33-36](src/lib/auth.ts#L33-L36)
- **Issue:** `sendResetPassword` is wired (good — uses Resend), but there's no app-level throttle on reset requests. Better Auth returns a generic response by default, so enumeration risk is low; abuse/email-bombing is the residual concern.
- **Fix:** Add basic rate limiting on the auth route if not already enforced by the platform.

### F-4 — Empty `/onboarding` route directory (Low / cleanup)
- **Where:** `src/app/(app)/onboarding/.gitkeep` (no `page.tsx`)
- **Issue:** Dead directory; onboarding is actually delivered by `OnboardingCard` on the dashboard. No route is generated (no `page.tsx`) and nothing links to it, so **no 404 risk** — but it's confusing. Same for `src/components/portal/.gitkeep`, `src/components/invoices/.gitkeep` etc. once populated.
- **Fix:** Remove the empty `onboarding` dir.

### Verified working (no issues found)
- **Auth:** signup (with token-gated invite path), login, logout, 7-day session, daily refresh — [src/lib/auth.ts](src/lib/auth.ts). Invite acceptance requires **both** a valid token **and** matching email (defense against email-only attach).
- **Invoice numbering:** atomic `invoiceSequence` increment under a row lock — concurrency-safe, never user-editable — [src/server/services/invoice-number.ts](src/server/services/invoice-number.ts).
- **Invoice calculations:** line totals and grand total rounded to cents via `money()`; Decimal→number conversion at the data boundary — [src/server/actions/invoices.ts:63-86](src/server/actions/invoices.ts#L63-L86).
- **Mark paid/unpaid:** no-op short-circuit when status unchanged; ownership re-checked — [src/server/actions/invoices.ts:257-296](src/server/actions/invoices.ts#L257-L296).
- **Search/archive/edit** for clients, projects, invoices — all agency-scoped soft-deletes.
- **Dashboard metrics:** single parallel batch, SUM aggregate for unpaid total, no N+1 — [src/server/data/dashboard.ts](src/server/data/dashboard.ts).
- **Portal invalid-token handling:** returns `notFound()` → 404 (verified live).

---

## 3. Responsive Issues

The codebase is unusually disciplined about responsiveness — marketing CSS modules all have collapse breakpoints, the app sidebar has a proper mobile drawer, and tables are wrapped in horizontal-scroll containers. **No High-severity breaks found.**

### R-1 — Dialog has no max-height / vertical scroll (Medium)
- **Where:** [src/components/ui/dialog.tsx:36-41](src/components/ui/dialog.tsx#L36-L41)
- **Break:** `DialogContent` is `w-full max-w-lg p-6` centered with `translate-y-[-50%]` but has **no `max-height`**. A tall form dialog on a short viewport (mobile landscape, small phones) overflows above/below the viewport with no way to scroll to the action buttons.
- **Fix:** Add `max-h-[calc(100dvh-2rem)] overflow-y-auto` (and optionally `max-w-[calc(100vw-2rem)]`) to the content className.

### R-2 — Invoice line-item rows stay `grid-cols-12` on mobile (Medium)
- **Where:** [src/components/invoices/invoice-form.tsx:258-318](src/components/invoices/invoice-form.tsx#L258-L318)
- **Break (375–430px):** The total cell (`sm:col-span-1`, 3/12 on mobile) and the remove button (`col-span-1`, ~31px, no responsive override) are too narrow — inputs cramped, trash button hard to tap.
- **Fix:** Stack the row on mobile (`grid-cols-1 sm:grid-cols-12`) or widen the mobile spans: delete → `col-span-2 sm:col-span-1`, total → `col-span-4 sm:col-span-1`.

### R-3 — Minor (Low)
- Footer drops 3→2 columns only at `max-width:480px`; tight between 481–760px — [src/components/marketing/footer.module.css](src/components/marketing/footer.module.css). Add an intermediate breakpoint.
- Portal-demo header has no `flex-wrap` ([portal-demo.module.css:19-26](src/app/(marketing)/portal-demo/portal-demo.module.css#L19-L26)) — can crowd at 375px.

### Verified correct
Sidebar/MobileNav drawer (hamburger, backdrop, ESC, scroll-lock, route-close), all list tables (`overflow-x-auto` wrappers), dashboard card grids (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`), client/project forms (`sm:grid-cols-2` collapse), portal page (`max-w-3xl`), and the entire marketing site (clamp-based hero, hamburger below 860px, collapsing grids).

---

## 4. Production Issues

### P-1 — `robots.txt` and `sitemap.xml` 404 in production (High — see SEO)
- **Verified:** `curl https://sarion.vercel.app/robots.txt` → **404**, `/sitemap.xml` → **404**. Neither `src/app/robots.ts` nor `src/app/sitemap.ts` exists.

### P-2 — `next.config.ts` silently drops the Sentry wrapper (Medium)
- **Where:** [next.config.ts](next.config.ts)
- **Issue:** The file mixes CommonJS and ESM: it assigns `module.exports = withSentryConfig(...)` inside the `if`, but then ends with `export default nextConfig`. Next.js reads the **ESM default export**, so the Sentry-wrapped config (source-map upload, tunneling, release tagging) is **never applied** to the build. Runtime error capture via `sentry.*.config.ts` still works, but build-time instrumentation is lost.
- **Fix:** Use a single export path:
  ```ts
  const config = process.env.SENTRY_AUTH_TOKEN
    ? withSentryConfig(nextConfig, { /* opts */ })
    : nextConfig;
  export default config;
  ```

### P-3 — `siteConfig.url` falls back to `localhost` (Medium)
- **Where:** [src/config/site.ts:4](src/config/site.ts#L4)
- **Issue:** Defaults to `http://localhost:3000` if `NEXT_PUBLIC_APP_URL` is unset. Any URL-deriving metadata (OG, canonical, invite links) would point at localhost in production.
- **Fix:** Set `NEXT_PUBLIC_APP_URL=https://trysarion.com` in Vercel env; decide the canonical host and 301 the `*.vercel.app` domain to it to avoid duplicate-content.

### P-4 — Two live hosts → duplicate content (Medium)
- Both `sarion.vercel.app` and (eventually) `trysarion.com` will serve identical content. Pick one canonical and redirect the other.

### Verified healthy
- Home `200` (~0.7s), `/login` `200`, invalid portal token `404` (all verified live).
- `npx tsc --noEmit` → **clean**. `npx next lint` → **No ESLint warnings or errors**.
- Env validation hard-fails in production on missing required vars — [src/lib/env.ts](src/lib/env.ts). Stripe/Resend degrade gracefully when unconfigured.
- Stripe client is a lazy singleton (no instantiation at build time) — [src/lib/stripe.ts](src/lib/stripe.ts).

---

## 5. Security Findings

**Overall: strong.** Multi-tenant isolation is enforced at the data layer (`server-only` modules that all require and filter by `agencyId`), and every mutation re-checks ownership via scoped `updateMany`/`findFirst` predicates. No IDOR or cross-tenant access path was found.

### Strengths (verified)
- **Tenant isolation at the data boundary:** [clients.ts](src/server/data/clients.ts), [projects.ts](src/server/data/projects.ts), [invoices.ts](src/server/data/invoices.ts), [team.ts](src/server/data/team.ts), [dashboard.ts](src/server/data/dashboard.ts) all filter by `agencyId`. Single-record reads use `findFirst({ where: { id, agencyId, deletedAt: null } })` — a foreign id returns `null`, not another tenant's row.
- **Ownership on writes:** updates/archives use `updateMany({ where: { id, agencyId } })` and treat `count === 0` as not-found, so cross-tenant ids are no-ops. Invoice/project create verify `assertClientOwned()` before trusting the submitted `clientId`.
- **Owner-only enforcement centralized:** `requireOwner()` guards `/team`, `/settings`, `/billing`, and the checkout API. Team actions (`inviteTeamMember`, `cancelInvite`) and `updateAgency` re-check `role === "owner"` server-side — not just in the UI.
- **Invite security:** token-gated. Signup hook requires a valid, unexpired, unaccepted token **and** an email match ([auth.ts:60-80](src/lib/auth.ts#L60-L80)). Cancelling hard-deletes the row, instantly invalidating the link. Invites refresh rather than stack.
- **Portal access:** authenticated purely by the unguessable `portalToken`; everything is resolved *from* the token, and comment posting re-verifies the project belongs to the token's client ([portal.ts](src/server/actions/portal.ts)). Includes a DB-based rate limit (5 comments / 10 min / client).
- **Billing security:** webhook verifies the Stripe signature before processing ([webhook/route.ts:21-26](src/app/api/billing/webhook/route.ts#L21-L26)); checkout is owner-only and creates/reuses a per-agency Stripe customer.
- **Middleware** optimistically gates app routes by session cookie, with full server-side session resolution on every page ([middleware.ts](src/middleware.ts), [auth-context.ts](src/server/auth-context.ts)).

### Recommendations (hardening, not blockers)
- **S-1 (Medium):** Webhook should fall back to `stripeCustomerId` lookup when `metadata.agencyId` is missing, and dedupe by `event.id` for idempotency (see F-2).
- **S-2 (Low):** Add rate limiting to auth endpoints (signup, login, password reset) to blunt credential-stuffing / email-bombing.
- **S-3 (Low):** Portal `logoUrl` is rendered via raw `<img src>` from an owner-supplied URL ([portal/[token]/page.tsx:54-60](src/app/portal/[token]/page.tsx#L54-L60)). It's owner-controlled (low risk) and validated as a URL, but consider restricting to https and known hosts to avoid mixed-content / SSRF-adjacent surprises.

---

## 6. SEO Findings

**SEO Score: 38 / 100.** This is the weakest area and the main thing standing between the marketing site and an effective launch.

### Per-page status
| Page | `metadata` | Title | Description | Canonical | OG/Twitter | `<h1>` |
|------|:--:|------|:--:|:--:|:--:|:--:|
| Home | ❌ (inherits) | layout default | ❌ | ❌ | ❌ | ✅ 1 |
| Features | ✅ | "Features" | ❌ | ❌ | ❌ | ❌ 0 |
| Pricing | ✅ | "Pricing" | ❌ | ❌ | ❌ | ❌ 0 |
| About | ✅ | "About · Sarion" | ✅ | ❌ | ❌ | ✅ 1 |
| Contact | ✅ | "Contact" | ❌ | ❌ | ❌ | ❌ 0 |
| Privacy | ✅ | "Privacy Policy" | ❌ | ❌ | ❌ | ❌ 0 |
| Terms | ✅ | "Terms of Service" | ❌ | ❌ | ❌ | ❌ 0 |
| Portal Demo | ✅ | "Portal Demo" | ❌ | ❌ | ❌ | ❌ 0 |

### Missing site-wide
`metadataBase` · `robots.txt` (404 live) · `sitemap.xml` (404 live) · Open Graph on every page · Twitter cards on every page · JSON-LD structured data · canonicals · page descriptions on 5 pages · `<h1>` on 6 pages · web manifest.

### Bug — root title template strips the brand
[src/app/layout.tsx](src/app/layout.tsx) sets `template: "%s"`, which removes "· Sarion" for any page outside the `(marketing)` group.

### Prioritized fixes

**Critical**
1. Add `metadataBase`, fix the root title template to `"%s · Sarion"`, and add default OG + Twitter metadata in `src/app/layout.tsx`. Create a 1200×630 `public/og.png` (or `src/app/opengraph-image.png`).
2. Add `src/app/robots.ts` (allow `/`, disallow `/dashboard`, `/settings`, `/api/`, reference sitemap).
3. Add `src/app/sitemap.ts` listing the 8 marketing routes.
4. Set `NEXT_PUBLIC_APP_URL=https://trysarion.com` in production and 301 the vercel host to the canonical domain.

**Important**
5. Add page-level `description` + `alternates.canonical` to features, pricing, contact, privacy, terms, portal-demo.
6. Fix `<h1>` hierarchy — give `SectionHeader` a level prop so each page renders exactly one `<h1>` (currently always `<h2>` at [section-header.tsx:22](src/components/marketing/section-header.tsx#L22)).
7. Add Organization / SoftwareApplication JSON-LD in the marketing layout.

**Optional**
8. `src/app/manifest.ts`, a `viewport` export with `themeColor`, and per-page dynamic OG images for pricing/features.

---

## 7. Conversion Findings

The marketing site has an **excellent, honest foundation**: a clear benefit-led headline, disciplined CTA hygiene, real product screenshots, and a deliberate choice to avoid fabricated testimonials pre-launch.

**Headline (H1):** "Run your entire agency from one place."
**Value prop:** "Clients, projects, invoices, a branded client portal, and team collaboration — together in one workspace, so nothing slips through the cracks."
**Primary CTA:** "Start Free Trial" (repeated navbar → hero → sections → pricing) with "14-day free trial · No credit card required" risk-reversal microcopy.

### Issues
- **C-1 (High):** **Pricing tiers list no seat/client limits.** Starter ($29) vs Growth ($59) differ only by "Team Collaboration" + "Priority Support" with no quantities — a buyer can't answer "which plan do I need?" Add concrete seat/client counts per tier (or at minimum seat counts).
- **C-2 (High):** **No external trust signals** (testimonials, logos, ratings, guarantee). The founder note is a reasonable substitute but is the *only* credibility lever and is signed anonymously ("— The Sarion team"). Add a money-back / no-risk line near pricing, a data-security one-liner, and a founder name/face.
- **C-3 (Medium):** **Contact form is mailto-based** — silent lead loss (mirrors F-1).
- **C-4 (Medium):** **Category drift** — "Agency operating system" (hero) vs "Agency CRM + Client Portal" (meta) vs "operating system for independent agencies" (about). Pick one line and repeat it verbatim.
- **C-5 (Medium):** **"Portal Demo" is a top-nav item but points at placeholder data** flagged temporary in `features.ts`. Finish it or demote to a footer link before launch.
- **C-6 (Medium):** **"Book a demo" is promised** (contact + about copy) but no scheduling link exists. Add a real booking link or remove the promise.
- **C-7 (Low):** Monthly-only pricing — add an annual toggle with savings to lift LTV.

---

## 8. Screenshot Recommendations

The seed ([prisma/seed.ts](prisma/seed.ts)) is **too thin for marketing screenshots** — it creates a single client ("Acme Marketing") with no projects or invoices, so the clients/projects/invoices shots can't be honestly populated. The richer demo content lives in `features.ts` `PORTAL_*` constants. Before capturing, **expand the seed** to tell one coherent story:

- **Demo agency (the logged-in workspace brand):** pick a studio-style name distinct from the client — e.g. **"Northbeam Studio"** or **"Lumen Creative"** — so the agency-branding feature reads clearly (agency brand ≠ client name).
- **Best client names:** Acme Marketing, Brightside Co., Meridian Health, Orbit Labs (varied industries read as real traction).
- **Best project names:** "Website Redesign" (Active, due Jun 30), "SEO Campaign" (Active, due Jul 15), "Brand Refresh" (Planned), "Q3 Retainer" (On Hold).
- **Best invoice examples:** INV-0001 **Paid** ($4,500), INV-0002 **Unpaid** ($2,800), INV-0003 **Overdue** (past due date) — note the invoices marketing alt-text promises an *overdue* status that the current demo data lacks, so add one.
- Seed 3–4 clients minimum so list views don't look empty (sparse lists read as "no traction").

---

## 9. Launch Blockers

Must-fix before a public/paid launch:

1. **[High] SEO foundation** — add `robots.ts` + `sitemap.ts` (both 404 live now), `metadataBase`, OG/Twitter defaults, and pin `NEXT_PUBLIC_APP_URL`. (P-1, SEO Critical 1–4)
2. **[High] Contact form lead loss** — replace mailto with a server-side submission. (F-1 / C-3)
3. **[High] Pricing clarity** — add seat/client limits so buyers can self-select. (C-1)
4. **[Medium] Verify the contact mailbox** (`hello@trysarion.com`) is live and monitored. (site.ts TODO)
5. **[Medium] Fix `next.config.ts`** so Sentry actually wraps the build. (P-2)
6. **[Medium] Decide canonical domain** and 301 the other. (P-3 / P-4)

Should-fix (not strictly blocking):
- Dialog max-height + invoice mobile grid (R-1, R-2); webhook metadata fallback + idempotency (F-2/S-1); trust signals + category consistency (C-2/C-4); finish/demote Portal Demo (C-5); expand seed for screenshots (§8).

---

## 10. Final Launch Readiness Score

### **78 / 100 — Nearly Ready**

| Dimension | Score | Notes |
|-----------|:-----:|-------|
| Functional | 90 | Core flows solid; contact form + webhook edge cases |
| Security | 94 | Strong multi-tenant isolation; minor hardening only |
| Responsive | 88 | No high-severity breaks; dialog + invoice grid |
| Production | 80 | Clean build/lint; SEO 404s, config + domain issues |
| SEO | 38 | Largely unimplemented — biggest gap |
| Conversion | 75 | Excellent foundation; pricing limits + trust signals |
| Code quality | 95 | Typecheck + lint clean; consistent, well-commented |

**Verdict: Nearly Ready.** The product is functionally and architecturally launch-grade — security and code quality are excellent. It is held back almost entirely by **launch hygiene**, not engineering: ship the SEO essentials (robots, sitemap, OG, canonical domain), make the contact form actually deliver, and add seat/client limits to pricing. With the six Section 9 blockers addressed — most of them a few hours of work — Sarion moves cleanly to **Ready for Launch**.

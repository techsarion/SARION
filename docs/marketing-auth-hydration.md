# Marketing Navbar — Server-Side Session Hydration

## Goal
Render the correct logged-in / logged-out navbar on the **first byte** so there's
no post-hydration flash, while keeping SEO intact and caching wherever possible.

## What was implemented

1. **Server read** — `src/app/(marketing)/layout.tsx` is now an async server
   component that calls `getSession()` (the shared Better Auth session, React-
   cached per request) and derives `initialUser = { name, email } | null`.
2. **Prop down** — `initialUser` is passed into `<Navbar initialUser=… />`.
3. **Hydration-safe navbar** — `src/components/marketing/navbar.tsx` resolves:
   ```
   user = isPending ? initialUser : (session?.user ?? null)
   ```
   - SSR + first client paint use `initialUser` → **HTML matches first render**
     (no hydration mismatch, no flash).
   - Once `useSession()` resolves it becomes authoritative → a logout in another
     tab correctly clears the now-stale `initialUser`.

## Before → After

| | Before | After |
|---|---|---|
| Marketing routes (`/`, `/features`, `/pricing`, `/about`, `/contact`, `/portal-demo`, `/privacy`, `/terms`) | `○ Static` (prerendered, CDN-cacheable) | `ƒ Dynamic` (server-rendered per request) |
| First paint for a logged-in user | Login / Start Free Trial (**flash**), corrected after `useSession()` fetch (~100–400 ms) | Dashboard + account menu immediately (**no flash**) |
| SEO (HTML completeness) | Full HTML | Full HTML (unchanged) |
| Client JS / First Load JS | 115 kB (`/`) | 115 kB (`/`) — unchanged |
| Hydration mismatch risk | n/a (always logged-out markup) | none (SSR == first client render via `isPending`) |

Build confirmation (`next build`): the eight marketing routes moved from `○` to
`ƒ`. API and app routes were already dynamic; `/login`, `/signup`, legal-free
static assets (`/robots.txt`, `/sitemap.xml`, `/opengraph-image`) remain static.

## Performance impact

**Cost added per marketing request (after):**
- One `getSession()` call → a single indexed Postgres lookup over the pooled
  connection (~5–25 ms typical), React-cached so it runs **once** per request
  even though layout + pages both render.
- Server render of otherwise-static HTML (cheap; these pages are light).
- **Lost:** CDN/edge static HTML caching for marketing routes → TTFB rises by
  roughly the session query + render time, plus any serverless cold-start.

**Unchanged:**
- SEO — crawlers still receive complete server-rendered HTML.
- Client bundle size and hydration cost.
- Dashboard/app routes (already dynamic).

For low-to-moderate marketing traffic this is a non-issue. At high traffic the
loss of static CDN caching is the only meaningful regression — addressed below.

## Recommended production approach

**Shipped (safe default): full dynamic.** Correct, simple, zero experimental
flags, build-verified. Best when marketing traffic is low/moderate or the origin
is close to users.

**Scale upgrade: Partial Prerendering (PPR).** Restores a CDN-cached static
shell while keeping the per-user navbar dynamic — the best of both. Next 15.5
supports incremental PPR (experimental):

```ts
// next.config.ts
experimental: { ppr: "incremental" }
```
```tsx
// src/app/(marketing)/layout.tsx
export const experimental_ppr = true;
// Wrap the auth-dependent navbar in <Suspense> with a logged-out fallback:
<Suspense fallback={<Navbar initialUser={null} />}>
  <NavbarWithSession />   {/* async server component that reads getSession() */}
</Suspense>
```
Result: the static shell (hero, content, footer) is prerendered and CDN-cached;
only the navbar auth slot streams in dynamically. Eliminates the flash AND keeps
caching. Trade: it's an experimental flag — validate before relying on it for the
launch, then adopt.

**Why not a cookie/CSS hint instead?** A non-httpOnly "logged-in" hint cookie
read pre-paint can hide the flash while keeping pages static, but it can't supply
the user's name/initials for the avatar without a follow-up fetch, and it
duplicates auth state outside Better Auth. Server hydration (or PPR) is cleaner.

## Verdict
- Flash: **eliminated.**
- SEO: **preserved.**
- Caching: **preserved for static assets; lost for marketing HTML** under the
  shipped full-dynamic approach — recoverable via PPR when you want it.

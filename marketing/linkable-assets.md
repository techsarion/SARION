# Sarion — Backlink Readiness & Linkable-Asset Roadmap

The marketing site is now technically backlink-ready (clean schema, fast, crawlable). The biggest remaining organic-growth lever is **content that earns links**. None of the below exists yet — this is the prioritized build order. Each is designed to attract links and feed the internal-linking clusters in `keyword-map.md`.

## Tier 1 — Build first (highest link/ROI)

1. **Statistics / industry-insights page** — `/resources/agency-statistics`
   *Linkable asset type:* data round-up. Curate 30–50 cited stats on agency operations, freelancing, client churn, tool sprawl. Stat pages attract passive links from anyone citing a number. Add `Article` + `Dataset` schema.

2. **The complete guide to client portals for agencies** — `/guides/client-portal`
   *Type:* pillar guide (2,000–3,000 words). Targets the `/portal-demo` cluster. Links to `/portal-demo`, `/features`. Add `Article` + `HowTo`/FAQ schema.

3. **How to run a small agency: the operating system** — `/guides/run-an-agency`
   *Type:* pillar guide. Targets the homepage head term. Internal links to all feature/pricing pages.

## Tier 2 — Build next

4. **Free agency tools / templates** — `/resources/templates`
   Invoice templates, client-onboarding checklist, project brief template (downloadable). Highly linkable; captures "free agency templates" queries.

5. **Comparison hub** — `/compare/agency-software-vs-spreadsheets`, `/compare/sarion-vs-generic-crm`
   Expand the homepage comparison block into standalone pages targeting comparison intent. (Honest, capability-level — no disparagement.)

6. **Blog** — `/blog` (App Router segment with `Article` schema + per-post canonical + OG image).
   Ongoing topical authority. Wire into `sitemap.ts` dynamically and add a blog column to the footer.

## Tier 3 — Ongoing

7. **Customer stories / case studies** — once real customers exist. Add `Article` + (genuine) `Review`/`AggregateRating` schema. **Do not fabricate.**
8. **Changelog / "What's new"** — freshness signal + link magnet for power users.
9. **Glossary** — `/glossary/{term}` (client portal, retainer, SOW, …) for long-tail entity capture.

## Implementation notes (when building)

- Add a `/resources` and `/guides` segment under `(marketing)`; reuse `JsonLd` + add an `articleSchema()` builder to `src/lib/seo/schema.ts`.
- Register new routes in `src/app/sitemap.ts` (make blog/guides dynamic from a content source).
- Every guide/resource should link **up** to its pillar page and **across** to 2–3 sibling pages (already-established internal-link pattern).
- Add `BreadcrumbList` to each (the `breadcrumbSchema()` builder already exists).
- Keep `robots.ts` allowing these public paths (current config allows all non-app routes by default).

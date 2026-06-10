# Portal Demo — Notes (Temporary)

> **Status: temporary marketing artifact.** Slated for replacement once the
> Client Portal (F6) ships.

## Purpose

`/portal-demo` exists purely for **marketing and conversion**. It shows a
prospective agency owner what their clients would experience inside Sarion's
client portal, so the "Start Free Trial" CTA feels concrete. It is not the real
product and is not connected to any data.

## Current Implementation

- **Page:** `src/app/(marketing)/portal-demo/page.tsx`
- **Styles:** `src/app/(marketing)/portal-demo/portal-demo.module.css` (CSS Modules)
- **Content/data:** hardcoded placeholder data centralized in
  `src/lib/marketing/features.ts` (`PORTAL_COMPANY`, `PORTAL_PROJECTS`,
  `PORTAL_INVOICES`, `PORTAL_ACTIVITY`).
- **Nature:** fully static — no auth, no database, no real portal token. It
  duplicates the *look* of a portal with mock markup; it does not reuse any real
  portal component (none exist yet).
- Company shown: **Acme Marketing** (matches the seed demo client).

## Future Replacement Plan (after F6 — Client Portal)

When the real Client Portal is built:

1. **Reuse the real portal UI** — render the actual portal components instead of
   the mock markup in this page.
2. **Drive it from sample data** — point the demo at a read-only demo agency /
   seed data (or a fixed sample token) rather than the hardcoded arrays.
3. **Delete the duplicated demo implementation** — remove the bespoke
   `portal-demo.module.css` mock and the `PORTAL_*` exports in
   `src/lib/marketing/features.ts` once they're no longer referenced.
4. **Keep the marketing wrapper** — the surrounding marketing page (intro note +
   bottom "Start Free Trial" CTA) can stay; only the portal body should switch
   to the real component.

## Guardrail

Do not invest further in the mock (no new mock features, no real data wiring
into the mock). Any effort should go into F6, after which this page becomes a
thin marketing shell around the genuine portal UI.

import Script from "next/script";

const AHREFS_KEY = process.env.NEXT_PUBLIC_AHREFS_KEY;

/**
 * Ahrefs Web Analytics. Cookieless, privacy-friendly traffic analytics.
 * Renders only in production AND when NEXT_PUBLIC_AHREFS_KEY is set — so
 * local dev / preview never pollute analytics.
 *
 * The data-key is the value Ahrefs shows on the "Install Web Analytics"
 * screen. Loaded via next/script with `afterInteractive` (the `async`
 * equivalent) so the tag never blocks first paint.
 */
export function AhrefsAnalytics() {
  if (process.env.NODE_ENV !== "production" || !AHREFS_KEY) return null;

  return (
    <Script
      src="https://analytics.ahrefs.com/analytics.js"
      data-key={AHREFS_KEY}
      strategy="afterInteractive"
    />
  );
}

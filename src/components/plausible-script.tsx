import Script from "next/script";

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

/**
 * Plausible Analytics script. Renders only when NEXT_PUBLIC_PLAUSIBLE_DOMAIN
 * is set — safe to include in production layout; silently absent in dev.
 */
export function PlausibleScript() {
  if (!PLAUSIBLE_DOMAIN) return null;

  return (
    <Script
      defer
      data-domain={PLAUSIBLE_DOMAIN}
      src="https://plausible.io/js/script.tagged-events.js"
      strategy="afterInteractive"
    />
  );
}

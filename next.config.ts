import type { NextConfig } from "next";

// Content-Security-Policy compatible with Sarion's existing third parties:
// PostHog, Plausible, Google Analytics, Ahrefs, Sentry ingest, and Lemon Squeezy
// checkout. 'unsafe-inline' is required for Next.js' inline bootstrap and the
// analytics snippets (no nonce pipeline in place); everything else is locked to
// 'self' plus the explicit allowlist below. Resend is server-side only (no CSP
// impact); the Lemon checkout is a top-level navigation (allowed by default) but
// frame-src/form-action are allowlisted defensively.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' https://plausible.io https://www.googletagmanager.com https://*.posthog.com https://analytics.ahrefs.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.posthog.com https://plausible.io https://www.google-analytics.com https://*.ingest.sentry.io https://api.lemonsqueezy.com https://*.ahrefs.com",
  "frame-src 'self' https://*.lemonsqueezy.com",
  "form-action 'self' https://*.lemonsqueezy.com",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  output: "standalone", // optimized for Docker / Coolify deployment
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Only wrap with Sentry when credentials are available (production builds).
// In dev/CI without a SENTRY_AUTH_TOKEN the wrapper is skipped silently.
if (process.env.SENTRY_AUTH_TOKEN) {
  const { withSentryConfig } = require("@sentry/nextjs");
  module.exports = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: true,
    widenClientFileUpload: true,
    disableLogger: true,
    automaticVercelMonitors: false,
  });
} else {
  module.exports = nextConfig;
}

export default nextConfig;

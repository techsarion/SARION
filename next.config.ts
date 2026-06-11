import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // optimized for Docker / Coolify deployment
  reactStrictMode: true,
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

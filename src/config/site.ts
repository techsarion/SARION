export const siteConfig = {
  name: "Sarion",
  description: "Agency CRM + Client Portal for small agencies.",
  // Fall back to the production domain — never localhost. A localhost fallback
  // here would poison metadataBase, canonical, OG and sitemap URLs if the env
  // var were ever missing in a production build.
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://trysarion.com",
  tagline: "Run Your Entire Agency From One Place.",
  // Public contact inbox. Contact-form submissions are sent here.
  // IMPORTANT: point this at a real, monitored mailbox before launch.
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@trysarion.com",
  // Public-facing addresses shown across the marketing site.
  salesEmail: "contact@trysarion.com",
  supportEmail: "support@trysarion.com",
} as const;

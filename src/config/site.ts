export const siteConfig = {
  name: "Sarion",
  description: "Agency CRM + Client Portal for small agencies.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  tagline: "Run Your Entire Agency From One Place.",
  // Public contact inbox. Contact-form submissions are sent here via mailto.
  // IMPORTANT: point this at a real, monitored mailbox before launch.
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@trysarion.com",
} as const;

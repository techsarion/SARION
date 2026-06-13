import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

// Crawl policy: allow public marketing + legal pages; disallow every
// authenticated / token-gated surface so private data never reaches an index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/clients",
          "/projects",
          "/invoices",
          "/team",
          "/settings",
          "/portal/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}

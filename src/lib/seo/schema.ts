/**
 * Structured-data (schema.org JSON-LD) builders. Centralised so every page
 * speaks the same vocabulary and so commercial facts (prices, plan names) are
 * derived from the single source of truth in src/config/plans.ts — the schema
 * can never advertise a price the product doesn't charge.
 */
import { siteConfig } from "@/config/site";
import { PAID_PLAN_LIST, PLANS } from "@/config/plans";

const ORG_ID = `${siteConfig.url}/#organization`;
const SITE_ID = `${siteConfig.url}/#website`;

/** Organization — brand identity. Referenced by other nodes via @id. */
export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/SARION-ICON.png`,
    description: siteConfig.description,
    email: siteConfig.contactEmail,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: siteConfig.salesEmail,
        availableLanguage: ["English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: siteConfig.supportEmail,
        availableLanguage: ["English"],
      },
    ],
  };
}

/** WebSite — sitewide entity; enables name/branding in search. */
export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
  };
}

/**
 * SoftwareApplication with a real AggregateOffer derived from the live plan
 * matrix (lowest paid monthly → highest). Eligible for product/SaaS rich data.
 */
export function softwareApplicationSchema() {
  const monthly = PAID_PLAN_LIST.map((p) => p.pricing.monthly);
  return {
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "CRM",
    operatingSystem: "Web",
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: { "@id": ORG_ID },
    featureList: [
      "Client management (CRM)",
      "Project & task tracking",
      "Invoicing",
      "Branded client portals",
      "Team collaboration",
    ],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: Math.min(...monthly),
      highPrice: Math.max(...monthly),
      offerCount: PAID_PLAN_LIST.length,
      offers: [
        // Include the free tier explicitly so $0 entry is discoverable.
        {
          "@type": "Offer",
          name: `${PLANS.free.name} plan`,
          price: 0,
          priceCurrency: "USD",
        },
        ...PAID_PLAN_LIST.map((p) => ({
          "@type": "Offer",
          name: `${p.name} plan`,
          price: p.pricing.monthly,
          priceCurrency: "USD",
          url: `${siteConfig.url}/pricing`,
        })),
      ],
    },
  };
}

/** FAQPage — from an array of Q/A pairs. Eligible for FAQ rich results. */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** BreadcrumbList — pass ordered [label, path] pairs (paths relative to root). */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

/** Sitewide @graph (Organization + WebSite) for the marketing layout. */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), websiteSchema()],
  };
}

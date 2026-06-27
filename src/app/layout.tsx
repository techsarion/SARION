import type { Metadata } from "next";
import { Inter, Geist, Fraunces } from "next/font/google";

import { siteConfig } from "@/config/site";
import { ThemeProvider } from "@/components/theme-provider";
import { PlausibleScript } from "@/components/plausible-script";
import { GoogleAnalytics } from "@/components/google-analytics";
import { AhrefsAnalytics } from "@/components/ahrefs-analytics";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { ServiceWorkerCleanup } from "@/components/sw-cleanup";
import "./globals.css";

// Body — Inter 400
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// App headings — Geist 700 (dashboard / authenticated product)
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

// Marketing headings — Fraunces, an elegant variable serif with optical sizing.
// Scoped to the marketing theme via --font-serif (see marketing.css); the app
// keeps Geist. The `opsz` axis lets large display headings render with more
// refined, high-contrast letterforms.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · ${siteConfig.tagline}`,
    template: `%s`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} · ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@tech_sarion_",
    creator: "@tech_sarion_",
    title: `${siteConfig.name} · ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  // Sensible default: index everything. Authenticated/auth/portal layouts
  // override this with noindex below.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PlausibleScript />
        <GoogleAnalytics />
        <AhrefsAnalytics />
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${geist.variable} ${fraunces.variable} font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ServiceWorkerCleanup />
          <PostHogProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

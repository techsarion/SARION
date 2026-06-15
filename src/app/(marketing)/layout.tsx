import type { Metadata } from "next";

import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { siteGraph } from "@/lib/seo/schema";
import { getSession } from "@/lib/session";
import "./marketing.css";

export const metadata: Metadata = {
  title: {
    default: "Sarion — Run your agency from one place",
    template: "%s · Sarion",
  },
  description:
    "Client management, projects, invoices, and client portals for agencies. Run your entire agency from one workspace.",
};

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session hydration: read the shared Better Auth session so the
  // navbar renders the correct logged-in/out state on the FIRST byte — no
  // post-hydration flash. Reading the session opts the marketing routes into
  // dynamic rendering; SEO is unaffected (full HTML is still server-rendered).
  // See docs/marketing-auth-hydration.md for the tradeoff analysis.
  const session = await getSession();
  const initialUser = session?.user
    ? { name: session.user.name, email: session.user.email }
    : null;

  return (
    <div className="marketingTheme">
      {/* Sitewide Organization + WebSite structured data (every marketing page). */}
      <JsonLd id="site-graph" data={siteGraph()} />
      <Navbar initialUser={initialUser} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

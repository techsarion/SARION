import type { Metadata } from "next";
import Link from "next/link";

import { HeroSection } from "@/components/marketing/hero-section";
import { FounderNote } from "@/components/marketing/founder-note";
import { SectionHeader } from "@/components/marketing/section-header";
import { FeatureCard } from "@/components/marketing/feature-card";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { ProductShot } from "@/components/marketing/product-shot";
import { CTASection } from "@/components/marketing/cta-section";
import { ScorecardBanner } from "@/components/marketing/scorecard-banner";
import { AboutSection } from "@/components/marketing/about-section";
import { isFoundingOfferOpen } from "@/config/plans";
import { PROBLEM_CARDS, FEATURE_CARDS } from "@/lib/marketing/features";
import { HOME_FAQ } from "@/lib/marketing/faq";
import { HomeFaq } from "@/components/marketing/home-faq";
import { Comparison } from "@/components/marketing/comparison";
import { JsonLd } from "@/components/seo/json-ld";
import { TrackPageView } from "@/components/analytics/track-page-view";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { softwareApplicationSchema, faqSchema } from "@/lib/seo/schema";
import styles from "./home.module.css";

export const metadata: Metadata = {
  // Marketing layout already sets the homepage title/description; pin the
  // canonical to the root so the indexable home URL is unambiguous.
  alternates: { canonical: "/" },
  keywords: [
    "agency management software",
    "client management software for agencies",
    "client portal software",
    "agency CRM",
    "project and invoicing software for agencies",
    "freelancer client management",
  ],
};

// Product structured data (SoftwareApplication with real pricing) + FAQ schema.
// Organization + WebSite are emitted sitewide by the marketing layout.
const SOFTWARE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [softwareApplicationSchema()],
};
const FAQ_SCHEMA = faqSchema(HOME_FAQ);

export default function HomePage() {
  return (
    <>
      <TrackPageView event={ANALYTICS_EVENTS.LandingViewed} />
      <JsonLd id="software-schema" data={SOFTWARE_SCHEMA} />
      <JsonLd id="home-faq-schema" data={FAQ_SCHEMA} />
      <HeroSection />

      {/* Honest credibility — a note from the team, not fake testimonials */}
      <FounderNote />

      {/* B. Problem */}
      <section className="mSection">
        <div className="mContainer">
          <SectionHeader
            eyebrow="The problem"
            title="Running an agency shouldn't mean juggling ten tools"
            description="Most agencies stitch together spreadsheets, inboxes, and chat apps. The result is wasted time and missed details."
          />
          <div className={styles.grid3}>
            {PROBLEM_CARDS.map((p) => (
              <FeatureCard key={p.title} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* B2. Scorecard lead magnet — quantify the pain just named above. */}
      <ScorecardBanner placement="home_problem" />

      {/* C. Capabilities — honest "built for agencies" credibility */}
      <section className="mSection mSectionAlt">
        <div className="mContainer">
          <SectionHeader
            eyebrow="Built for modern agencies"
            title="Everything you need to run client work"
            description="One workspace for the day-to-day of running an agency — no add-ons, no patchwork of tools."
          />
          <div className={styles.grid3}>
            {FEATURE_CARDS.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* D. Real product screenshots */}
      <section className="mSection">
        <div className="mContainer">
          <SectionHeader
            eyebrow="A look inside"
            title="Clear, fast, and a pleasure to use"
          />
          <div className={styles.shots}>
            <ProductShot
              name="portal"
              alt="The branded Sarion client portal showing project updates and a comment thread"
              url="trysarion.com/portal"
            />
            <ProductShot
              name="clients"
              alt="The Sarion clients list with companies, emails, and project counts"
              url="trysarion.com/clients"
            />
            <ProductShot
              name="invoices"
              alt="The Sarion invoices list showing paid, unpaid, and overdue status"
              url="trysarion.com/invoices"
            />
          </div>
        </div>
      </section>

      {/* E. Pricing preview */}
      <section className="mSection">
        <div className="mContainer">
          <SectionHeader
            eyebrow="Pricing"
            title="Simple plans that grow with you"
          />
          <PricingPlans foundingOpen={isFoundingOfferOpen()} />
          <div className={styles.center}>
            <Link href="/pricing" className="mBtn mBtnSecondary mBtnLg">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* E2. Comparison — commercial-comparison intent */}
      <section className="mSection mSectionAlt">
        <div className="mContainer">
          <SectionHeader
            eyebrow="Why Sarion"
            title="One workspace beats a patchwork of tools"
            description="Spreadsheets and a generic CRM can limp along — but neither was built to run agency delivery end to end. Here's how Sarion compares."
          />
          <Comparison />
        </div>
      </section>

      {/* F. About + Team */}
      <AboutSection />

      {/* F2. FAQ — informational intent + FAQ rich results + internal links */}
      <section className="mSection">
        <div className="mContainer">
          <SectionHeader
            eyebrow="FAQ"
            title="Questions agencies ask before switching"
            description="Everything you need to know about running your agency on Sarion."
          />
          <HomeFaq />
        </div>
      </section>

      {/* G. Final CTA */}
      <CTASection
        headline="Run your agency from one place."
        subtext="Start your 14-day free trial today. No credit card required."
      />
    </>
  );
}

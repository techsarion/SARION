import Link from "next/link";

import { HeroSection } from "@/components/marketing/hero-section";
import { FounderNote } from "@/components/marketing/founder-note";
import { SectionHeader } from "@/components/marketing/section-header";
import { FeatureCard } from "@/components/marketing/feature-card";
import { PricingCard } from "@/components/marketing/pricing-card";
import { ProductShot } from "@/components/marketing/product-shot";
import { CTASection } from "@/components/marketing/cta-section";
import { AboutSection } from "@/components/marketing/about-section";
import { PLANS } from "@/lib/marketing/pricing";
import { PROBLEM_CARDS, FEATURE_CARDS } from "@/lib/marketing/features";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <>
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
          <div className={styles.grid3}>
            {PLANS.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
          <div className={styles.center}>
            <Link href="/pricing" className="mBtn mBtnSecondary mBtnLg">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* F. About + Team */}
      <AboutSection />

      {/* G. Final CTA */}
      <CTASection
        headline="Run your agency from one place."
        subtext="Start your 14-day free trial today. No credit card required."
      />
    </>
  );
}

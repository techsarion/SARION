import Link from "next/link";

import { HeroSection } from "@/components/marketing/hero-section";
import { SectionHeader } from "@/components/marketing/section-header";
import { FeatureCard } from "@/components/marketing/feature-card";
import { PricingCard } from "@/components/marketing/pricing-card";
import { ScreenshotPlaceholder } from "@/components/marketing/screenshot-placeholder";
import { CTASection } from "@/components/marketing/cta-section";
import { PLANS } from "@/lib/marketing/pricing";
import {
  PROBLEM_CARDS,
  FEATURE_CARDS,
  HOME_SCREENSHOTS,
} from "@/lib/marketing/features";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <>
      <HeroSection />

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

      {/* C. Features preview */}
      <section className="mSection">
        <div className="mContainer">
          <SectionHeader
            eyebrow="Everything in one place"
            title="One workspace for your whole agency"
          />
          <div className={styles.grid4}>
            {FEATURE_CARDS.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* D. Screenshots */}
      <section className="mSection">
        <div className="mContainer">
          <SectionHeader
            eyebrow="A look inside"
            title="Built to be clear, fast, and a pleasure to use"
          />
          <div className={styles.grid3}>
            {HOME_SCREENSHOTS.map((label) => (
              <ScreenshotPlaceholder key={label} label={label} ratio="tall" />
            ))}
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

      {/* F. Final CTA */}
      <CTASection
        headline="Run your agency from one place."
        subtext="Start your 14-day free trial today. No credit card required."
      />
    </>
  );
}

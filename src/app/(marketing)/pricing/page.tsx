import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { SectionHeader } from "@/components/marketing/section-header";
import { PricingCard } from "@/components/marketing/pricing-card";
import { PLANS, TRIAL_POINTS, PRICING_FAQ } from "@/lib/marketing/pricing";
import styles from "./pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for agencies. Every Sarion plan includes the full workspace — clients, projects, invoices, and client portals. Start with a 14-day free trial.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing · Sarion",
    description:
      "Simple, transparent pricing for agencies. Every plan includes the full Sarion workspace. Start with a 14-day free trial.",
    url: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <>
      <section className="mSectionTight">
        <div className="mContainer">
          <SectionHeader
            as="h1"
            eyebrow="Pricing"
            title="Pricing that scales with your agency"
            description="Every plan includes the full Sarion workspace. Upgrade as your team and client list grow."
          />
          <div className={styles.grid}>
            {PLANS.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="mSectionTight">
        <div className="mContainer">
          <div className={styles.trial}>
            <h2 className={styles.trialTitle}>14-Day Free Trial</h2>
            <ul className={styles.trialList}>
              {TRIAL_POINTS.map((point) => (
                <li key={point} className={styles.trialItem}>
                  <Check className={styles.check} aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mBtn mBtnPrimary mBtnLg">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mSectionTight">
        <div className="mContainer">
          <SectionHeader eyebrow="FAQ" title="Frequently asked questions" />
          <div className={styles.faqGrid}>
            {PRICING_FAQ.map((item) => (
              <div key={item.question} className={styles.faqItem}>
                <p className={styles.faqQuestion}>{item.question}</p>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

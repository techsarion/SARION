import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { SectionHeader } from "@/components/marketing/section-header";
import { PricingCard } from "@/components/marketing/pricing-card";
import { PLANS, TRIAL_POINTS } from "@/lib/marketing/pricing";
import styles from "./pricing.module.css";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <section className="mSectionTight">
        <div className="mContainer">
          <SectionHeader
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
    </>
  );
}

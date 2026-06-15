"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

import {
  MARKETING_PLANS,
  priceFor,
  type MarketingPlan,
} from "@/lib/marketing/pricing";
import type { BillingInterval } from "@/config/plans";
import styles from "./pricing-plans.module.css";

/**
 * Conversion-focused pricing grid with a monthly/yearly toggle and founding
 * messaging. Client component (interactive toggle); all data flows from the
 * central plan config via lib/marketing/pricing.
 */
export function PricingPlans({
  foundingOpen = true,
}: {
  foundingOpen?: boolean;
}) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");

  return (
    <div>
      <div className={styles.toggleRow}>
        <div className={styles.toggle} role="tablist" aria-label="Billing interval">
          {(["monthly", "yearly"] as const).map((opt) => (
            <button
              key={opt}
              role="tab"
              aria-selected={interval === opt}
              onClick={() => setInterval(opt)}
              className={`${styles.toggleBtn} ${
                interval === opt ? styles.toggleBtnActive : ""
              }`}
            >
              {opt === "monthly" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
        <span className={styles.saveHint}>
          {interval === "yearly"
            ? "You're saving 2 months 🎉"
            : "Save 2 months with annual billing"}
        </span>
      </div>

      {foundingOpen && (
        <p className={styles.founding}>
          <Sparkles size={16} aria-hidden />
          Founding pricing — lock in these rates for life. Available during
          launch only.
        </p>
      )}

      <div className={styles.grid}>
        {MARKETING_PLANS.map((plan) => (
          <PlanCard key={plan.tier} plan={plan} interval={interval} />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  interval,
}: {
  plan: MarketingPlan;
  interval: BillingInterval;
}) {
  const price = priceFor(plan, interval);
  const isFree = plan.tier === "free";
  const showSave = interval === "yearly" && plan.yearlySavingMonths > 0;

  return (
    <div className={`${styles.card} ${plan.featured ? styles.cardFeatured : ""}`}>
      {plan.featured && <span className={styles.flag}>Most popular</span>}
      <h3 className={styles.name}>{plan.name}</h3>
      <p className={styles.tagline}>{plan.tagline}</p>

      <div className={styles.priceRow}>
        <span className={styles.price}>${price}</span>
        {!isFree && (
          <span className={styles.period}>
            /{interval === "yearly" ? "yr" : "mo"}
          </span>
        )}
      </div>
      <span className={styles.save}>
        {showSave ? `${plan.yearlySavingMonths} months free` : ""}
      </span>

      <Link
        href="/signup"
        className={`mBtn ${plan.featured ? "mBtnPrimary" : "mBtnSecondary"} ${styles.cta}`}
      >
        {plan.ctaLabel}
      </Link>

      <ul className={styles.features}>
        {plan.features.map((f) => (
          <li key={f} className={styles.feature}>
            <Check className={styles.check} aria-hidden />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

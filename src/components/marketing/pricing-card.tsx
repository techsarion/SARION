import Link from "next/link";
import { Check } from "lucide-react";

import styles from "./pricing-card.module.css";

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  featured?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  featured = false,
  ctaLabel = "Start Free Trial",
  ctaHref = "/signup",
}: PricingCardProps) {
  return (
    <div className={styles.card} data-featured={featured}>
      {featured && <span className={styles.flag}>Most popular</span>}
      <div className={styles.head}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.priceRow}>
        <span className={styles.price}>${price}</span>
        <span className={styles.period}>/month</span>
      </div>
      <Link
        href={ctaHref}
        className={`mBtn ${featured ? "mBtnPrimary" : "mBtnSecondary"}`}
      >
        {ctaLabel}
      </Link>
      <ul className={styles.features}>
        {features.map((feature) => (
          <li key={feature} className={styles.feature}>
            <Check className={styles.check} aria-hidden />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

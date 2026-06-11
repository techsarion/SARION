import Link from "next/link";

import styles from "./cta-section.module.css";

interface CTASectionProps {
  headline: string;
  subtext?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CTASection({
  headline,
  subtext,
  primaryLabel = "Start Free Trial",
  primaryHref = "/signup",
  secondaryLabel = "See How It Works",
  secondaryHref = "/features",
}: CTASectionProps) {
  return (
    <section className="mSection">
      <div className="mContainer">
        <div className={styles.panel}>
          <h2 className={styles.headline}>{headline}</h2>
          {subtext && <p className={styles.subtext}>{subtext}</p>}
          <div className={styles.actions}>
            <Link href={primaryHref} className="mBtn mBtnPrimary mBtnLg">
              {primaryLabel}
            </Link>
            {secondaryLabel && (
              <Link href={secondaryHref} className="mBtn mBtnSecondary mBtnLg">
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

import { ProductShot } from "./product-shot";
import styles from "./hero-section.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={`mContainer ${styles.inner}`}>
        <div className={styles.copy}>
          <span className="mEyebrow">Agency operating system</span>
          <h1 className={styles.headline}>
            Run your entire agency from{" "}
            <em className={styles.accent}>one place</em>.
          </h1>
          <p className={styles.subheadline}>
            Clients, projects, invoices, a branded client portal, and team
            collaboration — together in one workspace, so nothing slips through
            the cracks.
          </p>
          <div className={styles.actions}>
            <Link href="/signup" className="mBtn mBtnPrimary mBtnLg">
              Start Free Trial
            </Link>
            <Link href="/features" className="mBtn mBtnSecondary mBtnLg">
              See How It Works
            </Link>
          </div>
          <p className={styles.note}>
            14-day free trial · No credit card required
          </p>
        </div>

        <div className={styles.visual}>
          <ProductShot
            name="dashboard"
            alt="The Sarion dashboard showing clients, active projects, unpaid totals, and recent activity"
            url="trysarion.com/dashboard"
            priority
            sizes="(max-width: 900px) 100vw, 560px"
          />
        </div>
      </div>
    </section>
  );
}

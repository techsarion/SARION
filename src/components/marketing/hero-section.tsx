import Link from "next/link";

import { ScreenshotPlaceholder } from "./screenshot-placeholder";
import styles from "./hero-section.module.css";

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={`mContainer ${styles.inner}`}>
        <div className={styles.copy}>
          <span className="mEyebrow">Agency operating system</span>
          <h1 className={styles.headline}>
            Client management, projects, invoices, and client portals for
            agencies.
          </h1>
          <p className={styles.subheadline}>
            Stop managing clients across spreadsheets, email, and chat. Run your
            entire agency from one workspace.
          </p>
          <div className={styles.actions}>
            <Link href="/signup" className="mBtn mBtnPrimary mBtnLg">
              Start Free Trial
            </Link>
            <Link href="/contact" className="mBtn mBtnSecondary mBtnLg">
              Book Demo
            </Link>
          </div>
          <p className={styles.note}>
            14-day free trial · No credit card required
          </p>
        </div>

        <div className={styles.visual}>
          <ScreenshotPlaceholder label="Sarion Dashboard" />
        </div>
      </div>
    </section>
  );
}

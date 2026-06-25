import Link from "next/link";
import Image from "next/image";

import {
  PRODUCT_LINKS,
  LEGAL_LINKS,
  COMPANY_LINKS,
} from "@/lib/marketing/navigation";
import { siteConfig } from "@/config/site";
import { SocialLinks } from "./social-links";
import styles from "./footer.module.css";

const COLUMNS: { heading: string; links: typeof PRODUCT_LINKS }[] = [
  { heading: "Product", links: PRODUCT_LINKS },
  { heading: "Company", links: COMPANY_LINKS },
  { heading: "Legal", links: LEGAL_LINKS },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`mContainer ${styles.inner}`}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.brand} aria-label="Sarion home">
            <Image
              src="/light-theme-logo-SARION.png"
              alt="Sarion"
              width={110}
              height={36}
              className={`${styles.logo} ${styles.logoLight}`}
            />
            <Image
              src="/dark-theme-logo-SARION.png"
              alt="Sarion"
              width={95}
              height={36}
              className={`${styles.logo} ${styles.logoDark}`}
            />
          </Link>
          <p className={styles.tagline}>
            Run your entire agency from one workspace.
          </p>
          <div className={styles.contact}>
            <a
              href={`mailto:${siteConfig.salesEmail}`}
              className={styles.contactLink}
            >
              {siteConfig.salesEmail}
            </a>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className={styles.contactLink}
            >
              {siteConfig.supportEmail}
            </a>
          </div>
          <SocialLinks ariaLabel="Sarion on social media" className={styles.social} />
        </div>

        <div className={styles.columns}>
          {COLUMNS.map((col) => (
            <nav key={col.heading} className={styles.column} aria-label={col.heading}>
              <h3 className={styles.heading}>{col.heading}</h3>
              {col.links.map((link) => (
                <Link key={link.label} href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
      </div>

      <div className={`mContainer ${styles.bottom}`}>
        <p className={styles.copy}>© 2026 Sarion. All rights reserved.</p>
        <p className={styles.madeWith}>Built for modern agencies.</p>
      </div>
    </footer>
  );
}

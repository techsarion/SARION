import Link from "next/link";

import { FOOTER_LINKS } from "@/lib/marketing/navigation";
import styles from "./footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`mContainer ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>S</span>
          <span className={styles.brandText}>sarion</span>
        </Link>

        <nav className={styles.links}>
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>

        <p className={styles.copy}>Sarion © 2026</p>
      </div>
    </footer>
  );
}

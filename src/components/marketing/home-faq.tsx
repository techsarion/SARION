import Link from "next/link";

import { HOME_FAQ } from "@/lib/marketing/faq";
import styles from "./home-faq.module.css";

/** Visible homepage FAQ. Paired with FAQPage JSON-LD on the home page. */
export function HomeFaq() {
  return (
    <div className={styles.grid}>
      {HOME_FAQ.map((item) => (
        <div key={item.question} className={styles.item}>
          <p className={styles.question}>{item.question}</p>
          <p className={styles.answer}>{item.answer}</p>
          {item.href && item.hrefLabel && (
            <Link href={item.href} className={styles.link}>
              {item.hrefLabel} →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

import { ImageIcon } from "lucide-react";

import styles from "./screenshot-placeholder.module.css";

interface ScreenshotPlaceholderProps {
  label: string;
  ratio?: "wide" | "tall";
}

/**
 * Realistic browser-chrome mock container standing in for a product screenshot.
 */
export function ScreenshotPlaceholder({
  label,
  ratio = "wide",
}: ScreenshotPlaceholderProps) {
  return (
    <div className={styles.frame} data-ratio={ratio}>
      <div className={styles.chrome}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.url}>app.sarion.com</span>
      </div>
      <div className={styles.body}>
        <ImageIcon className={styles.icon} aria-hidden />
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}

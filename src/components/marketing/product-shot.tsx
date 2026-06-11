import Image from "next/image";

import styles from "./product-shot.module.css";

export type ShotName =
  | "dashboard"
  | "clients"
  | "projects"
  | "invoices"
  | "team"
  | "portal";

interface ProductShotProps {
  name: ShotName;
  /** Accessible description of the screenshot. */
  alt: string;
  /** URL shown in the mock browser chrome. */
  url?: string;
  priority?: boolean;
  sizes?: string;
}

// Real screenshots captured from the running app — see scripts/capture-screenshots.mjs.
const W = 1600;
const H = 1007;

/**
 * Real product screenshot inside a browser-chrome frame. Swaps between the
 * light/dark capture with the active theme so it always matches the page.
 */
export function ProductShot({
  name,
  alt,
  url = "trysarion.com",
  priority,
  sizes = "(max-width: 980px) 100vw, 1100px",
}: ProductShotProps) {
  return (
    <div className={styles.frame}>
      <div className={styles.chrome}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.url}>{url}</span>
      </div>
      <Image
        src={`/screenshots/${name}-light.webp`}
        alt={alt}
        width={W}
        height={H}
        priority={priority}
        sizes={sizes}
        className={`${styles.shot} ${styles.shotLight}`}
      />
      <Image
        src={`/screenshots/${name}-dark.webp`}
        alt={alt}
        width={W}
        height={H}
        priority={priority}
        sizes={sizes}
        className={`${styles.shot} ${styles.shotDark}`}
      />
    </div>
  );
}

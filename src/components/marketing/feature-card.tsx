import type { LucideIcon } from "lucide-react";

import styles from "./feature-card.module.css";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.iconWrap}>
        <Icon className={styles.icon} aria-hidden />
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
}

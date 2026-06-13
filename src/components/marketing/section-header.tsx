import styles from "./section-header.module.css";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  /**
   * Heading level for the title. Use "h1" for the page-lead header (exactly
   * one per page, for SEO); defaults to "h2" for in-page section headers.
   */
  as?: "h1" | "h2";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  as: Heading = "h2",
}: SectionHeaderProps) {
  return (
    <div
      className={styles.header}
      data-align={align}
    >
      {eyebrow && <span className="mEyebrow">{eyebrow}</span>}
      <Heading className={styles.title}>{title}</Heading>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}

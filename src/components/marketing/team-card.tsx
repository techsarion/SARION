import type { TeamMember } from "@/lib/marketing/team";
import styles from "./team-card.module.css";

export function TeamCard({ name, initials, title, bio }: TeamMember) {
  return (
    <div className={styles.card}>
      <div className={styles.avatar} aria-hidden>
        {initials}
      </div>
      <div className={styles.body}>
        <p className={styles.name}>{name}</p>
        <p className={styles.title}>{title}</p>
        <p className={styles.bio}>{bio}</p>
      </div>
    </div>
  );
}

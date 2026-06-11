import Link from "next/link";

import { SectionHeader } from "./section-header";
import { TeamCard } from "./team-card";
import { TEAM } from "@/lib/marketing/team";
import styles from "./about-section.module.css";

export function AboutSection() {
  return (
    <section className="mSection mSectionAlt">
      <div className="mContainer">
        <SectionHeader
          eyebrow="About Sarion"
          title="Built by a small team with one clear goal"
          description="Sarion is an independent software company based in India. We exist to help agencies replace scattered tools and fragmented workflows with a single workspace that actually works."
        />

        <div className={styles.grid}>
          {TEAM.map((member) => (
            <TeamCard key={member.name} {...member} />
          ))}
        </div>

        <div className={styles.footer}>
          <Link href="/about" className="mBtn mBtnSecondary">
            Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeader } from "@/components/marketing/section-header";
import { TeamCard } from "@/components/marketing/team-card";
import { CTASection } from "@/components/marketing/cta-section";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { TEAM } from "@/lib/marketing/team";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About · Sarion",
  description:
    "Sarion is an independent software company building tools to help agencies run more efficiently.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · Sarion",
    description:
      "Sarion is an independent software company building tools to help agencies run more efficiently.",
    url: "/about",
  },
};

const BREADCRUMB_SCHEMA = breadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
]);

const CHALLENGES = [
  {
    title: "Scattered tools",
    body: "Most agencies use a different tool for every task — project management, invoicing, client communication, file sharing. Nothing connects.",
  },
  {
    title: "Fragmented communication",
    body: "Client updates live in inboxes, chat threads, and notes apps. Finding the latest status means digging through multiple places.",
  },
  {
    title: "Manual invoicing",
    body: "Invoices are built in spreadsheets, chased over email, and tracked in yet another tab. The process is slow and error-prone.",
  },
  {
    title: "Poor client visibility",
    body: "Clients have no way to see what's happening with their projects. Agencies spend time on status updates instead of actual work.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd id="about-breadcrumb-schema" data={BREADCRUMB_SCHEMA} />
      {/* Hero */}
      <section className="mSection">
        <div className="mContainer">
          <div className={styles.hero}>
            <span className="mEyebrow">About Sarion</span>
            <h1 className={styles.headline}>
              We build software that helps agencies focus on their work.
            </h1>
            <p className={styles.subheadline}>
              Sarion is an independent software company based in India. We are a
              small founding team building focused, practical tools — not
              all-in-one platforms bloated with features no one asked for.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="mSection mSectionAlt">
        <div className="mContainer">
          <div className={styles.prose}>
            <SectionHeader
              align="left"
              eyebrow="Our Mission"
              title="Simplify how agencies operate"
            />
            <div className={styles.proseBody}>
              <p>
                Agencies do great work for their clients. The internal
                side — tracking projects, sending invoices, keeping clients
                updated, managing the team — is where time gets lost.
              </p>
              <p>
                Our mission is to reduce that friction. Sarion brings clients,
                projects, invoices, and team collaboration into one workspace so
                agencies can spend more time on the work that matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section className="mSection">
        <div className="mContainer">
          <div className={styles.prose}>
            <SectionHeader
              align="left"
              eyebrow="Our Vision"
              title="The operating system for independent agencies"
            />
            <div className={styles.proseBody}>
              <p>
                We want Sarion to become the default workspace for agencies that
                value clarity over complexity. Not the largest platform, not the
                most feature-rich — the most useful one for the kind of agency
                that wants to stay focused and move fast.
              </p>
              <p>
                We are building toward that one step at a time, starting with the
                fundamentals agencies actually need every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Built It */}
      <section className="mSection mSectionAlt">
        <div className="mContainer">
          <SectionHeader
            eyebrow="Why We Built Sarion"
            title="The agency workflow problem is real"
            description="Agencies of every size face the same set of operational challenges. Sarion was built to address them directly."
          />
          <div className={styles.challenges}>
            {CHALLENGES.map((c) => (
              <div key={c.title} className={styles.challengeCard}>
                <h3 className={styles.challengeTitle}>{c.title}</h3>
                <p className={styles.challengeBody}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mSection">
        <div className="mContainer">
          <SectionHeader
            eyebrow="The Team"
            title="Meet the founders"
            description="Sarion is built by a small founding team. We are hands-on and focused on making the product better every day."
          />
          <div className={styles.teamGrid}>
            {TEAM.map((member) => (
              <TeamCard key={member.name} {...member} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mSection mSectionAlt">
        <div className="mContainer">
          <div className={styles.contact}>
            <SectionHeader
              eyebrow="Get in Touch"
              title="Questions or feedback?"
              description="We read every message and reply within 24 hours."
            />
            <div className={styles.contactAction}>
              <Link href="/contact" className="mBtn mBtnPrimary mBtnLg">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        headline="Ready to simplify your agency operations?"
        subtext="Start your 14-day free trial. No credit card required."
      />
    </>
  );
}

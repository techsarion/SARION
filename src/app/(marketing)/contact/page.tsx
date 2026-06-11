import type { Metadata } from "next";

import { SectionHeader } from "@/components/marketing/section-header";
import { ContactForm } from "@/components/marketing/contact-form";
import styles from "./contact.module.css";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="mSectionTight">
      <div className="mContainer">
        <SectionHeader
          eyebrow="Contact"
          title="Talk to the Sarion team"
          description="Tell us about your agency and we'll help you get started — or book a demo. We usually reply within 24 hours."
        />
        <div className={styles.wrap}>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

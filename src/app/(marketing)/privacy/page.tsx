import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { SectionHeader } from "@/components/marketing/section-header";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Sarion collects, uses, and protects your data.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "June 11, 2026";

export default function PrivacyPage() {
  return (
    <section className="mSectionTight">
      <div className="mContainer">
        <div className={styles.wrap}>
          <SectionHeader
            as="h1"
            align="left"
            eyebrow="Legal"
            title="Privacy Policy"
            description="How Sarion collects, uses, and protects information. In plain language."
          />
          <p className={styles.updated}>Last updated: {UPDATED}</p>

          <div className={styles.prose}>
            <section>
              <h2>Overview</h2>
              <p>
                Sarion is a workspace for agencies to manage clients, projects,
                invoices, and a client portal. This policy explains what we
                collect, why, and the choices you have. We aim to collect only
                what we need to run the service.
              </p>
            </section>

            <section>
              <h2>Account data</h2>
              <p>
                When you create an account we collect your name, email address,
                and a securely hashed password. We use this to authenticate you,
                provide the service, and send essential account and billing
                notifications. Billing details are handled by our payment
                processor — we do not store full card numbers.
              </p>
            </section>

            <section>
              <h2>Agency data</h2>
              <p>
                Content you create in Sarion — clients, projects, invoices,
                notes, comments, team members, and agency branding — belongs to
                your agency. We process it solely to provide the service to you.
                We do not sell it or use it for advertising.
              </p>
            </section>

            <section>
              <h2>Client data</h2>
              <p>
                Information you store about your own clients, and content shared
                through the client portal, is processed on your behalf. You are
                the controller of that data; Sarion acts as a processor. You are
                responsible for having the right to store it and for what you
                share through the portal.
              </p>
            </section>

            <section>
              <h2>Cookies</h2>
              <p>
                We use strictly necessary cookies to keep you signed in and to
                remember preferences such as your theme. These are required for
                the app to function and are not used for cross-site tracking.
              </p>
            </section>

            <section>
              <h2>Analytics</h2>
              <p>
                We may use privacy-respecting, aggregated analytics to
                understand how the product is used and to improve it. Where used,
                analytics are limited to operational insight and are not used to
                profile individuals or sold to third parties.
              </p>
            </section>

            <section>
              <h2>Security</h2>
              <p>
                Data is encrypted in transit, passwords are hashed, and access to
                your workspace is scoped to your agency. No system is perfectly
                secure, but we work to protect your data and to limit who can
                access it. If you believe your account has been compromised,
                contact us right away.
              </p>
            </section>

            <section>
              <h2>Data retention &amp; deletion</h2>
              <p>
                We keep your data while your account is active. You can request
                export or deletion of your agency data by contacting us. Some
                records may be retained where required for legal or accounting
                reasons.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Questions about privacy or a data request? Email us at{" "}
                <a href={`mailto:${siteConfig.contactEmail}`}>
                  {siteConfig.contactEmail}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { SectionHeader } from "@/components/marketing/section-header";
import styles from "../legal.module.css";

export const metadata: Metadata = { title: "Terms of Service" };

const UPDATED = "June 11, 2026";

export default function TermsPage() {
  return (
    <section className="mSectionTight">
      <div className="mContainer">
        <div className={styles.wrap}>
          <SectionHeader
            align="left"
            eyebrow="Legal"
            title="Terms of Service"
            description="The agreement between you and Sarion when you use the service. In plain language."
          />
          <p className={styles.updated}>Last updated: {UPDATED}</p>

          <div className={styles.prose}>
            <section>
              <h2>Agreement</h2>
              <p>
                By creating an account or using Sarion, you agree to these terms.
                If you are using Sarion on behalf of an agency, you confirm you
                have authority to accept these terms for that agency.
              </p>
            </section>

            <section>
              <h2>Accounts</h2>
              <p>
                You are responsible for your account, for keeping your login
                secure, and for the activity of team members you invite. Provide
                accurate information and let us know if you spot unauthorized use
                of your account.
              </p>
            </section>

            <section>
              <h2>Subscriptions &amp; billing</h2>
              <p>
                Paid plans are billed monthly per agency. Your free trial does
                not require a card; billing begins when the trial ends if you
                choose a plan. There are no long-term contracts — you can cancel
                anytime and will not be billed for the following period. Fees
                already paid are non-refundable except where required by law.
              </p>
            </section>

            <section>
              <h2>Acceptable use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Break the law or infringe others&apos; rights using Sarion.</li>
                <li>Upload malware or attempt to disrupt or breach the service.</li>
                <li>Reverse-engineer, resell, or abuse the platform.</li>
                <li>Send unlawful, harassing, or deceptive content to clients.</li>
              </ul>
              <p>
                We may suspend accounts that put the service or other users at
                risk.
              </p>
            </section>

            <section>
              <h2>Data ownership</h2>
              <p>
                You own the data you put into Sarion — your agency, client,
                project, and invoice content. We claim no ownership of it. You
                grant us the limited rights needed to host and operate the
                service for you. You can export or request deletion of your data.
              </p>
            </section>

            <section>
              <h2>Availability</h2>
              <p>
                We work to keep Sarion reliable but provide the service &ldquo;as
                is&rdquo; without guarantees of uninterrupted availability. We may
                update, improve, or change features over time.
              </p>
            </section>

            <section>
              <h2>Liability</h2>
              <p>
                To the extent permitted by law, Sarion is not liable for
                indirect or consequential damages, and our total liability is
                limited to the amount you paid us in the 12 months before the
                claim. You are responsible for maintaining your own copies of
                critical data.
              </p>
            </section>

            <section>
              <h2>Termination</h2>
              <p>
                You can cancel at any time from your settings. We may suspend or
                terminate accounts that violate these terms. On termination your
                access ends; you may request an export of your data beforehand.
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                Questions about these terms? Email us at{" "}
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

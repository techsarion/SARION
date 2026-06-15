/**
 * ⚠️ TEMPORARY — Marketing Portal Demo.
 *
 * This page is a hardcoded, static recreation of the client portal experience
 * for marketing/conversion purposes only. It is NOT the real product.
 *
 * Once the Client Portal (F6) ships, replace this with the real portal UI:
 *   - reuse the actual portal components instead of this mock markup
 *   - drive it from sample/seed data (or a read-only demo agency)
 *   - delete this duplicated demo implementation and its content in
 *     src/lib/marketing/features.ts (PORTAL_* exports)
 *
 * See docs/portal-demo-notes.md for the full replacement plan.
 * Do not invest further in this mock — it is throwaway.
 */
import type { Metadata } from "next";
import Link from "next/link";
import {
  FolderKanban,
  FileText,
  Activity as ActivityIcon,
  CheckCircle2,
} from "lucide-react";

import {
  PORTAL_COMPANY,
  PORTAL_PROJECTS as PROJECTS,
  PORTAL_INVOICES as INVOICES,
  PORTAL_ACTIVITY as ACTIVITY,
} from "@/lib/marketing/features";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";
import styles from "./portal-demo.module.css";

export const metadata: Metadata = {
  title: "Portal Demo",
  description:
    "See the Sarion client portal in action — a branded space where your clients track project progress, review work, and stay in the loop.",
  alternates: { canonical: "/portal-demo" },
  keywords: [
    "client portal demo",
    "agency client portal example",
    "branded client portal software",
    "client project tracking portal",
  ],
};

const BREADCRUMB_SCHEMA = breadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Portal Demo", path: "/portal-demo" },
]);

export default function PortalDemoPage() {
  return (
    <>
      <JsonLd id="portal-demo-breadcrumb-schema" data={BREADCRUMB_SCHEMA} />
      <section className="mSectionTight">
        <div className="mContainer">
          {/* SEO page heading — visually hidden so the demo mock leads the
              visual design, but the page still has a single descriptive H1. */}
          <h1 className="sr-only">
            Sarion client portal demo — see what your clients would see
          </h1>
          <div className={styles.demoNote}>
            <span className="mBadge mBadgeInfo">Live demo</span>
            <span>This is an example of what your clients would see.</span>
          </div>

          {/* Portal shell */}
          <div className={styles.portal}>
            <header className={styles.portalHeader}>
              <div className={styles.company}>
                <span className={styles.companyMark}>
                  {PORTAL_COMPANY.charAt(0)}
                </span>
                <div>
                  <p className={styles.companyName}>{PORTAL_COMPANY}</p>
                  <p className={styles.companySub}>Client Portal</p>
                </div>
              </div>
              <span className={styles.poweredBy}>Powered by Sarion</span>
            </header>

            <div className={styles.portalBody}>
              {/* Projects */}
              <section className={styles.panel}>
                <h3 className={styles.panelTitle}>
                  <FolderKanban size={16} /> Projects
                </h3>
                <ul className={styles.list}>
                  {PROJECTS.map((p) => (
                    <li key={p.name} className={styles.listRow}>
                      <div className={styles.rowMain}>
                        <CheckCircle2 size={16} className={styles.rowIcon} />
                        <div>
                          <p className={styles.rowTitle}>{p.name}</p>
                          <p className={styles.rowSub}>Due: {p.due}</p>
                        </div>
                      </div>
                      <span className={`mBadge ${p.badge}`}>{p.status}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Invoices */}
              <section className={styles.panel}>
                <h3 className={styles.panelTitle}>
                  <FileText size={16} /> Invoices
                </h3>
                <ul className={styles.list}>
                  {INVOICES.map((inv) => (
                    <li key={inv.number} className={styles.listRow}>
                      <p className={styles.rowTitle}>{inv.number}</p>
                      <span className={`mBadge ${inv.badge}`}>{inv.status}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Activity */}
              <section className={styles.panel}>
                <h3 className={styles.panelTitle}>
                  <ActivityIcon size={16} /> Recent Activity
                </h3>
                <ul className={styles.activityList}>
                  {ACTIVITY.map((a) => (
                    <li key={a.text} className={styles.activityRow}>
                      <span className={styles.activityDot} />
                      <div>
                        <p className={styles.rowTitle}>{a.text}</p>
                        <p className={styles.rowSub}>{a.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mSectionTight">
        <div className="mContainer">
          <div className={styles.cta}>
            <h2 className={styles.ctaTitle}>
              Want your clients to have this experience?
            </h2>
            <Link href="/signup" className="mBtn mBtnPrimary mBtnLg">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

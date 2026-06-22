import type { Metadata } from "next";

import { AssessmentClient } from "./assessment-client";

export const metadata: Metadata = {
  title: "Agency Operations Scorecard — Assessment",
  description:
    "Answer 12 quick questions to get your agency's Operations Score, revenue leakage, and time lost.",
  alternates: { canonical: "/scorecard/assessment" },
  // Interactive funnel step — keep it out of the index, point crawlers at the landing page.
  robots: { index: false, follow: true },
};

export default function AssessmentPage() {
  return (
    <section className="mSectionTight">
      <div className="mContainer">
        <AssessmentClient />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Gauge, TrendingDown, Clock, MessageSquare } from "lucide-react";

import { SectionHeader } from "@/components/marketing/section-header";
import { JsonLd } from "@/components/seo/json-ld";
import { TrackPageView } from "@/components/analytics/track-page-view";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import { ScoreGauge } from "./_components/score-gauge";
import { HeroPreview } from "./_components/hero-preview";
import styles from "./scorecard.module.css";

export const metadata: Metadata = {
  title: "Free Agency Operations Scorecard",
  description:
    "Score your agency's operations in 3 minutes. See your hidden revenue leakage, the hours you lose every week, and the fixes that close the gap — free, no credit card.",
  alternates: { canonical: "/scorecard" },
  openGraph: {
    title: "Agency Operations Scorecard + Profit Calculator · Sarion",
    description:
      "How much is your scattered agency costing you? Get your Operations Score, revenue leak, and time lost — free.",
    url: "/scorecard",
  },
};

const BENEFITS = [
  {
    icon: Gauge,
    title: "Your Operations Score",
    text: "A 0–100 score across four pillars — client communication, delivery, money, and team ops — with your maturity level.",
  },
  {
    icon: TrendingDown,
    title: "Revenue leakage",
    text: "An estimate of the revenue slipping away each year through late invoices, unbilled work, and slow payments.",
  },
  {
    icon: Clock,
    title: "Time lost",
    text: "The hours your team loses every week to manual admin, status chasing, and context-switching across tools.",
  },
];

const STEPS = [
  { title: "Answer 12 questions", text: "Quick multiple choice about how your agency runs today. Takes about 3 minutes." },
  { title: "See your score instantly", text: "Get your Operations Score, revenue leak, and time lost — calculated live." },
  { title: "Get your action plan", text: "A prioritized set of fixes tied to exactly what's costing you the most." },
];

const FAQS = [
  {
    question: "Is the scorecard really free?",
    answer:
      "Yes — completely free, no credit card. You answer 12 questions and get your score and a personalized report instantly.",
  },
  {
    question: "How accurate are the numbers?",
    answer:
      "The estimates are based on your own answers and revenue band, using conservative industry factors. They're designed to show the scale of the opportunity, not an audited figure — and we show you how each number is calculated.",
  },
  {
    question: "Do I need a Sarion account?",
    answer:
      "No. You can complete the scorecard and see your score without an account. We ask for your email only to unlock the full breakdown and send you the report.",
  },
  {
    question: "What do you do with my data?",
    answer:
      "We use it to generate your report and, if you opt in, to share relevant tips. Your answers are never shared, and the assessment is anonymous until you choose to enter your email.",
  },
];

const BREADCRUMB_SCHEMA = breadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Agency Operations Scorecard", path: "/scorecard" },
]);

export default function ScorecardLandingPage() {
  return (
    <>
      <JsonLd id="scorecard-breadcrumb-schema" data={BREADCRUMB_SCHEMA} />
      <JsonLd id="scorecard-faq-schema" data={faqSchema(FAQS)} />
      <TrackPageView event={ANALYTICS_EVENTS.ScorecardLandingViewed} />

      {/* Hero */}
      <section>
        <div className="mContainer">
          <div className={styles.hero}>
            <div className={styles.heroGrid}>
              {/* Copy */}
              <div className={styles.heroCopy}>
                <span className="mEyebrow">Free · 3 minutes · No card</span>
                <h1 className={styles.heroTitle}>
                  See what your scattered agency is costing you — in 3 minutes.
                </h1>
                <p className={styles.heroSub}>
                  Answer 12 quick questions and get your Operations Score, your estimated revenue
                  leakage, and the hours you lose every week — with a clear plan to fix them.
                </p>
              </div>

              {/* Sample result preview (shows the outcome before asking) */}
              <div className={styles.heroPreview}>
                <HeroPreview />
              </div>

              {/* CTA + trust */}
              <div className={styles.heroCta}>
                <div className={styles.heroActions}>
                  <Link href="/scorecard/assessment" className="mBtn mBtnPrimary mBtnLg">
                    Get my free score →
                  </Link>
                  <Link href="#sample" className="mBtn mBtnGhost mBtnLg">
                    See a sample report ↗
                  </Link>
                </div>
                <p className={styles.trust}>
                  Built for agencies, freelancers &amp; consultants · Takes ~3 min · Free, no card.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mSection mSectionAlt">
        <div className="mContainer">
          <SectionHeader
            eyebrow="What you get"
            title="Three numbers that change how you run your agency"
            description="No fluff — just a clear picture of where time and money are leaking, and what to do about it."
          />
          <div className={styles.grid}>
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <div key={title} className={styles.card}>
                <div className={styles.cardIcon}>
                  <Icon size={20} aria-hidden />
                </div>
                <h3 className={styles.cardTitle}>{title}</h3>
                <p className={styles.cardText}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample report */}
      <section id="sample" className="mSection" style={{ scrollMarginTop: "120px" }}>
        <div className="mContainer">
          <SectionHeader
            eyebrow="Sample report"
            title="This is what lands in your inbox"
            description="A clear score, the money and time you're losing, and a prioritized plan."
          />
          <div className={styles.sample}>
            <div className={styles.sampleGauge}>
              <ScoreGauge score={47} size={180} />
              <p className={styles.cardText} style={{ textAlign: "center", marginTop: 8 }}>
                Maturity: <strong>Firefighting</strong>
              </p>
            </div>
            <div className={styles.sampleStats}>
              <div className={styles.sampleStat}>
                <span>Estimated revenue leakage</span>
                <strong>$12,300 / year</strong>
              </div>
              <div className={styles.sampleStat}>
                <span>Time lost to manual admin</span>
                <strong>8.5 hrs / week</strong>
              </div>
              <div className={styles.sampleStat}>
                <span>Weakest pillar</span>
                <strong>Money &amp; Invoicing</strong>
              </div>
              <div className={styles.sampleStat}>
                <span>Top fix</span>
                <strong>Automated invoicing</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mSection mSectionAlt">
        <div className="mContainer">
          <SectionHeader eyebrow="How it works" title="From chaos to clarity in three steps" />
          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={s.title} className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <p className={styles.cardText}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mSection">
        <div className="mContainer">
          <SectionHeader eyebrow="FAQ" title="Questions, answered" />
          <div className={styles.faq}>
            {FAQS.map((f) => (
              <div key={f.question} className={styles.faqItem}>
                <p className={styles.faqQ}>
                  <MessageSquare
                    size={15}
                    aria-hidden
                    style={{ display: "inline", marginRight: 8, verticalAlign: "-2px", opacity: 0.6 }}
                  />
                  {f.question}
                </p>
                <p className={styles.faqA}>{f.answer}</p>
              </div>
            ))}
          </div>

          <div className={styles.finalCta}>
            <SectionHeader
              title="See what your agency is really costing you"
              description="It's free, takes 3 minutes, and you'll get a clear plan to fix it."
            />
            <Link href="/scorecard/assessment" className="mBtn mBtnPrimary mBtnLg">
              Start the free scorecard →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

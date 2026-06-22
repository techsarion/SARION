/**
 * Agency Operations Scorecard — single source of truth.
 *
 * Everything the lead-magnet needs to render, score, and convert lives here:
 * pillars + weights, the question set (with per-option scoring + financial-impact
 * factors), calibration bands, maturity thresholds, and the recommendation copy
 * that maps a weak answer to the Sarion feature that fixes it.
 *
 * Design rules:
 *   • No scoring constant or copy string is hard-coded anywhere else. The engine
 *     (src/server/services/scorecard.ts) and the UI both read from here.
 *   • Pure data — no imports, no side effects. Safe in every runtime (RSC,
 *     client, edge, scripts) and trivially unit-testable.
 *   • Financial impact is attached to the *option a user can pick*, so the model
 *     stays transparent: revenueFactor = fraction of monthly revenue lost to
 *     that behaviour; weeklyHours = hours/week that behaviour costs.
 */

// ── Pillars ─────────────────────────────────────────────────────────────────

export type PillarKey = "A" | "B" | "C" | "D";

export interface Pillar {
  key: PillarKey;
  name: string;
  /** Weight in the overall score. Must sum to 1 across all pillars. */
  weight: number;
  description: string;
}

/** Money is weighted highest — it's the sharpest pain and the clearest sell. */
export const PILLARS: Record<PillarKey, Pillar> = {
  A: {
    key: "A",
    name: "Client & Communication",
    weight: 0.25,
    description: "How clients reach you, get updates, and self-serve.",
  },
  B: {
    key: "B",
    name: "Projects & Delivery",
    weight: 0.25,
    description: "How work is tracked, shipped, and handed off.",
  },
  C: {
    key: "C",
    name: "Money & Invoicing",
    weight: 0.3,
    description: "How you bill, chase, and get paid.",
  },
  D: {
    key: "D",
    name: "Team & Internal Ops",
    weight: 0.2,
    description: "How your tools and admin scale with the team.",
  },
};

export const PILLAR_ORDER: PillarKey[] = ["A", "B", "C", "D"];

// ── Questions ───────────────────────────────────────────────────────────────

export interface QuestionOption {
  id: string;
  label: string;
  /** 0–10, where 10 = best practice. Drives the pillar/overall score. */
  points: number;
  /** Short reinforcement shown after selecting (gamification micro-feedback). */
  hint?: string;
  /** Fraction of MONTHLY revenue this behaviour leaks (revenue questions). */
  revenueFactor?: number;
  /** Hours/week this behaviour costs the owner (time questions). */
  weeklyHours?: number;
  /** Fires a recommendation when chosen (only on sub-optimal answers). */
  recommends?: RecommendationId;
}

export interface Question {
  id: string;
  pillar: PillarKey;
  prompt: string;
  help?: string;
  options: QuestionOption[];
}

/**
 * 12 questions — deliberately tuned for completion over completeness. Three per
 * pillar (four for Money, the highest-weighted pillar). Option `points` are the
 * scoring signal; `revenueFactor`/`weeklyHours` feed the calculators.
 */
export const QUESTIONS: Question[] = [
  // ── Pillar A — Client & Communication ──
  {
    id: "q1_channels",
    pillar: "A",
    prompt: "Where do most client conversations happen?",
    help: "Think about where status, files, and approvals actually live.",
    options: [
      { id: "portal", label: "A dedicated client portal", points: 10, hint: "Best practice — clients self-serve." },
      { id: "email", label: "Email only", points: 6 },
      { id: "whatsapp", label: "A mix of WhatsApp and email", points: 3, hint: "Context gets lost across threads.", recommends: "client_portal" },
      { id: "scattered", label: "Scattered everywhere", points: 0, hint: "A common, costly leak.", recommends: "client_portal" },
    ],
  },
  {
    id: "q2_status",
    pillar: "A",
    prompt: 'How often do clients ask "what\'s the status?"',
    options: [
      { id: "rarely", label: "Rarely", points: 10, weeklyHours: 0.5 },
      { id: "weekly", label: "Weekly", points: 6, weeklyHours: 1.5 },
      { id: "daily", label: "Daily", points: 2, weeklyHours: 4, hint: "That's hours of avoidable updates.", recommends: "client_portal" },
    ],
  },
  {
    id: "q3_selfserve",
    pillar: "A",
    prompt: "Can clients see project status, files, and invoices without messaging you?",
    options: [
      { id: "yes", label: "Yes — fully self-serve", points: 10 },
      { id: "partial", label: "Partially", points: 5 },
      { id: "no", label: "No", points: 0, recommends: "client_portal" },
    ],
  },

  // ── Pillar B — Projects & Delivery ──
  {
    id: "q4_tracking",
    pillar: "B",
    prompt: "How do you track project progress?",
    options: [
      { id: "one_tool", label: "One project management tool", points: 10 },
      { id: "spreadsheets", label: "Spreadsheets", points: 5, recommends: "projects" },
      { id: "mix", label: "A mix of Notion, Trello, etc.", points: 3, hint: "Scattered tools fragment context.", recommends: "projects" },
      { id: "head", label: "In my head / in chat", points: 0, hint: "Risky as you scale.", recommends: "projects" },
    ],
  },
  {
    id: "q5_deadlines",
    pillar: "B",
    prompt: "How often do projects slip past deadline?",
    options: [
      { id: "low", label: "Less than 10% of the time", points: 10, revenueFactor: 0.005 },
      { id: "mid", label: "10–30% of the time", points: 5, revenueFactor: 0.015, recommends: "projects" },
      { id: "high", label: "More than 30% of the time", points: 1, revenueFactor: 0.03, hint: "Slippage quietly eats margin.", recommends: "projects" },
    ],
  },
  {
    id: "q6_onboarding",
    pillar: "B",
    prompt: "When someone joins a project mid-way, how long to get them up to speed?",
    options: [
      { id: "minutes", label: "Minutes", points: 10, weeklyHours: 0.5 },
      { id: "hours", label: "Hours", points: 5, weeklyHours: 1.5, recommends: "projects" },
      { id: "days", label: "Days", points: 1, weeklyHours: 3, hint: "Context lives in too many places.", recommends: "projects" },
    ],
  },

  // ── Pillar C — Money & Invoicing (highest weight) ──
  {
    id: "q7_invoicing",
    pillar: "C",
    prompt: "How are invoices created?",
    options: [
      { id: "auto", label: "Automatically from project data", points: 10 },
      { id: "template", label: "From a template each time", points: 5, weeklyHours: 1 },
      { id: "manual", label: "Fully manual, from scratch", points: 1, weeklyHours: 2.5, hint: "Manual billing is slow and error-prone.", recommends: "invoicing" },
    ],
  },
  {
    id: "q8_invoice_late",
    pillar: "C",
    prompt: "How often do invoices go out late?",
    options: [
      { id: "rarely", label: "Rarely", points: 10, revenueFactor: 0 },
      { id: "sometimes", label: "Sometimes", points: 5, revenueFactor: 0.02, recommends: "invoicing" },
      { id: "often", label: "Often", points: 1, revenueFactor: 0.045, hint: "Late invoices delay every payment.", recommends: "invoicing" },
    ],
  },
  {
    id: "q9_forget_bill",
    pillar: "C",
    prompt: "Do you ever forget to bill for work you've done?",
    options: [
      { id: "never", label: "Never", points: 10, revenueFactor: 0 },
      { id: "occasionally", label: "Occasionally", points: 4, revenueFactor: 0.03, recommends: "invoicing" },
      { id: "regularly", label: "Regularly", points: 0, revenueFactor: 0.08, hint: "Unbilled work is pure lost revenue.", recommends: "invoicing" },
    ],
  },
  {
    id: "q10_days_to_pay",
    pillar: "C",
    prompt: "On average, how long from invoice sent to paid?",
    options: [
      { id: "d14", label: "Under 14 days", points: 10, revenueFactor: 0.01 },
      { id: "d30", label: "14–30 days", points: 7, revenueFactor: 0.02 },
      { id: "d60", label: "30–60 days", points: 3, revenueFactor: 0.04, recommends: "invoicing" },
      { id: "d60p", label: "60+ days", points: 0, revenueFactor: 0.06, hint: "Cash trapped in receivables.", recommends: "invoicing" },
    ],
  },

  // ── Pillar D — Team & Internal Ops ──
  {
    id: "q11_tools",
    pillar: "D",
    prompt: "How many separate tools does your team touch in a typical week?",
    options: [
      { id: "t12", label: "1–2", points: 10, weeklyHours: 0.5 },
      { id: "t34", label: "3–4", points: 6, weeklyHours: 1.5 },
      { id: "t56", label: "5–6", points: 3, weeklyHours: 3, recommends: "unify" },
      { id: "t7", label: "7 or more", points: 0, weeklyHours: 5, hint: "Every tool is a context switch.", recommends: "unify" },
    ],
  },
  {
    id: "q12_admin",
    pillar: "D",
    prompt: "How much weekly time goes to manual admin (status updates, chasing, copy-paste)?",
    options: [
      { id: "h2", label: "Under 2 hours", points: 10, weeklyHours: 1 },
      { id: "h5", label: "2–5 hours", points: 6, weeklyHours: 3.5 },
      { id: "h10", label: "5–10 hours", points: 3, weeklyHours: 7.5, recommends: "unify" },
      { id: "h10p", label: "10+ hours", points: 0, weeklyHours: 12, hint: "That's a part-time job in admin.", recommends: "unify" },
    ],
  },
];

/** Fast lookup by id (used by the engine + result rendering). */
export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export const TOTAL_QUESTIONS = QUESTIONS.length;

// ── Calibration (drives the £ / time maths) ─────────────────────────────────

export interface RevenueBand {
  id: string;
  label: string;
  /** Representative monthly revenue (whole currency units) used in the maths. */
  monthlyMidpoint: number;
  /** Sensible default blended billable rate per hour for the band. */
  defaultRate: number;
}

/** Currency is USD across the report. */
export const CURRENCY = { code: "USD", symbol: "$", locale: "en-US" } as const;

export const REVENUE_BANDS: RevenueBand[] = [
  { id: "r0", label: "Under $5k / month", monthlyMidpoint: 3000, defaultRate: 45 },
  { id: "r5", label: "$5k–$15k / month", monthlyMidpoint: 10000, defaultRate: 60 },
  { id: "r15", label: "$15k–$40k / month", monthlyMidpoint: 27500, defaultRate: 75 },
  { id: "r40", label: "$40k–$100k / month", monthlyMidpoint: 70000, defaultRate: 95 },
  { id: "r100", label: "$100k+ / month", monthlyMidpoint: 130000, defaultRate: 120 },
];

export const REVENUE_BAND_BY_ID: Record<string, RevenueBand> = Object.fromEntries(
  REVENUE_BANDS.map((b) => [b.id, b]),
);

export interface TeamSizeBand {
  id: string;
  label: string;
}

export const TEAM_SIZES: TeamSizeBand[] = [
  { id: "solo", label: "Just me" },
  { id: "small", label: "2–5 people" },
  { id: "mid", label: "6–15 people" },
  { id: "large", label: "16+ people" },
];

export const TEAM_SIZE_BY_ID: Record<string, TeamSizeBand> = Object.fromEntries(
  TEAM_SIZES.map((t) => [t.id, t]),
);

/** Weeks per month used to annualize/monthly-ize the weekly time loss. */
export const WEEKS_PER_MONTH = 4.33;

// ── Maturity levels ─────────────────────────────────────────────────────────

export interface MaturityDefinition {
  /** Matches the Prisma `MaturityLevel` enum value. */
  level: "FIREFIGHTING" | "STITCHED" | "COORDINATED" | "OPERATING_SYSTEM";
  label: string;
  /** Inclusive lower bound of the overall score band. */
  min: number;
  max: number;
  headline: string;
  /** Tone of the conversion CTA at this level. */
  ctaTone: "rescue" | "improve" | "optimize" | "maintain";
}

export const MATURITY_LEVELS: MaturityDefinition[] = [
  {
    level: "FIREFIGHTING",
    label: "Firefighting",
    min: 0,
    max: 39,
    headline:
      "You're running the agency from your inbox and chat. Every week leaks hours and money.",
    ctaTone: "rescue",
  },
  {
    level: "STITCHED",
    label: "Stitched-Together",
    min: 40,
    max: 59,
    headline: "You've got tools, but they don't talk. Too much context lives in your head.",
    ctaTone: "improve",
  },
  {
    level: "COORDINATED",
    label: "Coordinated",
    min: 60,
    max: 79,
    headline: "Solid foundation. A few systems away from real leverage.",
    ctaTone: "optimize",
  },
  {
    level: "OPERATING_SYSTEM",
    label: "Operating System",
    min: 80,
    max: 100,
    headline: "You run a tight ship. Sarion keeps it that way as you scale.",
    ctaTone: "maintain",
  },
];

// ── Recommendations ─────────────────────────────────────────────────────────

export type RecommendationId =
  | "client_portal"
  | "projects"
  | "invoicing"
  | "unify";

export interface RecommendationDefinition {
  id: RecommendationId;
  pillar: PillarKey;
  /** What's going wrong, in the owner's language. */
  problem: string;
  /** How Sarion closes the gap. */
  fix: string;
  /** Feature name + where to send them. */
  feature: string;
  href: string;
  /** Onboarding step to surface first if this is the weakest area (Phase 11). */
  onboardingFocus: "portal" | "projects" | "invoicing" | "workspace";
}

export const RECOMMENDATIONS: Record<RecommendationId, RecommendationDefinition> = {
  client_portal: {
    id: "client_portal",
    pillar: "A",
    problem:
      "Client updates are scattered across chat and email, so you spend hours answering “what’s the status?” and context gets lost.",
    fix: "Give every client a branded portal where they see project status, files, and invoices — and stop chasing you for updates.",
    feature: "Client Portal",
    href: "/features#portal",
    onboardingFocus: "portal",
  },
  projects: {
    id: "projects",
    pillar: "B",
    problem:
      "Project status lives across spreadsheets, Notion, Trello, and your head — so work slips and handoffs are slow.",
    fix: "Track every project in one place with clear status and ownership, so nothing slips and anyone can get context in minutes.",
    feature: "Project Management",
    href: "/features#projects",
    onboardingFocus: "projects",
  },
  invoicing: {
    id: "invoicing",
    pillar: "C",
    problem:
      "Invoicing is manual and late, work goes unbilled, and payments drag — leaking real revenue every month.",
    fix: "Generate invoices straight from project data, send them on time, and track what's owed so nothing slips through.",
    feature: "Invoicing",
    href: "/features#invoicing",
    onboardingFocus: "invoicing",
  },
  unify: {
    id: "unify",
    pillar: "D",
    problem:
      "Your team juggles too many disconnected tools, burning hours on manual admin and context-switching.",
    fix: "Run clients, projects, invoices, and the team from one operating system — fewer tools, far less admin.",
    feature: "One unified workspace",
    href: "/features",
    onboardingFocus: "workspace",
  },
};

// ── Derived guards (cheap correctness checks, tree-shaken in prod) ───────────

if (process.env.NODE_ENV !== "production") {
  const weightSum = PILLAR_ORDER.reduce((s, k) => s + PILLARS[k].weight, 0);
  if (Math.abs(weightSum - 1) > 1e-9) {
    console.warn(`[scorecard] pillar weights sum to ${weightSum}, expected 1.`);
  }
}

/**
 * Marketing content data: problem cards, feature cards, screenshots, the
 * Features-page sections, and the (temporary) Portal Demo content.
 * Pages import from here so copy changes never require editing components.
 *
 * NOTE: The portal demo data below is placeholder content for the marketing
 * `/portal-demo` page only. See docs/portal-demo-notes.md — it should be
 * replaced by the real Client Portal UI once F6 ships.
 */
import {
  Users,
  FolderKanban,
  Globe,
  FileText,
  SearchX,
  BellRing,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export interface IconCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

// Home — B. Problem section
export const PROBLEM_CARDS: IconCard[] = [
  {
    icon: SearchX,
    title: "Client information everywhere",
    description: "Finding notes, files, and conversations wastes time.",
  },
  {
    icon: BellRing,
    title: "Clients constantly ask for updates",
    description: "Status requests create unnecessary work.",
  },
  {
    icon: CreditCard,
    title: "Invoices fall through the cracks",
    description: "Tracking payments manually causes delays.",
  },
];

// Home — C. Features preview
export const FEATURE_CARDS: IconCard[] = [
  {
    icon: Users,
    title: "Client Management",
    description:
      "Keep every client's details, notes, and history in one organized place.",
  },
  {
    icon: FolderKanban,
    title: "Project Tracking",
    description:
      "Track status, due dates, and progress across all your engagements.",
  },
  {
    icon: Globe,
    title: "Client Portal",
    description:
      "Give clients a branded space to see progress without the back-and-forth.",
  },
  {
    icon: FileText,
    title: "Invoicing",
    description:
      "See what's paid, unpaid, and overdue so nothing slips through.",
  },
];

// Home — D. Screenshots section
export const HOME_SCREENSHOTS: string[] = [
  "Clients Dashboard",
  "Projects Dashboard",
  "Client Portal",
];

// Features page — alternating sections
export interface FeatureSection {
  eyebrow: string;
  title: string;
  features: string[];
  screenshot: string;
}

export const FEATURE_SECTIONS: FeatureSection[] = [
  {
    eyebrow: "Client Management",
    title: "Every client, fully organized",
    features: ["Client records", "Notes", "Activity history", "Search"],
    screenshot: "Client Records",
  },
  {
    eyebrow: "Project Management",
    title: "Keep work moving forward",
    features: ["Status tracking", "Due dates", "Task checklists"],
    screenshot: "Project Board",
  },
  {
    eyebrow: "Client Portal",
    title: "A branded space for your clients",
    features: [
      "Branded portal",
      "Comments",
      "Progress visibility",
      "Shareable access",
    ],
    screenshot: "Client Portal",
  },
  {
    eyebrow: "Invoices",
    title: "Never lose track of a payment",
    features: ["Paid", "Unpaid", "Overdue"],
    screenshot: "Invoices",
  },
  {
    eyebrow: "Team Collaboration",
    title: "Work together, cleanly",
    features: ["Owner access", "Team member access", "Shared workflows"],
    screenshot: "Team Settings",
  },
];

// ---------------------------------------------------------------------------
// Portal Demo content — TEMPORARY placeholder data (marketing only).
// Replace with the real Client Portal (F6) data/UI when available.
// See docs/portal-demo-notes.md.
// ---------------------------------------------------------------------------
export type BadgeVariant = "mBadgeInfo" | "mBadgeSuccess" | "mBadgeWarning";

export interface PortalProject {
  name: string;
  status: string;
  badge: BadgeVariant;
  due: string;
}

export interface PortalInvoice {
  number: string;
  status: string;
  badge: BadgeVariant;
}

export interface PortalActivity {
  text: string;
  time: string;
}

export const PORTAL_COMPANY = "Acme Marketing";

export const PORTAL_PROJECTS: PortalProject[] = [
  { name: "Website Redesign", status: "In Progress", badge: "mBadgeInfo", due: "June 30" },
  { name: "SEO Campaign", status: "Active", badge: "mBadgeSuccess", due: "July 15" },
];

export const PORTAL_INVOICES: PortalInvoice[] = [
  { number: "INV-001", status: "Paid", badge: "mBadgeSuccess" },
  { number: "INV-002", status: "Pending", badge: "mBadgeWarning" },
];

export const PORTAL_ACTIVITY: PortalActivity[] = [
  { text: "Website homepage approved", time: "2 days ago" },
  { text: "SEO audit uploaded", time: "4 days ago" },
];

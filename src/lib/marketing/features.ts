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
  UsersRound,
  Palette,
  SearchX,
  BellRing,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

import type { ShotName } from "@/components/marketing/product-shot";

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
    title: "Invoices",
    description:
      "See what's paid, unpaid, and overdue so nothing slips through.",
  },
  {
    icon: UsersRound,
    title: "Team Collaboration",
    description:
      "Invite teammates with the right access and work from one shared space.",
  },
  {
    icon: Palette,
    title: "Agency Branding",
    description:
      "Add your logo and name so your client portal looks like yours.",
  },
];

// Features page — alternating sections
export interface FeatureSection {
  eyebrow: string;
  title: string;
  features: string[];
  /** Real screenshot shown alongside the section. */
  shot: ShotName;
  shotAlt: string;
}

export const FEATURE_SECTIONS: FeatureSection[] = [
  {
    eyebrow: "Client Management",
    title: "Every client, fully organized",
    features: ["Client records", "Notes", "Activity history", "Search"],
    shot: "clients",
    shotAlt: "The Sarion clients list with company, email, and project counts",
  },
  {
    eyebrow: "Project Management",
    title: "Keep work moving forward",
    features: ["Status tracking", "Due dates", "Task checklists"],
    shot: "projects",
    shotAlt: "The Sarion projects view showing status and due dates per client",
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
    shot: "portal",
    shotAlt: "The branded Sarion client portal with project updates and comments",
  },
  {
    eyebrow: "Invoices",
    title: "Never lose track of a payment",
    features: ["Paid", "Unpaid", "Overdue"],
    shot: "invoices",
    shotAlt: "The Sarion invoices list showing paid, unpaid, and overdue status",
  },
  {
    eyebrow: "Team Collaboration",
    title: "Work together, cleanly",
    features: ["Owner access", "Team member access", "Shared workflows"],
    shot: "team",
    shotAlt: "The Sarion team settings with members, invites, and permissions",
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

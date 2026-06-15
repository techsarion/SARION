/**
 * Homepage FAQ — written for humans first, but each answer targets a real
 * long-tail query ("agency management software", "client portal", "free CRM
 * for freelancers") so the page can win FAQ rich results and informational
 * search intent. `href`/`hrefLabel` add a contextual internal link where it
 * genuinely helps the reader.
 */
export interface HomeFaqItem {
  question: string;
  answer: string;
  href?: string;
  hrefLabel?: string;
}

export const HOME_FAQ: HomeFaqItem[] = [
  {
    question: "What is Sarion?",
    answer:
      "Sarion is agency management software that brings client management (CRM), projects, tasks, invoicing, and a branded client portal into one workspace. It's built specifically for small agencies, studios, and freelancers who are tired of stitching together spreadsheets, inboxes, and half a dozen disconnected apps.",
    href: "/features",
    hrefLabel: "Explore all features",
  },
  {
    question: "Who is Sarion for?",
    answer:
      "Sarion is designed for design studios, marketing and web agencies, consultancies, and solo freelancers managing multiple clients. If you run client work and need one place for projects, invoices, and client communication, Sarion fits.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. The Free plan lets you manage one client and one project with the full client portal — no time limit and no credit card. Every paid plan also starts with a 14-day free trial of the complete workspace.",
    href: "/pricing",
    hrefLabel: "Compare plans",
  },
  {
    question: "What is a client portal and why does it matter?",
    answer:
      "A client portal is a private, branded page where your clients can see project status, due dates, and updates without endless email threads. It cuts down status-update churn and makes your agency look organized and professional from the first interaction.",
    href: "/portal-demo",
    hrefLabel: "See a live portal demo",
  },
  {
    question: "How is Sarion different from a generic CRM?",
    answer:
      "Generic CRMs are built for sales pipelines, not delivery. Sarion is built for the work after the deal closes — running projects, invoicing clients, and keeping everyone aligned through the client portal. No bloated sales features you'll never use.",
  },
  {
    question: "Do I need a credit card to start?",
    answer:
      "No. You can start on the Free plan or trial the full premium workspace for 14 days without entering any payment details. Founding members who join during launch also lock in their pricing for life.",
    href: "/pricing",
    hrefLabel: "View founding pricing",
  },
];

import type { Metadata } from "next";

import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import "./marketing.css";

export const metadata: Metadata = {
  title: {
    default: "Sarion — Run your agency from one place",
    template: "%s · Sarion",
  },
  description:
    "Client management, projects, invoices, and client portals for agencies. Run your entire agency from one workspace.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketingTheme">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

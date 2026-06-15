import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { isTrialing, isTrialExpired, trialDaysLeft } from "@/config/plans";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TrialBanner } from "@/components/billing/trial-banner";
import { Toaster } from "@/components/ui/sonner";

type BannerState =
  | { kind: "trialing"; daysLeft: number; founding: boolean }
  | { kind: "expired" }
  | { kind: "none" };

// Authenticated workspace — never index. Private agency/client data must not
// appear in search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const role = (session.user.role ?? "member") as string;
  const agencyId = session.user.agencyId as string | undefined;

  // Determine whether to show the upgrade prompt + trial banner. Agencies on an
  // active subscription have fully converted — hide the upsell for them.
  let showUpgrade = true;
  let banner: BannerState = { kind: "none" };
  if (agencyId) {
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      select: {
        subscriptionStatus: true,
        trialEndsAt: true,
        planTier: true,
        foundingMember: true,
      },
    });
    if (agency) {
      const now = Date.now();
      showUpgrade = agency.subscriptionStatus !== "active";
      if (isTrialing(agency, now)) {
        banner = {
          kind: "trialing",
          daysLeft: trialDaysLeft(agency, now) ?? 0,
          founding: agency.foundingMember,
        };
      } else if (
        isTrialExpired(agency, now) ||
        agency.subscriptionStatus === "canceled" ||
        agency.subscriptionStatus === "past_due"
      ) {
        banner = { kind: "expired" };
      }
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary/30">
      <Sidebar role={role} showUpgrade={showUpgrade} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={{ name: session.user.name, email: session.user.email }}
          role={role}
          showUpgrade={showUpgrade}
        />
        <TrialBanner state={banner} />
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

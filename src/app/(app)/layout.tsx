import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

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

  // Determine whether to show the upgrade prompt. Agencies on an active or
  // trialing subscription have already converted — hide the upsell for them.
  let showUpgrade = true;
  if (agencyId) {
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
      select: { subscriptionStatus: true },
    });
    showUpgrade = !["active", "trialing"].includes(
      agency?.subscriptionStatus ?? "",
    );
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
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

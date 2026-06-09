import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Defense in depth — middleware already guards these routes, but never
  // render the shell without a verified session.
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-secondary/30">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          user={{ name: session.user.name, email: session.user.email }}
        />
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

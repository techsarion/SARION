import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireOwner } from "@/server/auth-context";
import { getAgency } from "@/server/data/agency";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { AgencyBrandingForm } from "@/components/settings/agency-branding-form";

export const metadata: Metadata = { title: "Settings · Sarion" };

export default async function SettingsPage() {
  // Owner-only route — members are redirected to /dashboard.
  const { agencyId } = await requireOwner();
  const agency = await getAgency(agencyId);
  if (!agency) notFound();

  return (
    <PageWrapper
      title="Settings"
      description="Manage your agency branding and preferences."
    >
      <div className="space-y-4">
        <AgencyBrandingForm
          defaultValues={{ name: agency.name, logoUrl: agency.logoUrl ?? "" }}
        />
      </div>
    </PageWrapper>
  );
}

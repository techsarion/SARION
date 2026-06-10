import type { Metadata } from "next";

import { requireAgency } from "@/server/auth-context";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { ClientForm } from "@/components/clients/client-form";

export const metadata: Metadata = { title: "New Client · Sarion" };

export default async function NewClientPage() {
  // Enforce an authenticated agency context before rendering the form.
  await requireAgency();

  return (
    <PageWrapper
      title="Add Client"
      description="Create a new client record for your agency."
    >
      <ClientForm mode="create" />
    </PageWrapper>
  );
}

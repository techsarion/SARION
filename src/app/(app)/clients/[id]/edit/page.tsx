import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireAgency } from "@/server/auth-context";
import { getClient } from "@/server/data/clients";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { ClientForm } from "@/components/clients/client-form";

export const metadata: Metadata = { title: "Edit Client · Sarion" };

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { agencyId } = await requireAgency();
  const { id } = await params;
  const client = await getClient(agencyId, id);

  if (!client) notFound();

  return (
    <PageWrapper
      title={`Edit ${client.name}`}
      description="Update this client's details."
    >
      <ClientForm
        mode="edit"
        clientId={client.id}
        defaultValues={{
          name: client.name,
          company: client.company ?? "",
          email: client.email ?? "",
          phone: client.phone ?? "",
          notes: client.notes ?? "",
        }}
      />
    </PageWrapper>
  );
}

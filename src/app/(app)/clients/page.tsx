import { PageWrapper } from "@/components/layout/page-wrapper";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function ClientsPage() {
  return (
    <PageWrapper title="Clients" description="Manage your agency's clients and their portal access.">
      <ComingSoon feature="Clients" />
    </PageWrapper>
  );
}

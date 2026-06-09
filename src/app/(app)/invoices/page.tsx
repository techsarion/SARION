import { PageWrapper } from "@/components/layout/page-wrapper";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function InvoicesPage() {
  return (
    <PageWrapper title="Invoices" description="Create, send, and track invoices.">
      <ComingSoon feature="Invoices" />
    </PageWrapper>
  );
}

import { PageWrapper } from "@/components/layout/page-wrapper";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function TeamPage() {
  return (
    <PageWrapper title="Team" description="Invite teammates and manage roles.">
      <ComingSoon feature="Team" />
    </PageWrapper>
  );
}

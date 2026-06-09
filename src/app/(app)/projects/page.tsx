import { PageWrapper } from "@/components/layout/page-wrapper";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function ProjectsPage() {
  return (
    <PageWrapper title="Projects" description="Track every project from kickoff to delivery.">
      <ComingSoon feature="Projects" />
    </PageWrapper>
  );
}

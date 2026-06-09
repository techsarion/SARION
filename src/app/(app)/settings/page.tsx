import { PageWrapper } from "@/components/layout/page-wrapper";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function SettingsPage() {
  return (
    <PageWrapper title="Settings" description="Manage your agency, plan, and preferences.">
      <ComingSoon feature="Settings" />
    </PageWrapper>
  );
}

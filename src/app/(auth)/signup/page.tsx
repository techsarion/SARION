import type { Metadata } from "next";

import { getPublicInvite } from "@/server/data/team";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up · Sarion",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; source?: string; session?: string }>;
}) {
  const { invite: token, source, session } = await searchParams;
  const invite = token ? await getPublicInvite(token) : null;

  // Scorecard lead-magnet attribution: only honour the session id when it
  // arrives via the scorecard CTA (?source=scorecard&session=<id>).
  const scorecardSession = source === "scorecard" ? session : undefined;

  return (
    <SignupForm
      inviteToken={token}
      invite={invite}
      scorecardSession={scorecardSession}
    />
  );
}

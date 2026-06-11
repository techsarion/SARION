import type { Metadata } from "next";

import { getPublicInvite } from "@/server/data/team";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Sign up · Sarion",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite: token } = await searchParams;
  const invite = token ? await getPublicInvite(token) : null;

  return <SignupForm inviteToken={token} invite={invite} />;
}

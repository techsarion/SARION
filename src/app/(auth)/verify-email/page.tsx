import type { Metadata } from "next";

import { VerifyEmailNotice } from "./verify-email-notice";

export const metadata: Metadata = {
  title: "Verify your email · Sarion",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <VerifyEmailNotice email={email} />;
}

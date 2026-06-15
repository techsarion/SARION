import { NextResponse } from "next/server";

import { requireOwner } from "@/server/auth-context";
import { createPortalSession } from "@/lib/billing";

/** Opens the Stripe Billing Portal so owners can manage card / cancel / invoices. */
export async function POST() {
  const ctx = await requireOwner();
  const result = await createPortalSession(ctx.agencyId);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ url: result.url });
}

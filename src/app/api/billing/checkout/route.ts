import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireOwner } from "@/server/auth-context";
import { createCheckoutSession } from "@/lib/billing";

const bodySchema = z.object({
  tier: z.enum(["starter", "growth", "agency"]),
  interval: z.enum(["monthly", "yearly"]).default("monthly"),
});

export async function POST(req: NextRequest) {
  const ctx = await requireOwner();

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan selection" }, { status: 400 });
  }

  const result = await createCheckoutSession({
    agencyId: ctx.agencyId,
    email: ctx.email,
    tier: parsed.data.tier,
    interval: parsed.data.interval,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ url: result.url });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireOwner } from "@/server/auth-context";
import { createCheckoutSession } from "@/lib/billing";
import { captureServer } from "@/lib/posthog-server";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

const bodySchema = z.object({
  tier: z.enum(["starter", "growth", "agency"]),
  interval: z.enum(["monthly", "yearly"]).default("monthly"),
  // Optional fields from the custom checkout page. Absent on legacy panel calls.
  name: z.string().trim().min(1).max(120).optional(),
  // ISO-3166 alpha-2 country code (e.g. "US"). Only country + zip are honoured
  // by Lemon Squeezy's checkout prefill.
  country: z.string().trim().length(2).toUpperCase().optional(),
  zip: z.string().trim().min(1).max(20).optional(),
  coupon: z.string().trim().min(1).max(64).optional(),
});

export async function POST(req: NextRequest) {
  const ctx = await requireOwner();

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan selection" }, { status: 400 });
  }

  const { tier, interval, name, country, zip, coupon } = parsed.data;
  // A custom-checkout call carries buyer details; route it to the dedicated
  // success page. Legacy panel calls keep the existing billing-settings landing.
  const isCustomCheckout = Boolean(name || country || zip || coupon);

  const result = await createCheckoutSession({
    agencyId: ctx.agencyId,
    email: ctx.email,
    tier,
    interval,
    name,
    country,
    zip,
    coupon,
    successPath: isCustomCheckout ? "/checkout/success" : undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await captureServer({
    distinctId: ctx.userId,
    event: ANALYTICS_EVENTS.CheckoutStarted,
    agencyId: ctx.agencyId,
    properties: { tier: parsed.data.tier, interval: parsed.data.interval },
  });

  return NextResponse.json({ url: result.url });
}

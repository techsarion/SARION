import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireOwner } from "@/server/auth-context";
import { db } from "@/lib/db";
import { getStripe, PLANS, type PlanKey } from "@/lib/stripe";

const bodySchema = z.object({
  plan: z.enum(["starter", "growth", "agency"]),
});

export async function POST(req: NextRequest) {
  const ctx = await requireOwner();

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const plan = parsed.data.plan as PlanKey;
  const priceId = PLANS[plan].priceId;

  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price ID for plan "${plan}" is not configured` },
      { status: 500 },
    );
  }

  const agency = await db.agency.findUnique({
    where: { id: ctx.agencyId },
    select: { stripeCustomerId: true, name: true },
  });

  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }

  const stripe = getStripe();

  // Reuse existing Stripe customer or create one.
  let customerId = agency.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: ctx.email,
      name: agency.name,
      metadata: { agencyId: ctx.agencyId },
    });
    customerId = customer.id;
    await db.agency.update({
      where: { id: ctx.agencyId },
      data: { stripeCustomerId: customerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings/billing?success=1`,
    cancel_url: `${appUrl}/settings/billing?canceled=1`,
    metadata: { agencyId: ctx.agencyId, plan },
    subscription_data: { metadata: { agencyId: ctx.agencyId, plan } },
  });

  return NextResponse.json({ url: session.url });
}

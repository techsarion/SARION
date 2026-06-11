import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

// Stripe sends the raw body for signature verification — disable body parsing.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const agencyId = session.metadata?.agencyId;
        const plan = session.metadata?.plan;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!agencyId || !plan || !subscriptionId) break;

        await db.agency.update({
          where: { id: agencyId },
          data: {
            plan,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: "active",
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const agencyId = sub.metadata?.agencyId;
        if (!agencyId) break;

        const plan = sub.metadata?.plan ?? sub.items.data[0]?.price.lookup_key ?? "starter";

        await db.agency.update({
          where: { id: agencyId },
          data: {
            plan,
            stripeSubscriptionId: sub.id,
            subscriptionStatus: sub.status,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const agencyId = sub.metadata?.agencyId;
        if (!agencyId) break;

        await db.agency.update({
          where: { id: agencyId },
          data: {
            subscriptionStatus: "canceled",
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { resolveSubscriptionPlan } from "@/lib/billing";
import { getPlan, type PlanTier, type BillingInterval } from "@/config/plans";
import { sendEmail, type EmailKind, type EmailPayloads } from "@/lib/email";

// Stripe sends the raw body for signature verification — disable body parsing.
export const runtime = "nodejs";

/** Resolve the agency owner's email for transactional billing notifications. */
async function ownerEmail(agencyId: string): Promise<string | null> {
  const owner = await db.user.findFirst({
    where: { agencyId, role: "owner" },
    select: { email: true },
    orderBy: { createdAt: "asc" },
  });
  return owner?.email ?? null;
}

/** Best-effort billing notification — never throws into the webhook flow. */
async function notify<K extends EmailKind>(
  agencyId: string,
  kind: K,
  data: EmailPayloads[K],
): Promise<void> {
  try {
    const to = await ownerEmail(agencyId);
    if (to) await sendEmail(kind, to, data);
  } catch (err) {
    console.error(`[webhook] ${String(kind)} email failed:`, err);
  }
}

function priceLabel(tier: PlanTier, interval: BillingInterval): { amount: string; interval: string } {
  const p = getPlan(tier).pricing;
  return {
    amount: `$${interval === "yearly" ? p.yearly : p.monthly}`,
    interval: interval === "yearly" ? "year" : "month",
  };
}

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

  // Idempotency — record the event id first. A duplicate delivery hits the
  // unique constraint and we ack without reprocessing.
  try {
    await db.stripeWebhookEvent.create({
      data: { eventId: event.id, type: event.type },
    });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const agencyId = session.metadata?.agencyId;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (!agencyId || !subscriptionId) break;

        // Pull the full subscription so we resolve tier/interval from price.
        const sub = await getStripe().subscriptions.retrieve(subscriptionId);
        const { tier, interval } = resolveSubscriptionPlan(sub);

        await db.agency.update({
          where: { id: agencyId },
          data: {
            planTier: tier,
            billingInterval: interval,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: sub.status,
            // Conversion to a paid plan ends the no-card trial bookkeeping.
            trialEndsAt: sub.status === "trialing" ? undefined : null,
          },
        });

        // Notify the owner their subscription is active.
        if (tier !== "free") {
          const { amount, interval: per } = priceLabel(tier, interval);
          await notify(agencyId, "subscriptionActivated", {
            planName: getPlan(tier).name,
            amount,
            interval: per,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const agencyId = sub.metadata?.agencyId;
        if (!agencyId) break;

        const { tier, interval } = resolveSubscriptionPlan(sub);

        await db.agency.update({
          where: { id: agencyId },
          data: {
            planTier: tier,
            billingInterval: interval,
            stripeSubscriptionId: sub.id,
            subscriptionStatus: sub.status,
            ...(sub.status === "active" ? { trialEndsAt: null } : {}),
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const agencyId = sub.metadata?.agencyId;
        if (!agencyId) break;

        // Subscription ended — drop to the free plan (data preserved).
        const { tier: endedTier } = resolveSubscriptionPlan(sub);
        await db.agency.update({
          where: { id: agencyId },
          data: {
            planTier: "free",
            subscriptionStatus: "canceled",
            stripeSubscriptionId: null,
          },
        });

        await notify(agencyId, "subscriptionCancelled", {
          planName: getPlan(endedTier).name,
          accessUntil: "the end of your current billing period",
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    // Roll back the idempotency marker so Stripe's retry can reprocess.
    await db.stripeWebhookEvent
      .delete({ where: { eventId: event.id } })
      .catch(() => {});
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

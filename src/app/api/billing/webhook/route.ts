import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/lemonsqueezy";
import { resolveSubscriptionPlan, lemonStatusToOurs } from "@/lib/billing";
import { getPlan, type PlanTier, type BillingInterval } from "@/config/plans";
import { sendEmailSafe, type EmailKind, type EmailPayloads } from "@/lib/email";
import { captureServer } from "@/lib/posthog-server";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

// Lemon Squeezy signs the raw body — keep us on the Node runtime so we can read
// the exact bytes for HMAC verification.
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

/**
 * Resolve the agency owner's user id — used as the analytics distinct id so
 * billing events stitch to the same person as client-side / checkout events.
 * Falls back to `agency_<id>` when no owner row is found.
 */
async function ownerDistinctId(agencyId: string): Promise<string> {
  const owner = await db.user.findFirst({
    where: { agencyId, role: "owner" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return owner?.id ?? `agency_${agencyId}`;
}

/** Resolve an agency from a Lemon Squeezy customer id (payment events). */
async function agencyByCustomer(
  customerId: string | number | null | undefined,
): Promise<{ id: string; planTier: PlanTier; billingInterval: BillingInterval } | null> {
  if (!customerId) return null;
  return db.agency.findFirst({
    where: { lemonCustomerId: String(customerId) },
    select: { id: true, planTier: true, billingInterval: true },
  });
}

/** Best-effort billing notification — never throws into the webhook flow. */
async function notify<K extends EmailKind>(
  agencyId: string,
  kind: K,
  data: EmailPayloads[K],
): Promise<void> {
  const to = await ownerEmail(agencyId);
  if (to) await sendEmailSafe(kind, to, data);
}

function priceLabel(
  tier: PlanTier,
  interval: BillingInterval,
): { amount: string; interval: string } {
  const p = getPlan(tier).pricing;
  return {
    amount: `$${interval === "yearly" ? p.yearly : p.monthly}`,
    interval: interval === "yearly" ? "year" : "month",
  };
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "your next billing date";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Lemon Squeezy webhook payload shapes (only the fields we read) ───────────

interface LemonWebhookBody {
  meta: {
    event_name: string;
    custom_data?: { agency_id?: string; tier?: string; interval?: string };
  };
  data: {
    id: string;
    attributes: {
      status?: string;
      variant_id?: number;
      customer_id?: number;
      order_id?: number;
      ends_at?: string | null;
      renews_at?: string | null;
      total?: number; // cents (subscription-invoice events)
      billing_reason?: string; // "initial" | "renewal" | "updated"
    };
  };
}

/** A stable per-delivery id for idempotency: prefer the X-Event-Id header. */
function eventKey(req: NextRequest, body: LemonWebhookBody): string {
  return (
    req.headers.get("x-event-id") ??
    `${body.meta.event_name}:${body.data.id}:${body.data.attributes.status ?? ""}`
  );
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = (await headers()).get("x-signature");
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });
  }
  if (!verifyWebhookSignature(rawBody, sig, webhookSecret)) {
    console.error("[webhook] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let body: LemonWebhookBody;
  try {
    body = JSON.parse(rawBody) as LemonWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = body.meta.event_name;
  const key = eventKey(req, body);

  // Idempotency — record the event first. A duplicate delivery hits the unique
  // constraint and we ack without reprocessing.
  try {
    await db.lemonWebhookEvent.create({ data: { eventId: key, type: eventName } });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    const attrs = body.data.attributes;
    const agencyId = body.meta.custom_data?.agency_id;

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed": {
        if (!agencyId) break;
        const { tier, interval } = resolveSubscriptionPlan(attrs.variant_id ?? "");
        const status = lemonStatusToOurs(attrs.status ?? "active", attrs.ends_at ?? null);

        const existing = await db.agency.findUnique({
          where: { id: agencyId },
          select: { subscriptionStatus: true },
        });

        await db.agency.update({
          where: { id: agencyId },
          data: {
            planTier: tier,
            billingInterval: interval,
            lemonSubscriptionId: body.data.id,
            ...(attrs.customer_id ? { lemonCustomerId: String(attrs.customer_id) } : {}),
            ...(attrs.order_id ? { lemonOrderId: String(attrs.order_id) } : {}),
            subscriptionStatus: status,
            // Conversion to a paid plan ends the no-card trial bookkeeping.
            trialEndsAt: status === "trialing" ? undefined : null,
          },
        });

        // Analytics distinct id (owner) shared across the billing funnel.
        const distinctId = await ownerDistinctId(agencyId);

        // The checkout that produced this subscription has completed.
        if (eventName === "subscription_created") {
          await captureServer({
            distinctId,
            event: ANALYTICS_EVENTS.CheckoutCompleted,
            agencyId,
            properties: { tier, interval },
          });
        }

        // Notify the owner once, on first activation.
        const isNewlyActive =
          tier !== "free" &&
          status === "active" &&
          existing?.subscriptionStatus !== "active";
        if (isNewlyActive) {
          const { amount, interval: per } = priceLabel(tier, interval);
          await notify(agencyId, "subscriptionActivated", {
            planName: getPlan(tier).name,
            amount,
            interval: per,
          });
          await captureServer({
            distinctId,
            event: ANALYTICS_EVENTS.SubscriptionActivated,
            agencyId,
            properties: { tier, interval },
          });
        }
        break;
      }

      case "subscription_cancelled": {
        // Cancellation requested — access continues until the period ends. We
        // keep the tier and only downgrade on subscription_expired.
        if (!agencyId) break;
        const status = lemonStatusToOurs("cancelled", attrs.ends_at ?? null);
        const { tier } = resolveSubscriptionPlan(attrs.variant_id ?? "");

        await db.agency.update({
          where: { id: agencyId },
          data: { subscriptionStatus: status },
        });

        await notify(agencyId, "subscriptionCancelled", {
          planName: getPlan(tier).name,
          accessUntil: attrs.ends_at
            ? formatDate(attrs.ends_at)
            : "the end of your current billing period",
        });

        await captureServer({
          distinctId: await ownerDistinctId(agencyId),
          event: ANALYTICS_EVENTS.SubscriptionCancelled,
          agencyId,
          properties: { tier },
        });
        break;
      }

      case "subscription_expired": {
        // Subscription truly ended — drop to the free plan (data preserved).
        if (!agencyId) break;
        await db.agency.update({
          where: { id: agencyId },
          data: {
            planTier: "free",
            subscriptionStatus: "canceled",
            lemonSubscriptionId: null,
          },
        });
        break;
      }

      case "subscription_payment_success": {
        // Renewals only — the first payment is covered by activation above, so
        // we avoid a duplicate email on subscription create.
        // Skip the first (initial) invoice — the activation email already fired.
        if (attrs.billing_reason === "initial") break;
        const agency = await agencyByCustomer(attrs.customer_id);
        if (!agency) break;
        const { amount } = priceLabel(agency.planTier, agency.billingInterval);
        await notify(agency.id, "subscriptionRenewed", {
          planName: getPlan(agency.planTier).name,
          amount: typeof attrs.total === "number" ? `$${(attrs.total / 100).toFixed(2)}` : amount,
          nextBillingDate: formatDate(attrs.renews_at),
        });
        break;
      }

      case "subscription_payment_failed": {
        const agency = await agencyByCustomer(attrs.customer_id);
        if (!agency) break;
        const { amount } = priceLabel(agency.planTier, agency.billingInterval);
        await notify(agency.id, "paymentFailed", {
          planName: getPlan(agency.planTier).name,
          amount,
          retryUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://trysarion.com"}/settings/billing`,
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    // Roll back the idempotency marker so Lemon Squeezy's retry can reprocess.
    await db.lemonWebhookEvent.delete({ where: { eventId: key } }).catch(() => {});
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

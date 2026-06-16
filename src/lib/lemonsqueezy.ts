import "server-only";

import crypto from "node:crypto";

/**
 * Lemon Squeezy API client — used ONLY for Sarion's own subscription billing
 * (MVP-PRD F9). Not used for processing agency client invoices.
 *
 * Thin fetch wrapper over the JSON:API endpoints we need (checkouts +
 * subscriptions). All plan/pricing data lives in src/config/plans.ts and
 * server-side billing orchestration lives in src/lib/billing.ts.
 */

const API_BASE = "https://api.lemonsqueezy.com/v1";

export function isLemonConfigured(): boolean {
  return Boolean(
    process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID,
  );
}

function apiKey(): string {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) throw new Error("LEMONSQUEEZY_API_KEY is not configured.");
  return key;
}

/** Authenticated JSON:API request against the Lemon Squeezy API. */
async function lemonFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey()}`,
      ...init.headers,
    },
    // Billing calls must never be cached.
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Lemon Squeezy API ${res.status} on ${path}: ${detail.slice(0, 500)}`,
    );
  }
  return (await res.json()) as T;
}

// ── Checkouts ────────────────────────────────────────────────────────────────

export interface CreateCheckoutInput {
  variantId: string;
  email: string;
  /** Arbitrary key/value data echoed back on every webhook (meta.custom_data). */
  customData: Record<string, string>;
  /** Where Lemon Squeezy redirects after a successful purchase. */
  redirectUrl: string;
}

/**
 * Create a hosted checkout and return its URL. We attach `custom_data` so the
 * webhook can resolve the agency without a prior customer lookup, and prefill
 * the email so the buyer maps to the right Lemon customer.
 */
export async function createCheckoutUrl(
  input: CreateCheckoutInput,
): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) throw new Error("LEMONSQUEEZY_STORE_ID is not configured.");

  const payload = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: input.email,
          custom: input.customData,
        },
        product_options: {
          redirect_url: input.redirectUrl,
        },
      },
      relationships: {
        store: { data: { type: "stores", id: String(storeId) } },
        variant: { data: { type: "variants", id: String(input.variantId) } },
      },
    },
  };

  const json = await lemonFetch<{ data: { attributes: { url: string } } }>(
    "/checkouts",
    { method: "POST", body: JSON.stringify(payload) },
  );
  return json.data.attributes.url;
}

// ── Subscriptions ──────────────────────────────────────────────────────────—

export interface LemonSubscriptionUrls {
  customer_portal?: string;
  update_payment_method?: string;
  customer_portal_update_subscription?: string;
}

export interface LemonSubscriptionAttributes {
  status: string; // on_trial | active | paused | past_due | unpaid | cancelled | expired
  variant_id: number;
  customer_id: number;
  order_id: number;
  trial_ends_at: string | null;
  renews_at: string | null;
  ends_at: string | null;
  urls: LemonSubscriptionUrls;
  user_email?: string;
}

/** Fetch a single subscription (used to mint a fresh customer-portal URL). */
export async function getSubscription(
  subscriptionId: string,
): Promise<{ id: string; attributes: LemonSubscriptionAttributes }> {
  const json = await lemonFetch<{
    data: { id: string; attributes: LemonSubscriptionAttributes };
  }>(`/subscriptions/${subscriptionId}`);
  return json.data;
}

// ── Webhook signature verification ──────────────────────────────────────────

/**
 * Verify a Lemon Squeezy webhook: HMAC-SHA256 of the raw request body keyed by
 * the signing secret, compared in constant time to the X-Signature header.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  const a = Buffer.from(digest, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

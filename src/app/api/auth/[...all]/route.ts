import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";
import {
  rateLimit,
  clientIpFromHeaders,
  type RateLimitResult,
} from "@/lib/rate-limit";

/**
 * Better Auth handler. GET is passed through untouched; POST is wrapped with a
 * coarse per-IP rate limit on the sensitive credential endpoints (sign-in,
 * sign-up, password-reset) to raise the cost of brute-force / credential
 * stuffing. All other auth POSTs (e.g. sign-out, session) are unaffected, and
 * the underlying Better Auth behaviour is never changed.
 */
const handlers = toNextJsHandler(auth.handler);

export const GET = handlers.GET;

const MIN = 60_000;
const HOUR = 60 * MIN;

function tooMany(retryAfterMs: number): Response {
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return new Response(
    JSON.stringify({
      error: "Too many attempts. Please wait a moment and try again.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(seconds),
      },
    },
  );
}

/** Best-effort email extraction from a JSON auth body (for per-email keys). */
function emailFromBody(body: string): string {
  try {
    const parsed = JSON.parse(body) as { email?: unknown };
    return typeof parsed.email === "string"
      ? parsed.email.trim().toLowerCase()
      : "unknown";
  } catch {
    return "unknown";
  }
}

export async function POST(req: Request): Promise<Response> {
  const path = new URL(req.url).pathname;
  const ip = clientIpFromHeaders(req.headers);

  let limited: RateLimitResult | null = null;
  // Set when we consume the body to build a per-email key — we must then rebuild
  // the request so Better Auth still receives the payload.
  let consumedBody: string | undefined;

  if (path.includes("/sign-in")) {
    limited = await rateLimit(`auth:signin:${ip}`, 5, 15 * MIN);
  } else if (path.includes("/sign-up")) {
    limited = await rateLimit(`auth:signup:${ip}`, 5, HOUR);
  } else if (
    path.includes("/forget-password") ||
    path.includes("/request-password-reset") ||
    path.includes("/reset-password")
  ) {
    consumedBody = await req.text();
    const email = emailFromBody(consumedBody);
    limited = await rateLimit(`auth:pwreset:${ip}:${email}`, 5, HOUR);
  }

  if (limited && !limited.ok) {
    return tooMany(limited.retryAfterMs);
  }

  // Rebuild the request if we read its body above (a body can only be read once).
  const downstream =
    consumedBody !== undefined
      ? new Request(req.url, {
          method: "POST",
          headers: req.headers,
          body: consumedBody,
        })
      : req;

  return handlers.POST(downstream);
}

import "server-only";

/**
 * Rate limiting with a pluggable, future-ready store.
 *
 * The default `MemoryStore` is dependency-free and works everywhere, but its
 * state is per-process — on serverless (Vercel) that means per-instance, not
 * global. It raises the cost of abuse without pretending to be airtight.
 *
 * To make limits global later WITHOUT touching any call site, implement
 * `RateLimitStore` against shared infrastructure and register it once at startup:
 *
 *   // e.g. src/instrumentation.ts
 *   configureRateLimitStore(new PostgresRateLimitStore(db));  // Supabase Postgres
 *   // or a Vercel KV / Upstash Redis store — both fit this interface.
 *
 * `rateLimit()` is async precisely so a distributed (network) store drops in
 * cleanly. No paid service is required: a single Postgres table on the existing
 * Supabase database (atomic upsert of a windowed counter) satisfies the
 * interface — see the docstring on RateLimitStore for the suggested shape.
 */

export interface RateLimitResult {
  ok: boolean;
  /** Remaining allowance in the current window. */
  remaining: number;
  /** Ms until the window frees up (only meaningful when !ok). */
  retryAfterMs: number;
}

/**
 * Pluggable backend. A distributed implementation might back this with a
 * Postgres table `RateLimitHit(key, window_start, count)` and do an atomic
 * `INSERT ... ON CONFLICT DO UPDATE SET count = count + 1` per window bucket,
 * returning whether `count <= limit`. The in-memory default below is the
 * reference implementation of the same contract.
 */
export interface RateLimitStore {
  hit(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

// ── Default in-memory store (sliding window) ────────────────────────────────

class MemoryStore implements RateLimitStore {
  private buckets = new Map<string, number[]>();
  private lastSweep = 0;
  // Longest window we expect to track; used to bound the periodic sweep.
  private readonly maxWindowMs = 60 * 60 * 1000;

  private sweep(now: number) {
    if (now - this.lastSweep < 60_000) return;
    this.lastSweep = now;
    for (const [key, hits] of this.buckets) {
      if (hits.length === 0 || now - hits[hits.length - 1] > this.maxWindowMs) {
        this.buckets.delete(key);
      }
    }
  }

  async hit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    this.sweep(now);

    const cutoff = now - windowMs;
    const hits = (this.buckets.get(key) ?? []).filter((t) => t > cutoff);

    if (hits.length >= limit) {
      this.buckets.set(key, hits);
      const oldest = hits[0];
      return { ok: false, remaining: 0, retryAfterMs: Math.max(0, oldest + windowMs - now) };
    }

    hits.push(now);
    this.buckets.set(key, hits);
    return { ok: true, remaining: limit - hits.length, retryAfterMs: 0 };
  }
}

// ── Registry ────────────────────────────────────────────────────────────────

let store: RateLimitStore = new MemoryStore();

/** Swap the backend once at startup (e.g. a distributed store in production). */
export function configureRateLimitStore(next: RateLimitStore): void {
  store = next;
}

/**
 * Allow at most `limit` events per `windowMs` for a given `key`. Async so a
 * distributed store can be plugged in transparently. Never throws — a backend
 * failure fails OPEN (allows the request) so analytics/abuse tooling can never
 * take down the user-facing action.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  try {
    return await store.hit(key, limit, windowMs);
  } catch {
    return { ok: true, remaining: limit, retryAfterMs: 0 };
  }
}

/**
 * Best-effort client IP from proxy headers. Returns "unknown" when absent
 * (dev / direct), which buckets such callers together — fine for a coarse guard.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

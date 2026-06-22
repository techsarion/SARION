"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { captureScorecardLead } from "@/server/actions/scorecard";
import styles from "./results.module.css";

/**
 * Email capture that unlocks the full report. On success it refreshes the route
 * so the server component re-renders in the unlocked state (no client state for
 * the report itself — it stays a server component).
 */
export function EmailGate({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(true);
  // Honeypot — bots fill hidden fields; humans never see it. The non-semantic
  // name (hp_token) avoids the browser-autofill false positives that a name like
  // "website" can trigger. Controlled so we can clear it on a soft-block retry.
  const [hp, setHp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await captureScorecardLead({
        sessionId,
        email: email.trim(),
        marketingOptIn: optIn,
        hpToken: hp,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (!res.unlocked) {
        // Soft-block (honeypot or too-fast). The server did NOT create a lead.
        // Recover gracefully instead of trapping the user: clear the honeypot
        // and prompt one more tap. On retry, the timing window has elapsed and
        // the honeypot is clean, so a legitimate user succeeds — no lead lost,
        // no analytics fired. A bot simply stays gated.
        setHp("");
        setError("Almost there — tap “Show my full report” once more to unlock it.");
        return;
      }
      // Real unlock: fire analytics exactly once, then reveal the full report.
      trackEvent(ANALYTICS_EVENTS.ScorecardEmailCaptured);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      // ALWAYS clear the loading state — the only safe way to guarantee the
      // button can never get stuck on "Unlocking…", even if the post-refresh
      // read lags behind the just-created lead.
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.gate}>
      <h2 className={styles.gateTitle}>Unlock your full report</h2>
      <p className={styles.gateText}>
        Enter your email to reveal your revenue leakage, time lost, pillar breakdown, and your
        personalized action plan — and we&apos;ll send you the report.
      </p>
      <form className={styles.gateForm} onSubmit={onSubmit} noValidate>
        {/* Honeypot — off-screen, hidden from AT and autofill. Bots fill it.
            Non-semantic name + autoComplete="off" keep password managers and
            browser autofill from ever populating it. */}
        <input
          type="text"
          name="hp_token"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          style={{
            position: "absolute",
            left: "-9999px",
            width: 1,
            height: 1,
            opacity: 0,
          }}
        />
        <input
          type="email"
          className={styles.gateInput}
          placeholder="you@youragency.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-label="Email address"
          required
        />
        <button type="submit" className="mBtn mBtnPrimary mBtnLg" disabled={submitting}>
          {submitting ? "Unlocking…" : "Show my full report"}
        </button>
      </form>
      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          style={{ marginTop: 3 }}
        />
        <span>
          Send me occasional agency operations tips from Sarion. No spam, unsubscribe anytime.
        </span>
      </label>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import styles from "./contact-form.module.css";

interface FormState {
  name: string;
  agency: string;
  email: string;
  message: string;
}

const EMPTY: FormState = { name: "", agency: "", email: "", message: "" };

export function ContactForm() {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    // TODO(lead-capture): This is a static demo — no submission is sent anywhere.
    // Wire real lead handling here before launch. Connect ONE of:
    //   • Resend            — send a transactional email to the team inbox
    //   • Email forwarding   — forward the submission to a shared sales address
    //   • CRM                — create a lead (e.g. HubSpot/Pipedrive) via API
    //   • Database capture   — persist as a `Lead` row via a Server Action
    // Recommended shape: extract the form into a Server Action that validates
    // with Zod, then dispatches to the chosen provider. Keep this component's
    // success/error UI as-is.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={styles.success}>
        <CheckCircle2 className={styles.successIcon} aria-hidden />
        <h3 className={styles.successTitle}>Thanks — we&apos;ll be in touch</h3>
        <p className={styles.successText}>
          Our team will reach out to {values.email} shortly.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          Name
        </label>
        <input
          id="name"
          className={styles.input}
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Jane Doe"
          autoComplete="name"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="agency" className={styles.label}>
          Agency Name
        </label>
        <input
          id="agency"
          className={styles.input}
          value={values.agency}
          onChange={(e) => set("agency", e.target.value)}
          placeholder="Acme Marketing"
          autoComplete="organization"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="jane@acme.com"
          autoComplete="email"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="message" className={styles.label}>
          Message
        </label>
        <textarea
          id="message"
          className={styles.textarea}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Tell us a little about your agency…"
          rows={5}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="submit" className="mBtn mBtnPrimary mBtnLg">
          Send Message
        </button>
        <Link href="/signup" className="mBtn mBtnSecondary mBtnLg">
          Book Demo
        </Link>
      </div>
    </form>
  );
}

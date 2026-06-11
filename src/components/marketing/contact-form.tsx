"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import { siteConfig } from "@/config/site";
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

    // Real submission via the visitor's email client — the message is delivered
    // straight to the Sarion inbox. No fake "success" without sending.
    const subject = `Sarion enquiry from ${values.name}`;
    const body = [
      `Name: ${values.name}`,
      values.agency ? `Agency: ${values.agency}` : null,
      `Email: ${values.email}`,
      "",
      values.message,
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className={styles.success}>
        <MailCheck className={styles.successIcon} aria-hidden />
        <h3 className={styles.successTitle}>Almost there</h3>
        <p className={styles.successText}>
          Your email app should open with your message ready to send. If nothing
          happens, email us directly at{" "}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className={styles.successLink}
          >
            {siteConfig.contactEmail}
          </a>
          . We usually reply within 24 hours.
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
          Start Free Trial
        </Link>
      </div>
    </form>
  );
}

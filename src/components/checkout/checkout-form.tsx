"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Check,
  Lock,
  ShieldCheck,
  Sparkles,
  Tag,
  Loader2,
  AlertCircle,
  RefreshCw,
  Zap,
} from "lucide-react";

import {
  checkoutFormSchema,
  type CheckoutFormValues,
  COUNTRIES,
} from "@/lib/checkout-schema";
import {
  yearlySavingMonths,
  type BillingInterval,
  type PaidPlanTier,
  type PlanDefinition,
} from "@/config/plans";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface CheckoutFormProps {
  plan: PlanDefinition;
  tier: PaidPlanTier;
  agencyName: string;
  agencyLogoUrl: string | null;
  defaultName: string;
  accountEmail: string;
  defaultInterval: BillingInterval;
}

const FORM_ID = "sarion-checkout-form";

export function CheckoutForm({
  plan,
  tier,
  agencyName,
  agencyLogoUrl,
  defaultName,
  accountEmail,
  defaultInterval,
}: CheckoutFormProps) {
  const [interval, setInterval] = useState<BillingInterval>(defaultInterval);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: defaultName,
      email: accountEmail,
      country: "US",
      zip: "",
      coupon: "",
    },
  });

  const price = interval === "yearly" ? plan.pricing.yearly : plan.pricing.monthly;
  const per = interval === "yearly" ? "yr" : "mo";
  const saving = yearlySavingMonths(tier);
  const couponEntered = Boolean(watch("coupon")?.trim());

  // ── Submit (logic unchanged) ───────────────────────────────────────────────
  async function onSubmit(values: CheckoutFormValues) {
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          interval,
          name: values.name,
          country: values.country,
          zip: values.zip || undefined,
          coupon: values.coupon || undefined,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!res.ok || !data?.url) {
        setFormError(
          data?.error ??
            (res.status >= 500
              ? "Our server is unavailable right now. Please try again in a moment."
              : "We couldn't start checkout. Please check your details and try again."),
        );
        setSubmitting(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setFormError("Network error — please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        {/* ─────────────────────────── Left column ─────────────────────────── */}
        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col"
        >
          {/* Brand header */}
          <div className="flex items-center gap-3">
            {agencyLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary external agency logo URL
              <img
                src={agencyLogoUrl}
                alt={agencyName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-md object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-gradient text-sm font-bold text-white">
                {agencyName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="leading-tight">
              <p className="text-sm text-muted-foreground">{agencyName}</p>
              <p className="font-medium">Sarion {plan.name}</p>
            </div>
          </div>

          <h1 className="mt-8 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Upgrade to <span className="text-brand-gradient">{plan.name}</span>
          </h1>
          <p className="mt-2 max-w-md text-muted-foreground">{plan.tagline}</p>

          {/* Pricing card */}
          <Card className="mt-8 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Billed {interval}
                </p>
                <p className="mt-1 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    ${price}
                  </span>
                  <span className="text-sm text-muted-foreground">/{per}</span>
                </p>
              </div>
              {plan.featured && (
                <Badge variant="info" className="gap-1">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Most popular
                </Badge>
              )}
            </div>

            {/* Interval toggle */}
            <div
              role="radiogroup"
              aria-label="Billing interval"
              className="mt-5 inline-flex rounded-md bg-muted p-1 text-sm"
            >
              {(["monthly", "yearly"] as const).map((opt) => {
                const active = interval === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setInterval(opt)}
                    className={cn(
                      "relative rounded-[4px] px-4 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="checkout-interval-pill"
                        className="absolute inset-0 rounded-[4px] bg-background shadow-sm"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative flex items-center gap-1">
                      {opt === "monthly" ? "Monthly" : "Yearly"}
                      {opt === "yearly" && saving > 0 && (
                        <span className="text-xs text-primary">
                          · {saving} mo free
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feature list */}
            <ul className="mt-6 space-y-3 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" aria-hidden />
                  </span>
                  <span className="text-foreground/90">{f}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Order summary */}
          <Card className="mt-5 p-6">
            <p className="text-sm font-semibold">Order summary</p>
            <dl className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Subtotal" value={`$${price}`} />
              <SummaryRow
                label="Discount"
                value={couponEntered ? "Applied at checkout" : "—"}
                muted
              />
              <SummaryRow label="Tax" value="Calculated at checkout" muted />
              <div className="!my-4 h-px bg-border" />
              <div className="flex items-center justify-between">
                <dt className="font-semibold">Today&apos;s total</dt>
                <dd className="flex items-baseline gap-1">
                  <span className="text-lg font-bold">${price}</span>
                  <span className="text-xs text-muted-foreground">+ tax</span>
                </dd>
              </div>
            </dl>
            <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Final tax and any discount are calculated securely by Lemon
              Squeezy, our merchant of record, on the next step.
            </p>
          </Card>

          {/* Trust badges */}
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <TrustItem icon={ShieldCheck} label="Secure checkout" />
            <TrustItem icon={Lock} label="SSL encrypted" />
            <TrustItem icon={ShieldCheck} label="PCI compliant" />
            <TrustItem icon={RefreshCw} label="Cancel anytime" />
            <TrustItem icon={Zap} label="Instant access" />
          </ul>
        </motion.aside>

        {/* ─────────────────────────── Right column ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.06 }}
        >
          <Card className="p-6 md:p-8 lg:sticky lg:top-16">
            <h2 className="font-heading text-xl font-bold tracking-tight">
              Complete your subscription
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;ll enter card details on the next secure step.
            </p>

            <form
              id={FORM_ID}
              onSubmit={handleSubmit(onSubmit)}
              className="mt-6 space-y-5"
              noValidate
            >
              <fieldset className="space-y-4" disabled={submitting}>
                <legend className="sr-only">Customer information</legend>

                <Field label="Full name" htmlFor="name" error={errors.name?.message}>
                  <Input
                    id="name"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    {...register("name")}
                  />
                </Field>

                <Field
                  label="Email"
                  htmlFor="email"
                  hint="Your subscription is billed to your account email."
                >
                  <Input
                    id="email"
                    type="email"
                    readOnly
                    aria-readonly="true"
                    className="cursor-not-allowed bg-muted text-muted-foreground"
                    {...register("email")}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Country"
                    htmlFor="country"
                    error={errors.country?.message}
                  >
                    <select
                      id="country"
                      aria-invalid={Boolean(errors.country)}
                      className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      )}
                      {...register("country")}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="ZIP / Postal code"
                    htmlFor="zip"
                    error={errors.zip?.message}
                  >
                    <Input id="zip" autoComplete="postal-code" {...register("zip")} />
                  </Field>
                </div>

                <Field
                  label="Coupon code"
                  htmlFor="coupon"
                  optional
                  hint="Validated on the next step."
                >
                  <Input id="coupon" placeholder="Optional" {...register("coupon")} />
                </Field>
              </fieldset>

              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  aria-live="assertive"
                  className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  {formError}
                </motion.div>
              )}

              <Button
                type="submit"
                variant="brand"
                size="lg"
                disabled={submitting}
                className="w-full transition-transform active:scale-[0.99]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden />
                    Redirecting to secure checkout…
                  </>
                ) : (
                  <>
                    <Lock aria-hidden />
                    Subscribe now · ${price}/{per}
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By subscribing you agree to our Terms. Payments are processed
                securely by Lemon Squeezy. We never see or store your card
                details.
              </p>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Mobile sticky CTA — submits the same form (logic unchanged) */}
      <div className="sticky bottom-0 z-10 border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <Button
          type="submit"
          form={FORM_ID}
          variant="brand"
          size="lg"
          disabled={submitting}
          className="w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Redirecting…
            </>
          ) : (
            <>
              <Lock aria-hidden />
              Subscribe · ${price}/{per}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Presentational helpers ───────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  children,
  error,
  hint,
  optional,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="flex items-center gap-2">
        {label}
        {optional && (
          <span className="text-xs font-normal text-muted-foreground">
            Optional
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={muted ? "text-muted-foreground" : "font-medium"}>{value}</dd>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
}) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </li>
  );
}

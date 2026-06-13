import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Logo } from "@/components/layout/logo";

// Auth screens (login/signup/reset) carry no SEO value — keep them out of the index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Brand panel (always dark bg → always use white logo) ── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient p-12 text-white lg:flex">
        {/* Decorative glow blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-white/5 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl"
        />

        {/* Logo — light artwork on the gradient panel */}
        <Link href="/" aria-label="Sarion home" className="relative z-10 inline-flex">
          <Logo variant="full" forceTheme="dark" priority className="h-11 w-auto" />
        </Link>

        {/* Headline */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight">
              Run your entire agency
              <br />
              from one place.
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-white/75">
              Sarion brings your clients, projects, invoices, and client portals
              together in one premium workspace.
            </p>
          </div>

          {/* Trust signals */}
          <ul className="space-y-3">
            {[
              "14-day free trial, no credit card required",
              "Full workspace access from day one",
              "Client portal included on every plan",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    className="h-3 w-3"
                    aria-hidden
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-white/50">
          © {new Date().getFullYear()} Sarion. All rights reserved.
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Back to home — visible on all screen sizes */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Back to home
            </Link>
          </div>

          {/* Mobile wordmark */}
          <div className="mb-8 lg:hidden">
            <Link href="/" aria-label="Sarion home" className="inline-flex">
              <Logo variant="full" priority className="h-9 w-auto" />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

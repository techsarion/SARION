import { Logo } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-brand-gradient p-12 text-white lg:flex">
        <Logo showWordmark className="[&_div]:bg-white/15 [&_span]:text-white" />
        <div className="space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            Run your entire agency from one place.
          </h2>
          <p className="max-w-md text-lg text-white/80">
            Sarion brings your clients, projects, and invoices together in one
            premium workspace — so you can work smarter and achieve more.
          </p>
        </div>
        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} Sarion. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

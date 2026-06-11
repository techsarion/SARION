"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { getNavItems } from "@/lib/nav-items";

interface SidebarProps {
  role: string;
  showUpgrade: boolean;
}

export function Sidebar({ role, showUpgrade }: SidebarProps) {
  const pathname = usePathname();
  const navItems = getNavItems(role);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" aria-label="Sarion home">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {showUpgrade && (
        <div className="m-3 rounded-xl border bg-secondary/60 p-4">
          <div className="mb-1.5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            <span className="text-sm font-semibold">Upgrade to Pro</span>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Unlock advanced features and grow your agency.
          </p>
          <Link
            href="/settings/billing"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Upgrade Now →
          </Link>
        </div>
      )}
    </aside>
  );
}

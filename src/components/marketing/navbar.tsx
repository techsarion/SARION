"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";

import { NAV_LINKS } from "@/lib/marketing/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { ThemeToggle } from "./theme-toggle";
import styles from "./navbar.module.css";

export interface NavUser {
  name: string;
  email: string;
}

function initialsOf(name: string, email: string): string {
  const base = name?.trim() || email;
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

/**
 * Marketing navbar — session-aware. The session cookie is shared across the
 * entire app (same origin), so login state set anywhere (dashboard, login page)
 * is reflected here. `initialUser` comes from the server layout so the first
 * paint already shows the correct state (no logged-out flash); `useSession`
 * then keeps it live across tabs and after logout.
 */
export function Navbar({ initialUser = null }: { initialUser?: NavUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  // Hydration-safe resolution:
  //  • While the client session is still loading (and on SSR / first paint),
  //    trust the server-provided `initialUser` — this is what kills the flash
  //    AND guarantees the server HTML matches the first client render.
  //  • Once `useSession` resolves, it becomes authoritative — so a logout in
  //    another tab correctly clears the (now-stale) initialUser here.
  const liveUser: NavUser | null = session?.user
    ? { name: session.user.name, email: session.user.email }
    : null;
  const user: NavUser | null = isPending ? initialUser : liveUser;
  const authed = Boolean(user);

  return (
    <header className={styles.navbar}>
      <div className={`mContainer ${styles.inner}`}>
        <Link
          href="/"
          className={styles.brand}
          onClick={() => setOpen(false)}
          aria-label="Sarion home"
        >
          <Image
            src="/light-theme-logo-SARION.png"
            alt="Sarion"
            width={244}
            height={80}
            priority
            className={`${styles.logo} ${styles.logoLight}`}
          />
          <Image
            src="/dark-theme-logo-SARION.png"
            alt="Sarion"
            width={211}
            height={80}
            priority
            className={`${styles.logo} ${styles.logoDark}`}
          />
        </Link>

        <nav className={styles.center}>
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={styles.link}
                data-active={active || undefined}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          {authed && user ? (
            <>
              <Link href="/dashboard" className={`mBtn mBtnGhost ${styles.login}`}>
                Dashboard
              </Link>
              <AccountMenu user={user} />
            </>
          ) : (
            <>
              <Link href="/login" className={`mBtn mBtnGhost ${styles.login}`}>
                Login
              </Link>
              <Link href="/signup" className="mBtn mBtnPrimary">
                Start Free Trial
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className={styles.mobile}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.mobileLink}
              data-active={pathname === link.href || undefined}
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className={styles.mobileRow}>
            <span className={styles.mobileLink}>Theme</span>
            <ThemeToggle />
          </div>

          {authed && user ? (
            <div className={styles.mobileActions}>
              <div className={styles.mobileIdentity}>
                <span className={styles.avatar} aria-hidden>
                  {initialsOf(user.name, user.email)}
                </span>
                <span className={styles.mobileIdentityText}>
                  <span className={styles.mobileName}>{user.name}</span>
                  <span className={styles.mobileEmail}>{user.email}</span>
                </span>
              </div>
              <Link
                href="/dashboard"
                className="mBtn mBtnPrimary"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="mBtn mBtnSecondary"
                onClick={() => setOpen(false)}
              >
                Account
              </Link>
              <LogoutButton
                className="mBtn mBtnSecondary"
                onDone={() => setOpen(false)}
              />
            </div>
          ) : (
            <div className={styles.mobileActions}>
              <Link
                href="/login"
                className="mBtn mBtnSecondary"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="mBtn mBtnPrimary"
                onClick={() => setOpen(false)}
              >
                Start Free Trial
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

// ── Account dropdown (desktop) ──────────────────────────────────────────────
function AccountMenu({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);
  const initials = initialsOf(user.name, user.email);

  return (
    <div className={styles.account}>
      <button
        type="button"
        className={styles.accountTrigger}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.avatar} aria-hidden>
          {initials}
        </span>
        <ChevronDown size={16} aria-hidden />
      </button>

      {open && (
        <>
          <div
            className={styles.accountBackdrop}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className={styles.accountMenu} role="menu">
            <div className={styles.accountHeader}>
              <p className={styles.accountName}>{user.name}</p>
              <p className={styles.accountEmail}>{user.email}</p>
            </div>
            <Link
              href="/dashboard"
              className={styles.accountItem}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={16} aria-hidden /> Dashboard
            </Link>
            <Link
              href="/settings"
              className={styles.accountItem}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Account settings
            </Link>
            <LogoutButton
              className={`${styles.accountItem} ${styles.accountLogout}`}
              onDone={() => setOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ── Shared logout control ───────────────────────────────────────────────────
function LogoutButton({
  className,
  onDone,
}: {
  className?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await authClient.signOut();
      onDone?.();
      // Refresh server components so the logged-out state propagates, then land
      // on the homepage.
      router.refresh();
      router.push("/");
    });
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleLogout}
      disabled={isPending}
    >
      <LogOut size={16} aria-hidden /> {isPending ? "Signing out…" : "Log out"}
    </button>
  );
}

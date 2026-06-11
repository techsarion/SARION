"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { NAV_LINKS } from "@/lib/marketing/navigation";
import { ThemeToggle } from "./theme-toggle";
import styles from "./navbar.module.css";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className={styles.navbar}>
      <div className={`mContainer ${styles.inner}`}>
        <Link
          href="/"
          className={styles.brand}
          onClick={() => setOpen(false)}
          aria-label="Sarion home"
        >
          {/* Theme-aware wordmark — CSS toggles which renders (no JS flash). */}
          <Image
            src="/light-theme-logo-SARION.png"
            alt="Sarion"
            width={122}
            height={40}
            priority
            className={`${styles.logo} ${styles.logoLight}`}
          />
          <Image
            src="/dark-theme-logo-SARION.png"
            alt="Sarion"
            width={105}
            height={40}
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
          <Link href="/login" className={`mBtn mBtnGhost ${styles.login}`}>
            Login
          </Link>
          <Link href="/signup" className="mBtn mBtnPrimary">
            Start Free Trial
          </Link>
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
        </div>
      )}
    </header>
  );
}

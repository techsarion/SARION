"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, X } from "lucide-react";

import styles from "./theme-toggle.module.css";

// Persist hint dismissal so we never nag a returning visitor.
const HINT_KEY = "sarion.theme-hint-dismissed";

/**
 * Marketing theme toggle. Uses the SAME next-themes context as the app (the
 * root ThemeProvider wraps every route group), so changing the theme here — or
 * anywhere in the app — updates the whole product. Mounted-guarded to avoid a
 * hydration mismatch on the icon.
 *
 * Since the site defaults to light, a small one-time bubble nudges visitors who
 * prefer dark mode toward the toggle. It auto-dismisses on first use and is
 * remembered via localStorage.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [showHint, setShowHint] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Only hint on light, and only if they haven't seen/dismissed it before.
    try {
      const dismissed = localStorage.getItem(HINT_KEY);
      if (!dismissed) {
        // Brief delay so it appears after the page settles, not on first paint.
        const t = setTimeout(() => setShowHint(true), 1400);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage unavailable (private mode) — just skip the hint.
    }
  }, []);

  const isDark = resolvedTheme === "dark";

  function dismissHint() {
    setShowHint(false);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      // ignore
    }
  }

  function handleToggle() {
    setTheme(isDark ? "light" : "dark");
    if (showHint) dismissHint();
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        aria-label={
          mounted && isDark ? "Switch to light theme" : "Switch to dark theme"
        }
        onClick={handleToggle}
      >
        {mounted ? (
          isDark ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )
        ) : (
          <span className={styles.placeholder} />
        )}
      </button>

      {mounted && showHint && !isDark && (
        <div className={styles.hint} role="status">
          <Moon size={14} className={styles.hintIcon} aria-hidden />
          <span className={styles.hintText}>Prefer dark? Switch here</span>
          <button
            type="button"
            className={styles.hintClose}
            aria-label="Dismiss"
            onClick={(e) => {
              e.stopPropagation();
              dismissHint();
            }}
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import styles from "./theme-toggle.module.css";

/**
 * Marketing theme toggle. Uses the SAME next-themes context as the app (the
 * root ThemeProvider wraps every route group), so changing the theme here — or
 * anywhere in the app — updates the whole product. Mounted-guarded to avoid a
 * hydration mismatch on the icon.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
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
  );
}

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * App theme provider. `attribute="class"` toggles the `.dark` class on <html>,
 * which our Tailwind tokens (globals.css) are built against. next-themes injects
 * a blocking script so the correct theme is applied before paint (no flash).
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

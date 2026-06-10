"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

/**
 * App-wide toast host. Mounted once in the authenticated layout. Follows the
 * active theme so toasts match light/dark.
 */
export function Toaster() {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme as "light" | "dark" | "system" | undefined}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "rounded-lg border bg-popover text-popover-foreground",
        },
      }}
    />
  );
}

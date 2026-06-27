"use client";

import { useEffect } from "react";

/**
 * Self-healing guard. Sarion ships NO service worker, but a stray one left over
 * from another app on the same localhost origin (or an old deploy) will hijack
 * this origin and serve stale JS chunks — surfacing as webpack's
 * "Cannot read properties of undefined (reading 'call')" on navigation.
 *
 * This unregisters any such worker and clears its caches. It's a no-op when none
 * exist, so it's safe to run unconditionally on every load.
 */
export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        if (regs.length === 0) return;
        regs.forEach((r) => r.unregister());
        if (typeof caches !== "undefined") {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
        }
      })
      .catch(() => {
        /* best-effort — never throw into the app */
      });
  }, []);

  return null;
}

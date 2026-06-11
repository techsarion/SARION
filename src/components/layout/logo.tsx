import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** "full" shows the wordmark logo; "icon" shows just the square mark. */
  variant?: "full" | "icon";
  /**
   * Force a specific artwork regardless of the active theme — use on colored
   * surfaces (e.g. the gradient auth panel) where theme-based swapping is wrong.
   * "dark" = the light-coloured artwork (for dark backgrounds).
   */
  forceTheme?: "light" | "dark";
  priority?: boolean;
}

// Brand assets live in /public. The "dark-theme" file is the light-coloured
// artwork meant for dark backgrounds, and vice-versa.
const ICON_SRC = "/SARION-ICON.png";
const FULL_LIGHT = { src: "/light-theme-logo-SARION.png", w: 1600, h: 523 };
const FULL_DARK = { src: "/dark-theme-logo-SARION.png", w: 1600, h: 607 };

/**
 * Sarion brand mark. Renders the real PNG logo and, by default, swaps between
 * the light/dark artwork with the active theme (via Tailwind `dark:` variants).
 */
export function Logo({
  className,
  variant = "full",
  forceTheme,
  priority,
}: LogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src={ICON_SRC}
        alt="Sarion"
        width={435}
        height={435}
        priority={priority}
        className={cn("h-9 w-9 object-contain", className)}
      />
    );
  }

  if (forceTheme) {
    const a = forceTheme === "dark" ? FULL_DARK : FULL_LIGHT;
    return (
      <Image
        src={a.src}
        alt="Sarion"
        width={a.w}
        height={a.h}
        priority={priority}
        className={cn("h-8 w-auto", className)}
      />
    );
  }

  return (
    <>
      <Image
        src={FULL_LIGHT.src}
        alt="Sarion"
        width={FULL_LIGHT.w}
        height={FULL_LIGHT.h}
        priority={priority}
        className={cn("h-8 w-auto dark:hidden", className)}
      />
      <Image
        src={FULL_DARK.src}
        alt="Sarion"
        width={FULL_DARK.w}
        height={FULL_DARK.h}
        priority={priority}
        className={cn("hidden h-8 w-auto dark:block", className)}
      />
    </>
  );
}

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

/**
 * Sarion brand mark — geometric "S" ribbon in the approved blue→cyan gradient.
 */
export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gradient shadow-sm">
        <span className="text-lg font-bold leading-none text-white">S</span>
      </div>
      {showWordmark && (
        <span className="text-xl font-bold tracking-tight text-foreground">
          sarion
        </span>
      )}
    </div>
  );
}

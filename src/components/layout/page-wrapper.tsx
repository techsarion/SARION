import { cn } from "@/lib/utils";

interface PageWrapperProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard content wrapper for authenticated pages — consistent page header
 * (title + description + optional action) and scrollable content area.
 */
export function PageWrapper({
  title,
  description,
  action,
  children,
  className,
}: PageWrapperProps) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="flex flex-col gap-1 border-b px-4 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="mt-3 sm:mt-0">{action}</div>}
      </div>
      <div className={cn("flex-1 p-4 lg:p-8", className)}>{children}</div>
    </div>
  );
}

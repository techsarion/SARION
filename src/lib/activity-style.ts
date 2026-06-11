import type { BadgeProps } from "@/components/ui/badge";

/**
 * Single source of truth for activity-type badge variants, shared by the
 * dashboard feed and the client/project activity trails. Unknown types fall
 * back to "secondary" at the call site.
 */
export const ACTIVITY_VARIANT: Record<string, BadgeProps["variant"]> = {
  "Client Created": "success",
  "Client Updated": "info",
  "Note Added": "secondary",
  "Client Archived": "warning",
  "Project Created": "success",
  "Project Updated": "info",
  "Status Changed": "info",
  "Project Archived": "warning",
  "Invoice Created": "success",
  "Invoice Updated": "info",
  "Invoice Paid": "success",
  "Invoice Unpaid": "warning",
  "Invoice Archived": "warning",
  "Team Member Invited": "info",
  "Portal Comment": "secondary",
  "Portal Viewed": "secondary",
};

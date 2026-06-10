import type { BadgeProps } from "@/components/ui/badge";

/** Display label + badge variant for each ProjectStatus enum value. */
export const PROJECT_STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planned",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

export const PROJECT_STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  PLANNED: "secondary",
  ACTIVE: "info",
  COMPLETED: "success",
  ON_HOLD: "warning",
};

export function statusLabel(status: string) {
  return PROJECT_STATUS_LABEL[status] ?? status;
}

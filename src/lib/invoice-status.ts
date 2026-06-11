import type { BadgeProps } from "@/components/ui/badge";

/**
 * Stored invoice statuses. `overdue` is NEVER persisted — it is computed
 * dynamically from (status === "unpaid" && dueDate < today). See isOverdue().
 */
export type InvoiceStatus = "paid" | "unpaid";

export const INVOICE_STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  unpaid: "Unpaid",
  overdue: "Overdue",
};

export const INVOICE_STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  paid: "success",
  unpaid: "warning",
  overdue: "destructive",
};

export function invoiceStatusLabel(status: string) {
  return INVOICE_STATUS_LABEL[status] ?? status;
}

/**
 * UI-only overdue computation — no stored state, no cron. An invoice is overdue
 * when it is still unpaid and its due date is strictly before today.
 */
export function isOverdue(status: string, dueDate: Date | null): boolean {
  if (status !== "unpaid" || !dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

/** Effective status for display — resolves to "overdue" when applicable. */
export function displayStatus(status: string, dueDate: Date | null): string {
  return isOverdue(status, dueDate) ? "overdue" : status;
}

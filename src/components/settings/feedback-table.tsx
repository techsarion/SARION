"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  updateFeedbackStatus,
  FEEDBACK_STATUSES,
} from "@/server/actions/feedback";

export interface FeedbackRow {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  authorName: string;
  createdAt: string; // pre-formatted on the server
}

const TYPE_LABELS: Record<string, string> = {
  feature_request: "Feature",
  bug_report: "Bug",
  general: "General",
};

const TYPE_VARIANTS: Record<string, "info" | "destructive" | "secondary"> = {
  feature_request: "info",
  bug_report: "destructive",
  general: "secondary",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_review: "In review",
  planned: "Planned",
  completed: "Completed",
  declined: "Declined",
};

export function FeedbackTable({ rows }: { rows: FeedbackRow[] }) {
  const [items, setItems] = useState(rows);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(id: string, status: string) {
    const previous = items;
    // Optimistic update.
    setItems((cur) => cur.map((r) => (r.id === id ? { ...r, status } : r)));
    startTransition(async () => {
      const res = await updateFeedbackStatus(
        id,
        status as (typeof FEEDBACK_STATUSES)[number],
      );
      if (!res.ok) {
        setItems(previous); // roll back
        toast.error(res.error);
      } else {
        toast.success("Status updated.");
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          No feedback yet. Submissions from your team will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Feedback</TableHead>
            <TableHead>From</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-40">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Badge variant={TYPE_VARIANTS[row.type] ?? "secondary"}>
                  {TYPE_LABELS[row.type] ?? row.type}
                </Badge>
              </TableCell>
              <TableCell className="max-w-md">
                <p className="font-medium">{row.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {row.description}
                </p>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {row.authorName}
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {row.createdAt}
              </TableCell>
              <TableCell>
                <select
                  value={row.status}
                  disabled={isPending}
                  onChange={(e) => handleStatusChange(row.id, e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  {FEEDBACK_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

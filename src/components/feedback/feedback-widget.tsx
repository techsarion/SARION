"use client";

import { useState } from "react";
import { MessageSquarePlus, Lightbulb, Bug, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  submitFeedback,
  type SubmitFeedbackInput,
} from "@/server/actions/feedback";

type FeedbackType = SubmitFeedbackInput["type"];

const TYPE_OPTIONS: {
  value: FeedbackType;
  label: string;
  icon: typeof Lightbulb;
}[] = [
  { value: "feature_request", label: "Feature request", icon: Lightbulb },
  { value: "bug_report", label: "Bug report", icon: Bug },
  { value: "general", label: "General", icon: MessageCircle },
];

/**
 * Floating feedback launcher, mounted in the authenticated app layout so it's
 * available on every workspace page. Opens a dialog to capture a typed
 * submission (feature request / bug / general) and persists it via the
 * submitFeedback server action.
 */
export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("feature_request");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setType("feature_request");
    setTitle("");
    setDescription("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitFeedback({ type, title, description });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Thanks for the feedback — we've logged it.");
      reset();
      setOpen(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Send feedback"
      >
        <MessageSquarePlus className="h-4 w-4" aria-hidden />
        Feedback
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send feedback</DialogTitle>
            <DialogDescription>
              Tell us what to build next, report a bug, or share a thought.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = type === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input text-muted-foreground hover:bg-accent",
                      )}
                      aria-pressed={active}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="feedback-title">Title</Label>
              <Input
                id="feedback-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short summary"
                maxLength={140}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="feedback-description">Details</Label>
              <Textarea
                id="feedback-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What happened, or what would you like to see?"
                rows={5}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send feedback"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

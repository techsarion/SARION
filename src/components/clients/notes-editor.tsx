"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { updateNotes } from "@/server/actions/clients";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NotesEditorProps {
  clientId: string;
  initialNotes: string;
}

export function NotesEditor({ clientId, initialNotes }: NotesEditorProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();

  const dirty = notes !== initialNotes;

  function handleSave() {
    startTransition(async () => {
      const result = await updateNotes(clientId, { notes });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Notes saved");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add internal notes about this client…"
        rows={5}
        disabled={isPending}
      />
      <div className="flex justify-end">
        <Button
          variant="brand"
          size="sm"
          onClick={handleSave}
          disabled={isPending || !dirty}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save notes
        </Button>
      </div>
    </div>
  );
}

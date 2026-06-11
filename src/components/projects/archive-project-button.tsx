"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, Loader2 } from "lucide-react";

import { archiveProject } from "@/server/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ArchiveProjectButtonProps {
  projectId: string;
  projectName: string;
}

export function ArchiveProjectButton({
  projectId,
  projectName,
}: ArchiveProjectButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveProject(projectId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Project archived");
      setOpen(false);
      router.push("/projects");
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Archive className="h-4 w-4" />
          Archive
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive {projectName}?</DialogTitle>
          <DialogDescription>
            This project will be hidden from your lists. Its history is preserved 
            and nothing is permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleArchive}
            disabled={isPending}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Archive project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

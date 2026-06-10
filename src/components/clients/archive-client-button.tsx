"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, Loader2 } from "lucide-react";

import { archiveClient } from "@/server/actions/clients";
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

interface ArchiveClientButtonProps {
  clientId: string;
  clientName: string;
}

export function ArchiveClientButton({
  clientId,
  clientName,
}: ArchiveClientButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveClient(clientId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Client archived");
      setOpen(false);
      router.push("/clients");
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
          <DialogTitle>Archive {clientName}?</DialogTitle>
          <DialogDescription>
            This client will be hidden from your lists. Their projects, invoices,
            and history are preserved and nothing is permanently deleted.
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
            Archive client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, Loader2 } from "lucide-react";

import { archiveInvoice } from "@/server/actions/invoices";
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

interface ArchiveInvoiceButtonProps {
  invoiceId: string;
  invoiceNumber: string;
}

export function ArchiveInvoiceButton({
  invoiceId,
  invoiceNumber,
}: ArchiveInvoiceButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveInvoice(invoiceId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Invoice archived");
      setOpen(false);
      router.push("/invoices");
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
          <DialogTitle>Archive {invoiceNumber}?</DialogTitle>
          <DialogDescription>
            This invoice will be hidden from your lists. Its history is preserved
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
            Archive invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

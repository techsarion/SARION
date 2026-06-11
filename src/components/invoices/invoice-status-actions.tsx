"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";

import { markInvoicePaid, markInvoiceUnpaid } from "@/server/actions/invoices";
import { Button } from "@/components/ui/button";

interface InvoiceStatusActionsProps {
  invoiceId: string;
  status: string;
}

/**
 * Mark Paid / Mark Unpaid toggle. UNPAID → shows "Mark Paid"; PAID → shows
 * "Mark Unpaid". No payment integrations — pure status flip.
 */
export function InvoiceStatusActions({
  invoiceId,
  status,
}: InvoiceStatusActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: "paid" | "unpaid") {
    startTransition(async () => {
      const result =
        action === "paid"
          ? await markInvoicePaid(invoiceId)
          : await markInvoiceUnpaid(invoiceId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(action === "paid" ? "Invoice marked paid" : "Invoice marked unpaid");
      router.refresh();
    });
  }

  if (status === "paid") {
    return (
      <Button variant="outline" onClick={() => run("unpaid")} disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4" />
        )}
        Mark Unpaid
      </Button>
    );
  }

  return (
    <Button variant="brand" onClick={() => run("paid")} disabled={isPending}>
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      Mark Paid
    </Button>
  );
}

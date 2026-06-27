"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RotateCcw, Loader2 } from "lucide-react";

import { restoreClient } from "@/server/actions/clients";
import { Button } from "@/components/ui/button";

interface RestoreClientButtonProps {
  clientId: string;
}

/**
 * Restore an archived client. Non-destructive, so no confirmation dialog — a
 * single action that reverses the archive and refreshes the list.
 */
export function RestoreClientButton({ clientId }: RestoreClientButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreClient(clientId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Client restored");
      router.refresh();
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRestore}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RotateCcw className="h-4 w-4" />
      )}
      Restore
    </Button>
  );
}

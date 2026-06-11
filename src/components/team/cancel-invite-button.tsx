"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

import { cancelInvite } from "@/server/actions/team";
import { Button } from "@/components/ui/button";

/** Owner-only cancel control for a pending invite. */
export function CancelInviteButton({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelInvite(inviteId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Invite cancelled");
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCancel}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <X className="h-4 w-4" />
      )}
      Cancel
    </Button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { addPortalComment } from "@/server/actions/portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PortalCommentFormProps {
  token: string;
  projectId: string;
}

/** Public (token-authenticated) comment form rendered per project in the portal. */
export function PortalCommentForm({ token, projectId }: PortalCommentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({ author: "", message: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    startTransition(async () => {
      const result = await addPortalComment(token, projectId, values);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      setValues({ author: "", message: "" });
      toast.success("Comment posted");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor={`author-${projectId}`} className="text-xs">
          Your name<span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Input
          id={`author-${projectId}`}
          value={values.author}
          onChange={(e) => setValues((v) => ({ ...v, author: e.target.value }))}
          placeholder="Your name"
          disabled={isPending}
          aria-invalid={fieldErrors.author ? true : undefined}
        />
        <FieldError errors={fieldErrors.author} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`message-${projectId}`} className="text-xs">
          Comment<span className="ml-0.5 text-destructive">*</span>
        </Label>
        <Textarea
          id={`message-${projectId}`}
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          placeholder="Share an update or question…"
          rows={3}
          disabled={isPending}
          aria-invalid={fieldErrors.message ? true : undefined}
        />
        <FieldError errors={fieldErrors.message} />
      </div>
      <Button type="submit" variant="brand" size="sm" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Post comment
      </Button>
    </form>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <>
      {errors.map((err) => (
        <p key={err} className="text-sm text-destructive">
          {err}
        </p>
      ))}
    </>
  );
}

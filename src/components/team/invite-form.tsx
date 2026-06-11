"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Copy, Check } from "lucide-react";

import { inviteTeamMember } from "@/server/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Owner-only invite form. No role selector — every invite is a member. On
 * success it surfaces a shareable signup link; the invitee joins the agency by
 * signing up with the invited email (matched in the auth hook).
 */
export function InviteForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({ name: "", email: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    startTransition(async () => {
      const result = await inviteTeamMember(values);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      const link = `${window.location.origin}/signup?invite=${encodeURIComponent(result.token)}`;
      setInviteLink(link);
      setValues({ name: "", email: "" });
      toast.success("Invite created");
      router.refresh();
    });
  }

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invite-name">
                Name<span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="invite-name"
                value={values.name}
                onChange={(e) =>
                  setValues((v) => ({ ...v, name: e.target.value }))
                }
                placeholder="Jane Doe"
                disabled={isPending}
                aria-invalid={fieldErrors.name ? true : undefined}
              />
              <FieldError errors={fieldErrors.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-email">
                Email<span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={values.email}
                onChange={(e) =>
                  setValues((v) => ({ ...v, email: e.target.value }))
                }
                placeholder="jane@example.com"
                disabled={isPending}
                aria-invalid={fieldErrors.email ? true : undefined}
              />
              <FieldError errors={fieldErrors.email} />
            </div>
          </div>

          <Button type="submit" variant="brand" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send invite
          </Button>
        </form>

        {inviteLink && (
          <div className="mt-4 rounded-lg border bg-secondary/40 p-4">
            <p className="text-sm font-medium">Invite created</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ask them to sign up at this link using the invited email — they
              &apos;ll join your agency as a member.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded border bg-background px-2 py-1 text-xs">
                {inviteLink}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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

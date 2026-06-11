"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { updateAgency } from "@/server/actions/agency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface AgencyBrandingFormProps {
  defaultValues: { name: string; logoUrl: string };
}

/** Edit agency name + logo URL (owner only). Branding flows to the portal. */
export function AgencyBrandingForm({ defaultValues }: AgencyBrandingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    startTransition(async () => {
      const result = await updateAgency({
        name: values.name,
        logoUrl: values.logoUrl || null,
      });
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      toast.success("Branding updated");
      router.refresh();
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">
              Agency name<span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) =>
                setValues((v) => ({ ...v, name: e.target.value }))
              }
              placeholder="Acme Agency"
              disabled={isPending}
              aria-invalid={fieldErrors.name ? true : undefined}
            />
            <FieldError errors={fieldErrors.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              value={values.logoUrl}
              onChange={(e) =>
                setValues((v) => ({ ...v, logoUrl: e.target.value }))
              }
              placeholder="https://example.com/logo.png"
              disabled={isPending}
              aria-invalid={fieldErrors.logoUrl ? true : undefined}
            />
            <p className="text-xs text-muted-foreground">
              Shown on your client portal header.
            </p>
            <FieldError errors={fieldErrors.logoUrl} />
          </div>

          {values.logoUrl.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={values.logoUrl}
              alt="Logo preview"
              className="h-12 w-auto rounded border bg-white object-contain p-1"
            />
          )}

          <Button type="submit" variant="brand" disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save branding
          </Button>
        </form>
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

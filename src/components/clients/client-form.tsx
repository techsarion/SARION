"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createClient, updateClient } from "@/server/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export interface ClientFormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
}

interface ClientFormProps {
  mode: "create" | "edit";
  clientId?: string;
  defaultValues?: Partial<ClientFormValues>;
}

const EMPTY: ClientFormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  notes: "",
};

export function ClientForm({ mode, clientId, defaultValues }: ClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<ClientFormValues>({
    ...EMPTY,
    ...defaultValues,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function set<K extends keyof ClientFormValues>(
    key: K,
    value: ClientFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createClient(values)
          : await updateClient(clientId!, values);

      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }

      toast.success(
        mode === "create" ? "Client created" : "Client updated",
      );
      router.push(`/clients/${result.clientId}`);
      router.refresh();
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Field
            id="name"
            label="Name"
            required
            value={values.name}
            onChange={(v) => set("name", v)}
            errors={fieldErrors.name}
            placeholder="Acme Marketing"
            disabled={isPending}
          />
          <Field
            id="company"
            label="Company"
            value={values.company}
            onChange={(v) => set("company", v)}
            errors={fieldErrors.company}
            placeholder="Acme Inc."
            disabled={isPending}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={(v) => set("email", v)}
              errors={fieldErrors.email}
              placeholder="hello@acme.com"
              disabled={isPending}
            />
            <Field
              id="phone"
              label="Phone"
              value={values.phone}
              onChange={(v) => set("phone", v)}
              errors={fieldErrors.phone}
              placeholder="+1 555 123 4567"
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Internal notes about this client…"
              rows={4}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="brand" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create client" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  errors?: string[];
}

function Field({
  id,
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  disabled,
  errors,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={errors ? true : undefined}
      />
      {errors?.map((err) => (
        <p key={err} className="text-sm text-destructive">
          {err}
        </p>
      ))}
    </div>
  );
}

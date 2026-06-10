"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createProject, updateProject } from "@/server/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ProjectFormValues {
  name: string;
  clientId: string;
  status: string;
  description: string;
  startDate: string;
  dueDate: string;
}

interface ClientOption {
  id: string;
  name: string;
}

interface ProjectFormProps {
  mode: "create" | "edit";
  clients: ClientOption[];
  projectId?: string;
  defaultValues?: Partial<ProjectFormValues>;
}

const STATUS_OPTIONS = [
  { value: "PLANNED", label: "Planned" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
];

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const EMPTY: ProjectFormValues = {
  name: "",
  clientId: "",
  status: "PLANNED",
  description: "",
  startDate: "",
  dueDate: "",
};

export function ProjectForm({
  mode,
  clients,
  projectId,
  defaultValues,
}: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<ProjectFormValues>({
    ...EMPTY,
    ...defaultValues,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function set<K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProject(values)
          : await updateProject(projectId!, values);

      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }

      toast.success(mode === "create" ? "Project created" : "Project updated");
      router.push(`/projects/${result.projectId}`);
      router.refresh();
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">
              Project name
              <span className="ml-0.5 text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Website Redesign"
              disabled={isPending}
              aria-invalid={fieldErrors.name ? true : undefined}
            />
            <FieldError errors={fieldErrors.name} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientId">
                Client<span className="ml-0.5 text-destructive">*</span>
              </Label>
              <select
                id="clientId"
                className={cn(selectClass)}
                value={values.clientId}
                onChange={(e) => set("clientId", e.target.value)}
                disabled={isPending}
                aria-invalid={fieldErrors.clientId ? true : undefined}
              >
                <option value="" disabled>
                  Select a client…
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <FieldError errors={fieldErrors.clientId} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Status<span className="ml-0.5 text-destructive">*</span>
              </Label>
              <select
                id="status"
                className={cn(selectClass)}
                value={values.status}
                onChange={(e) => set("status", e.target.value)}
                disabled={isPending}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <FieldError errors={fieldErrors.status} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                value={values.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={values.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What is this project about?"
              rows={4}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="brand" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create project" : "Save changes"}
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

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

import {
  createInvoice,
  updateInvoice,
  type InvoiceInput,
} from "@/server/actions/invoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ClientOption {
  id: string;
  name: string;
}

export interface InvoiceItemValue {
  description: string;
  qty: string;
  unitPrice: string;
}

export interface InvoiceFormValues {
  clientId: string;
  status: "paid" | "unpaid";
  issueDate: string;
  dueDate: string;
  items: InvoiceItemValue[];
}

interface InvoiceFormProps {
  mode: "create" | "edit";
  clients: ClientOption[];
  invoiceId?: string;
  defaultClientId?: string;
  defaultValues?: Partial<InvoiceFormValues>;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_ITEM: InvoiceItemValue = { description: "", qty: "1", unitPrice: "0" };

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(n) ? n : 0);
}

export function InvoiceForm({
  mode,
  clients,
  invoiceId,
  defaultClientId,
  defaultValues,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [values, setValues] = useState<InvoiceFormValues>({
    clientId: defaultValues?.clientId ?? defaultClientId ?? "",
    status: defaultValues?.status ?? "unpaid",
    issueDate: defaultValues?.issueDate ?? today(),
    dueDate: defaultValues?.dueDate ?? "",
    items:
      defaultValues?.items && defaultValues.items.length > 0
        ? defaultValues.items
        : [{ ...EMPTY_ITEM }],
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function set<K extends keyof InvoiceFormValues>(
    key: K,
    value: InvoiceFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setItem(index: number, patch: Partial<InvoiceItemValue>) {
    setValues((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
  }

  function addItem() {
    setValues((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
  }

  function removeItem(index: number) {
    setValues((prev) => ({
      ...prev,
      items:
        prev.items.length === 1
          ? prev.items
          : prev.items.filter((_, i) => i !== index),
    }));
  }

  const lineTotals = useMemo(
    () =>
      values.items.map((it) => {
        const qty = parseFloat(it.qty);
        const price = parseFloat(it.unitPrice);
        const total = (Number.isFinite(qty) ? qty : 0) * (Number.isFinite(price) ? price : 0);
        return Math.round(total * 100) / 100;
      }),
    [values.items],
  );

  const invoiceTotal = useMemo(
    () => Math.round(lineTotals.reduce((s, n) => s + n, 0) * 100) / 100,
    [lineTotals],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const payload: InvoiceInput = {
      clientId: values.clientId,
      status: values.status,
      issueDate: values.issueDate,
      dueDate: values.dueDate || null,
      items: values.items.map((it) => ({
        description: it.description,
        qty: it.qty,
        unitPrice: it.unitPrice,
      })),
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createInvoice(payload)
          : await updateInvoice(invoiceId!, payload);

      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }

      toast.success(mode === "create" ? "Invoice created" : "Invoice updated");
      router.push(`/invoices/${result.invoiceId}`);
      router.refresh();
    });
  }

  return (
    <Card className="max-w-3xl">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Header fields */}
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
                onChange={(e) => set("status", e.target.value as "paid" | "unpaid")}
                disabled={isPending}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
              <FieldError errors={fieldErrors.status} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">
                Issue date<span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={values.issueDate}
                onChange={(e) => set("issueDate", e.target.value)}
                disabled={isPending}
                aria-invalid={fieldErrors.issueDate ? true : undefined}
              />
              <FieldError errors={fieldErrors.issueDate} />
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

          {/* Line items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Line items<span className="ml-0.5 text-destructive">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                disabled={isPending}
              >
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            </div>

            <FieldError errors={fieldErrors.items} />

            <div className="space-y-3">
              {values.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 items-start gap-2 rounded-lg border p-3"
                >
                  <div className="col-span-12 space-y-1 sm:col-span-6">
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        setItem(index, { description: e.target.value })
                      }
                      placeholder="Design services"
                      disabled={isPending}
                    />
                  </div>
                  <div className="col-span-4 space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={item.qty}
                      onChange={(e) => setItem(index, { qty: e.target.value })}
                      disabled={isPending}
                    />
                  </div>
                  <div className="col-span-4 space-y-1 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">
                      Unit price
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        setItem(index, { unitPrice: e.target.value })
                      }
                      disabled={isPending}
                    />
                  </div>
                  <div className="col-span-3 space-y-1 sm:col-span-1">
                    <Label className="text-xs text-muted-foreground">Total</Label>
                    <p className="flex h-10 items-center text-sm font-medium tabular-nums">
                      {formatMoney(lineTotals[index])}
                    </p>
                  </div>
                  <div className="col-span-1 flex h-full items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={isPending || values.items.length === 1}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total — read-only, auto-calculated */}
          <div className="flex items-center justify-end gap-6 border-t pt-4">
            <span className="text-sm font-medium text-muted-foreground">
              Invoice total
            </span>
            <span className="text-2xl font-semibold tabular-nums">
              {formatMoney(invoiceTotal)}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="brand" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create invoice" : "Save changes"}
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

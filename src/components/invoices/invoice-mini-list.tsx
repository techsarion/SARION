import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  INVOICE_STATUS_VARIANT,
  invoiceStatusLabel,
  displayStatus,
} from "@/lib/invoice-status";

export interface MiniInvoice {
  id: string;
  number: string;
  status: string;
  total: number;
  dueDate: Date | null;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

/**
 * Compact invoice list used in the client and project detail sidebars. Pure
 * presentation — shows number, computed status badge (resolves Overdue), and
 * total, linking to the full invoice detail page. Newest-first ordering is the
 * caller's responsibility.
 */
export function InvoiceMiniList({ invoices }: { invoices: MiniInvoice[] }) {
  return (
    <ul className="divide-y">
      {invoices.map((invoice) => {
        const shown = displayStatus(invoice.status, invoice.dueDate);
        return (
          <li key={invoice.id}>
            <Link
              href={`/invoices/${invoice.id}`}
              className="flex items-center justify-between gap-3 py-3 hover:text-primary"
            >
              <span className="font-medium">{invoice.number}</span>
              <span className="flex items-center gap-3">
                <Badge variant={INVOICE_STATUS_VARIANT[shown]}>
                  {invoiceStatusLabel(shown)}
                </Badge>
                <span className="tabular-nums">
                  {formatMoney(invoice.total)}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

'use client';

import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { useInvoices } from '@/hooks/useQueries';
import { WidgetShell } from '../WidgetShell';
import { useWidgetContext } from '../widget-context';
import { WIDGETS } from '../registry';

interface InvoiceRow {
  id: number;
  number?: string;
  clientName?: string;
  client_name?: string;
  status?: string;
  total?: number;
  amount?: number;
  currency?: string;
  dueDate?: string | null;
  due_date?: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  paid: 'text-success bg-success-soft',
  sent: 'text-[hsl(var(--info))] bg-info-soft',
  overdue: 'text-[hsl(var(--danger))] bg-[hsl(var(--danger-soft))]',
  draft: 'text-text-secondary bg-surface-muted',
};

export default function RecentInvoicesWidget() {
  const { editMode, onHide, onResetSize } = useWidgetContext();
  const meta = WIDGETS.find((w) => w.id === 'recent-invoices')!;
  const { data, isLoading, isError, refetch } = useInvoices();

  const items = ((data ?? []) as InvoiceRow[]).slice(0, 7);

  return (
    <WidgetShell
      meta={meta}
      editMode={editMode}
      loading={isLoading}
      error={isError || undefined}
      isEmpty={!isLoading && items.length === 0}
      emptyIcon={<Receipt className="h-5 w-5" />}
      emptyTitle="No invoices"
      emptyDescription="Draft your first invoice to start tracking payments."
      onHide={onHide}
      onResetSize={onResetSize}
      onRetry={() => refetch()}
      action={
        <Link
          href="/dashboard/invoices"
          className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-tertiary hover:text-text-primary"
        >
          All
        </Link>
      }
    >
      <ul className="flex flex-1 flex-col divide-y divide-[var(--line)] overflow-y-auto">
        {items.map((inv) => {
          const amount = inv.total ?? inv.amount ?? 0;
          const currency = inv.currency ?? 'USD';
          const status = (inv.status ?? 'draft').toLowerCase();
          const client = inv.clientName ?? inv.client_name ?? 'Client';
          return (
            <li key={inv.id} className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-text-primary">
                  {inv.number ? `#${inv.number}` : `Invoice ${inv.id}`} · {client}
                </div>
                <div className="text-[11px] text-text-tertiary">
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount)}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                  STATUS_STYLES[status] ?? STATUS_STYLES.draft
                }`}
              >
                {status}
              </span>
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}

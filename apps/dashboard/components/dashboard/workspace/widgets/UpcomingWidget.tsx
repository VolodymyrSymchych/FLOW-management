'use client';

import { CalendarDays } from 'lucide-react';
import { useTasks } from '@/hooks/useQueries';
import { WidgetShell } from '../WidgetShell';
import { useWidgetContext } from '../widget-context';
import { WIDGETS } from '../registry';

interface TaskRow {
  id: number;
  title: string;
  dueDate?: string | null;
  due_date?: string | null;
  status?: string;
}

function daysFromNow(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  d.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

export default function UpcomingWidget() {
  const { editMode, onHide, onResetSize } = useWidgetContext();
  const meta = WIDGETS.find((w) => w.id === 'upcoming')!;
  const { data, isLoading, isError, refetch } = useTasks();

  const items = ((data ?? []) as TaskRow[])
    .map((t) => ({ t, due: t.dueDate ?? t.due_date }))
    .filter((x): x is { t: TaskRow; due: string } => {
      if (!x.due) return false;
      const n = daysFromNow(x.due);
      return n >= 0 && n <= 7 && x.t.status !== 'done' && x.t.status !== 'completed';
    })
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 8);

  return (
    <WidgetShell
      meta={meta}
      editMode={editMode}
      loading={isLoading}
      error={isError || undefined}
      isEmpty={!isLoading && items.length === 0}
      emptyIcon={<CalendarDays className="h-5 w-5" />}
      emptyTitle="Clear week"
      emptyDescription="Nothing scheduled in the next 7 days."
      onHide={onHide}
      onResetSize={onResetSize}
      onRetry={() => refetch()}
    >
      <ul className="flex flex-1 flex-col divide-y divide-[var(--line)] overflow-y-auto">
        {items.map(({ t, due }) => {
          const n = daysFromNow(due);
          const label = n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `in ${n}d`;
          return (
            <li key={t.id} className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md bg-accent-soft text-primary">
                <span className="text-[10px] font-semibold uppercase leading-none">
                  {new Date(due).toLocaleDateString(undefined, { month: 'short' })}
                </span>
                <span className="text-[13px] font-bold leading-tight">
                  {new Date(due).getDate()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-text-primary">{t.title}</div>
                <div className="text-[11px] text-text-tertiary">{label}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}

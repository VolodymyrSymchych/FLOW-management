'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { useTasks } from '@/hooks/useQueries';
import { WidgetShell } from '../WidgetShell';
import { useWidgetContext } from '../widget-context';
import { WIDGETS } from '../registry';

interface TaskRow {
  id: number;
  title: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  due_date?: string | null;
}

function isToday(iso?: string | null) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isOverdue(iso?: string | null) {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now() && !isToday(iso);
}

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-[hsl(var(--danger))]',
  medium: 'bg-warning',
  low: 'bg-success',
};

export default function TasksTodayWidget() {
  const { editMode, onHide, onResetSize } = useWidgetContext();
  const meta = WIDGETS.find((w) => w.id === 'tasks-today')!;
  const { data, isLoading, isError, refetch } = useTasks();

  const tasks = ((data ?? []) as TaskRow[])
    .filter((t) => t.status !== 'done' && t.status !== 'completed')
    .filter((t) => isToday(t.dueDate ?? t.due_date) || isOverdue(t.dueDate ?? t.due_date))
    .slice(0, 8);

  return (
    <WidgetShell
      meta={meta}
      editMode={editMode}
      loading={isLoading}
      error={isError || undefined}
      isEmpty={!isLoading && tasks.length === 0}
      emptyIcon={<ListTodo className="h-5 w-5" />}
      emptyTitle="Nothing due today"
      emptyDescription="Enjoy the calm, or plan ahead from the task board."
      onHide={onHide}
      onResetSize={onResetSize}
      onRetry={() => refetch()}
      action={
        <Link
          href="/dashboard/tasks"
          className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-tertiary hover:text-text-primary"
        >
          All tasks
        </Link>
      }
    >
      <ul className="flex flex-1 flex-col divide-y divide-[var(--line)] overflow-y-auto">
        {tasks.map((t) => {
          const due = t.dueDate ?? t.due_date;
          const overdue = isOverdue(due);
          return (
            <li key={t.id} className="flex items-center gap-2.5 px-3 py-2.5">
              <Circle className="h-4 w-4 shrink-0 text-text-tertiary" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-text-primary">{t.title}</div>
                <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[t.priority ?? ''] ?? 'bg-[hsl(var(--border))]'}`}
                  />
                  <span>{t.priority ?? 'normal'}</span>
                  <span>·</span>
                  <span className={overdue ? 'text-[hsl(var(--danger))]' : ''}>
                    {overdue ? 'Overdue' : 'Today'}
                  </span>
                </div>
              </div>
              {t.status === 'in_progress' ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              ) : null}
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}

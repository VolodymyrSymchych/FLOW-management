'use client';

import { Columns3 } from 'lucide-react';
import { useTasks } from '@/hooks/useQueries';
import { WidgetShell } from '../WidgetShell';
import { useWidgetContext } from '../widget-context';
import { WIDGETS } from '../registry';

interface TaskRow {
  id: number;
  title: string;
  status?: string;
}

const LANES: { key: string; label: string; dot: string }[] = [
  { key: 'todo', label: 'Plan', dot: 'bg-warning' },
  { key: 'in_progress', label: 'Build', dot: 'bg-primary' },
  { key: 'review', label: 'Review', dot: 'bg-[hsl(var(--info))]' },
  { key: 'done', label: 'Ship', dot: 'bg-success' },
];

function groupByStatus(tasks: TaskRow[]) {
  const map: Record<string, TaskRow[]> = { todo: [], in_progress: [], review: [], done: [] };
  for (const t of tasks) {
    const key = (t.status ?? 'todo').toLowerCase();
    if (key.includes('progress')) map.in_progress.push(t);
    else if (key.includes('review')) map.review.push(t);
    else if (key.includes('done') || key.includes('complet') || key.includes('ship')) map.done.push(t);
    else map.todo.push(t);
  }
  return map;
}

export default function DeliveryBoardWidget() {
  const { editMode, onHide, onResetSize } = useWidgetContext();
  const meta = WIDGETS.find((w) => w.id === 'delivery-board')!;
  const { data, isLoading, isError, refetch } = useTasks();

  const tasks = (data ?? []) as TaskRow[];
  const grouped = groupByStatus(tasks);

  return (
    <WidgetShell
      meta={meta}
      editMode={editMode}
      loading={isLoading}
      error={isError || undefined}
      isEmpty={!isLoading && tasks.length === 0}
      emptyIcon={<Columns3 className="h-5 w-5" />}
      emptyTitle="No tasks yet"
      emptyDescription="Create tasks to see them on the delivery board."
      onHide={onHide}
      onResetSize={onResetSize}
      onRetry={() => refetch()}
    >
      <div className="grid flex-1 grid-cols-4 gap-2 overflow-hidden p-3">
        {LANES.map((lane) => {
          const items = grouped[lane.key] ?? [];
          return (
            <div
              key={lane.key}
              className="flex min-h-0 flex-col rounded-[10px] border border-[var(--line)] bg-[hsl(var(--surface-muted))]/60"
            >
              <div className="flex items-center justify-between px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${lane.dot}`} />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                    {lane.label}
                  </span>
                </div>
                <span className="text-[11px] text-text-tertiary">{items.length}</span>
              </div>
              <div className="flex-1 space-y-1.5 overflow-y-auto px-2 pb-2">
                {items.slice(0, 6).map((t) => (
                  <div
                    key={t.id}
                    className="rounded-md border border-[var(--line)] bg-[hsl(var(--surface))] px-2 py-1.5 text-[12px] text-text-primary shadow-[var(--shadow-subtle)]"
                  >
                    <div className="truncate">{t.title}</div>
                  </div>
                ))}
                {items.length === 0 ? (
                  <div className="px-1 text-[11px] text-text-tertiary">—</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}

'use client';

import { Activity } from 'lucide-react';
import { useTasks } from '@/hooks/useQueries';
import { WidgetShell } from '../WidgetShell';
import { useWidgetContext } from '../widget-context';
import { WIDGETS } from '../registry';

interface TaskRow {
  id: number;
  title: string;
  status?: string;
  updatedAt?: string;
  assigneeName?: string;
  assignee_name?: string;
}

function relativeTime(iso?: string) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export default function ActivityFeedWidget() {
  const { editMode, onHide, onResetSize } = useWidgetContext();
  const meta = WIDGETS.find((w) => w.id === 'activity-feed')!;
  const { data, isLoading, isError, refetch } = useTasks();

  const items = ((data ?? []) as TaskRow[])
    .filter((t) => !!t.updatedAt)
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    .slice(0, 10);

  return (
    <WidgetShell
      meta={meta}
      editMode={editMode}
      loading={isLoading}
      error={isError || undefined}
      isEmpty={!isLoading && items.length === 0}
      emptyIcon={<Activity className="h-5 w-5" />}
      emptyTitle="Quiet for now"
      emptyDescription="Activity shows up as tasks progress."
      onHide={onHide}
      onResetSize={onResetSize}
      onRetry={() => refetch()}
    >
      <ul className="flex flex-1 flex-col divide-y divide-[var(--line)] overflow-y-auto">
        {items.map((t) => {
          const who = t.assigneeName ?? t.assignee_name ?? 'Someone';
          const verb =
            t.status === 'done' || t.status === 'completed'
              ? 'completed'
              : t.status === 'in_progress'
                ? 'is working on'
                : t.status === 'review'
                  ? 'sent for review'
                  : 'updated';
          return (
            <li key={t.id} className="flex items-start gap-2.5 px-3 py-2.5">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[10px] font-semibold text-text-secondary">
                {who.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] text-text-primary">
                  <span className="font-medium">{who}</span> <span className="text-text-secondary">{verb}</span>{' '}
                  <span className="font-medium">{t.title}</span>
                </div>
                <div className="text-[11px] text-text-tertiary">{relativeTime(t.updatedAt)}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}

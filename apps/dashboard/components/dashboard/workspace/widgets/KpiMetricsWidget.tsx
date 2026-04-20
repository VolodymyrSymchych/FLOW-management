'use client';

import { Activity, CheckCircle2, FolderKanban, Target } from 'lucide-react';
import { useDashboardData } from '@/hooks/useQueries';
import { WidgetShell } from '../WidgetShell';
import { useWidgetContext } from '../widget-context';
import { WIDGETS } from '../registry';

export default function KpiMetricsWidget() {
  const { editMode, onHide, onResetSize } = useWidgetContext();
  const { data, isLoading, isError, refetch } = useDashboardData();
  const meta = WIDGETS.find((w) => w.id === 'kpi-metrics')!;

  const stats = data?.stats;
  const tiles = [
    {
      label: 'Projects in progress',
      value: stats?.projects_in_progress ?? 0,
      icon: FolderKanban,
      tone: 'text-primary bg-accent-soft',
    },
    {
      label: 'Completed',
      value: stats?.projects_completed ?? 0,
      icon: CheckCircle2,
      tone: 'text-success bg-success-soft',
    },
    {
      label: 'Total',
      value: stats?.total_projects ?? 0,
      icon: Target,
      tone: 'text-[hsl(var(--info))] bg-info-soft',
    },
    {
      label: 'Completion rate',
      value: `${stats?.completion_rate ?? 0}%`,
      icon: Activity,
      tone: 'text-warning bg-warning-soft',
    },
  ];

  return (
    <WidgetShell
      meta={meta}
      editMode={editMode}
      loading={isLoading}
      error={isError ? true : undefined}
      isEmpty={!isLoading && !stats}
      emptyTitle="No stats yet"
      emptyDescription="Metrics appear as soon as your team has activity."
      onHide={onHide}
      onResetSize={onResetSize}
      onRetry={() => refetch()}
    >
      <div className="grid h-full grid-cols-2 gap-2 p-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.label}
              className="flex flex-col justify-between rounded-[10px] border border-[var(--line)] bg-[hsl(var(--surface-muted))] p-3"
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-md ${t.tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-2">
                <div className="text-xl font-semibold tracking-tight text-text-primary">{t.value}</div>
                <div className="text-[11px] text-text-tertiary">{t.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </WidgetShell>
  );
}

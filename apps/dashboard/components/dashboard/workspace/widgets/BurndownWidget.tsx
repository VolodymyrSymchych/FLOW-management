'use client';

import { useMemo } from 'react';
import { TrendingDown } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTasks } from '@/hooks/useQueries';
import { WidgetShell } from '../WidgetShell';
import { useWidgetContext } from '../widget-context';
import { WIDGETS } from '../registry';

interface TaskRow {
  id: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

function buildBurndown(tasks: TaskRow[]) {
  const days = 14;
  const now = new Date();
  const total = tasks.length;
  const points: { day: string; remaining: number; ideal: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const cutoff = d.getTime() + 24 * 60 * 60 * 1000;
    const completedByDay = tasks.filter((t) => {
      if (!(t.status === 'done' || t.status === 'completed')) return false;
      const ts = t.updatedAt ? new Date(t.updatedAt).getTime() : 0;
      return ts <= cutoff;
    }).length;
    points.push({
      day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      remaining: Math.max(total - completedByDay, 0),
      ideal: Math.max(total - Math.round((total * (days - 1 - i)) / Math.max(days - 1, 1)), 0),
    });
  }
  return points;
}

export default function BurndownWidget() {
  const { editMode, onHide, onResetSize } = useWidgetContext();
  const meta = WIDGETS.find((w) => w.id === 'burndown')!;
  const { data, isLoading, isError, refetch } = useTasks();

  const points = useMemo(() => buildBurndown((data ?? []) as TaskRow[]), [data]);
  const empty = !isLoading && (data ?? []).length === 0;

  return (
    <WidgetShell
      meta={meta}
      editMode={editMode}
      loading={isLoading}
      error={isError || undefined}
      isEmpty={empty}
      emptyIcon={<TrendingDown className="h-5 w-5" />}
      emptyTitle="No burndown yet"
      emptyDescription="Add tasks to see your 14-day trend."
      onHide={onHide}
      onResetSize={onResetSize}
      onRetry={() => refetch()}
    >
      <div className="flex-1 px-1 pb-1 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="burndown-accent" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--text-tertiary))' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--text-tertiary))' }} axisLine={false} tickLine={false} width={24} />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--border))' }}
              contentStyle={{
                background: 'hsl(var(--surface-elevated))',
                border: '1px solid var(--line-strong)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="ideal"
              stroke="hsl(var(--text-tertiary))"
              strokeDasharray="4 3"
              fill="transparent"
              strokeWidth={1}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="remaining"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#burndown-accent)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetShell>
  );
}

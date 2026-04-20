'use client';

import { Users } from 'lucide-react';
import { useAttendance } from '@/hooks/useQueries';
import { WidgetShell } from '../WidgetShell';
import { useWidgetContext } from '../widget-context';
import { WIDGETS } from '../registry';

interface AttendanceRow {
  id?: number;
  userId?: number;
  userName?: string;
  user_name?: string;
  status?: string;
  hours?: number;
  minutes?: number;
  date?: string;
}

function isTodayIso(iso?: string) {
  if (!iso) return false;
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export default function TeamPulseWidget() {
  const { editMode, onHide, onResetSize } = useWidgetContext();
  const meta = WIDGETS.find((w) => w.id === 'team-pulse')!;
  const { data, isLoading, isError, refetch } = useAttendance();

  const entries = (data ?? []) as AttendanceRow[];
  const today = entries.filter((e) => isTodayIso(e.date));

  const aggregate = new Map<string, { name: string; minutes: number; status: string }>();
  for (const e of today) {
    const name = e.userName ?? e.user_name ?? `User ${e.userId ?? ''}`;
    const minutes = (e.hours ?? 0) * 60 + (e.minutes ?? 0);
    const prev = aggregate.get(name);
    aggregate.set(name, {
      name,
      minutes: (prev?.minutes ?? 0) + minutes,
      status: e.status ?? prev?.status ?? 'active',
    });
  }

  const rows = [...aggregate.values()].sort((a, b) => b.minutes - a.minutes).slice(0, 6);

  return (
    <WidgetShell
      meta={meta}
      editMode={editMode}
      loading={isLoading}
      error={isError || undefined}
      isEmpty={!isLoading && rows.length === 0}
      emptyIcon={<Users className="h-5 w-5" />}
      emptyTitle="No check-ins yet"
      emptyDescription="Team hours appear here as they log time."
      onHide={onHide}
      onResetSize={onResetSize}
      onRetry={() => refetch()}
    >
      <ul className="flex flex-1 flex-col divide-y divide-[var(--line)] overflow-y-auto">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center gap-2.5 px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-primary">
              {r.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-text-primary">{r.name}</div>
              <div className="text-[11px] text-text-tertiary capitalize">{r.status}</div>
            </div>
            <div className="text-[12px] font-semibold tabular-nums text-text-primary">
              {Math.floor(r.minutes / 60)}h {r.minutes % 60}m
            </div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}

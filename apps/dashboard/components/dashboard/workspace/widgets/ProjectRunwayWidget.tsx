'use client';

import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { useProjects } from '@/hooks/useQueries';
import { WidgetShell } from '../WidgetShell';
import { useWidgetContext } from '../widget-context';
import { WIDGETS } from '../registry';

interface ProjectRow {
  id: number;
  name: string;
  status?: string;
  score?: number | null;
  riskLevel?: string | null;
  risk_level?: string | null;
}

const TONES: Record<string, string> = {
  low: 'bg-success',
  medium: 'bg-warning',
  high: 'bg-[hsl(var(--danger))]',
};

export default function ProjectRunwayWidget() {
  const { editMode, onHide, onResetSize } = useWidgetContext();
  const meta = WIDGETS.find((w) => w.id === 'project-runway')!;
  const { data, isLoading, isError, refetch } = useProjects();

  const projects = ((data ?? []) as ProjectRow[])
    .filter((p) => (p.status ?? '').toLowerCase() !== 'completed')
    .slice(0, 6);

  return (
    <WidgetShell
      meta={meta}
      editMode={editMode}
      loading={isLoading}
      error={isError || undefined}
      isEmpty={!isLoading && projects.length === 0}
      emptyIcon={<FolderKanban className="h-5 w-5" />}
      emptyTitle="No active projects"
      emptyDescription="Start a project to see its runway."
      onHide={onHide}
      onResetSize={onResetSize}
      onRetry={() => refetch()}
    >
      <ul className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3">
        {projects.map((p) => {
          const progress = Math.max(0, Math.min(100, Math.round(p.score ?? 0)));
          const risk = (p.riskLevel ?? p.risk_level ?? 'low').toLowerCase();
          return (
            <Link
              key={p.id}
              href={`/dashboard/projects/${p.id}`}
              className="group block rounded-[10px] border border-[var(--line)] bg-[hsl(var(--surface-muted))]/50 px-3 py-2 transition-colors hover:border-[var(--line-strong)] hover:bg-[hsl(var(--surface-muted))]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 truncate text-[13px] font-medium text-text-primary group-hover:text-primary">
                  {p.name}
                </div>
                <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-text-tertiary">
                  {risk} risk
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--border))]/40">
                  <div
                    className={`h-full ${TONES[risk] ?? 'bg-primary'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[11px] tabular-nums text-text-tertiary">{progress}%</span>
              </div>
            </Link>
          );
        })}
      </ul>
    </WidgetShell>
  );
}

'use client';

import { type ReactNode } from 'react';
import { AlertTriangle, EyeOff, GripVertical, MoreHorizontal, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import type { WidgetId, WidgetMeta } from './types';

export interface WidgetShellProps {
  meta: WidgetMeta;
  editMode?: boolean;
  loading?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  action?: ReactNode;
  onHide?: (id: WidgetId) => void;
  onResetSize?: (id: WidgetId) => void;
  onRetry?: () => void;
  children: ReactNode;
}

const TONE_BG: Record<WidgetMeta['tone'], string> = {
  accent: 'bg-accent-soft text-primary',
  sage: 'bg-success-soft text-success',
  amber: 'bg-warning-soft text-warning',
  violet: 'bg-[hsl(var(--info-soft))] text-[hsl(var(--info))]',
  blue: 'bg-info-soft text-[hsl(var(--info))]',
  neutral: 'bg-surface-muted text-text-secondary',
};

export function WidgetShell({
  meta,
  editMode,
  loading,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  action,
  onHide,
  onResetSize,
  onRetry,
  children,
}: WidgetShellProps) {
  return (
    <div
      className={cn(
        'group/widget surface-panel relative flex h-full flex-col overflow-hidden rounded-[14px]',
        editMode && 'ring-1 ring-dashed ring-accent/40',
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {editMode ? (
            <button
              type="button"
              aria-label="Drag widget"
              className="widget-drag-handle -ml-1 flex h-7 w-7 shrink-0 cursor-grab items-center justify-center rounded-md text-text-tertiary hover:bg-surface-muted active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          ) : null}
          <span
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold uppercase tracking-[0.14em]',
              TONE_BG[meta.tone],
            )}
            aria-hidden
          >
            {meta.title.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[13px] font-semibold text-text-primary">{meta.title}</h3>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          {editMode && (onHide || onResetSize) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-muted hover:text-text-primary"
                  aria-label="Widget menu"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {onResetSize ? (
                  <DropdownMenuItem onSelect={() => onResetSize(meta.id)}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset size
                  </DropdownMenuItem>
                ) : null}
                {onHide ? (
                  <DropdownMenuItem onSelect={() => onHide(meta.id)}>
                    <EyeOff className="mr-2 h-4 w-4" /> Hide widget
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        {error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-[hsl(var(--danger))]" />
            <p className="text-xs text-text-secondary">Failed to load.</p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary hover:underline"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : loading ? (
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-2/3 bg-surface-muted" />
            <Skeleton className="h-4 w-1/2 bg-surface-muted" />
            <Skeleton className="h-16 w-full bg-surface-muted" />
          </div>
        ) : isEmpty ? (
          <EmptyState
            className="m-3 min-h-0 flex-1 !border-0 !bg-transparent !shadow-none"
            icon={emptyIcon}
            title={emptyTitle ?? 'Nothing here yet'}
            description={emptyDescription}
          />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

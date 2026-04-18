import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('surface-panel flex min-h-[220px] flex-col items-center justify-center rounded-xl px-6 py-10 text-center', className)}>
      {icon ? <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-text-tertiary">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-text-secondary">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

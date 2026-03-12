import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
  titleClassName?: string;
}

export function PageHeader({ eyebrow, title, description, actions, meta, className, titleClassName }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="min-w-0 space-y-2">
        {eyebrow ? <div className="app-eyebrow">{eyebrow}</div> : null}
        <div className="flex flex-wrap items-center gap-2">
          <h1 className={cn('app-display text-[1.625rem] font-semibold tracking-[-0.02em] text-text-primary', titleClassName)}>{title}</h1>
          {meta}
        </div>
        {description ? <p className="max-w-3xl text-sm text-text-secondary md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

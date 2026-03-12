import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function TableShell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('surface-panel overflow-hidden rounded-xl', className)} {...props} />;
}

export function TableShellHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-border px-5 py-4', className)} {...props} />;
}

export function TableShellBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('divide-y divide-border', className)} {...props} />;
}

export function TableShellFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-t border-border px-5 py-4', className)} {...props} />;
}

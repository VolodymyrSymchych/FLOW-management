import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function FilterChip({ className, active = false, type = 'button', ...props }: FilterChipProps) {
  return (
    <button
      type={type}
      className={cn(
        'rounded-full border px-[13px] py-[5px] text-[0.8125rem] font-medium transition-colors',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-surface text-text-secondary hover:border-input hover:text-text-primary',
        className
      )}
      {...props}
    />
  );
}

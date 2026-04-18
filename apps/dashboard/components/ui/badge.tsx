import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-[6px] border px-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.08em]',
  {
    variants: {
      variant: {
        soft: '',
        solid: 'text-white',
        outline: 'bg-transparent',
      },
      tone: {
        neutral: '',
        primary: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
      },
    },
    compoundVariants: [
      { variant: 'soft', tone: 'neutral', className: 'border-border bg-surface-muted text-text-secondary' },
      { variant: 'soft', tone: 'primary', className: 'border-accent/20 bg-accent-soft text-primary' },
      { variant: 'soft', tone: 'success', className: 'border-success/20 bg-success-soft text-success' },
      { variant: 'soft', tone: 'warning', className: 'border-warning/20 bg-warning-soft text-warning' },
      { variant: 'soft', tone: 'danger', className: 'border-danger/20 bg-danger-soft text-danger' },
      { variant: 'soft', tone: 'info', className: 'border-info/20 bg-info-soft text-info' },
      { variant: 'solid', tone: 'neutral', className: 'border-foreground bg-foreground text-background' },
      { variant: 'solid', tone: 'primary', className: 'border-primary-dark bg-primary' },
      { variant: 'solid', tone: 'success', className: 'border-success bg-success' },
      { variant: 'solid', tone: 'warning', className: 'border-warning bg-warning text-background' },
      { variant: 'solid', tone: 'danger', className: 'border-danger bg-danger' },
      { variant: 'solid', tone: 'info', className: 'border-info bg-info' },
      { variant: 'outline', tone: 'neutral', className: 'border-border text-text-secondary' },
      { variant: 'outline', tone: 'primary', className: 'border-accent/30 text-primary' },
      { variant: 'outline', tone: 'success', className: 'border-success/30 text-success' },
      { variant: 'outline', tone: 'warning', className: 'border-warning/30 text-warning' },
      { variant: 'outline', tone: 'danger', className: 'border-danger/30 text-danger' },
      { variant: 'outline', tone: 'info', className: 'border-info/30 text-info' },
    ],
    defaultVariants: {
      variant: 'soft',
      tone: 'neutral',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, Omit<VariantProps<typeof badgeVariants>, 'variant'> {
  variant?: VariantProps<typeof badgeVariants>['variant'] | 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
}

function resolveLegacyBadgeVariant(variant: BadgeProps['variant']): VariantProps<typeof badgeVariants> {
  switch (variant) {
    case 'primary':
      return { variant: 'soft', tone: 'primary' };
    case 'secondary':
      return { variant: 'soft', tone: 'neutral' };
    case 'danger':
      return { variant: 'soft', tone: 'danger' };
    case 'success':
      return { variant: 'soft', tone: 'success' };
    case 'outline':
      return { variant: 'outline', tone: 'neutral' };
    default:
      return { variant: variant as VariantProps<typeof badgeVariants>['variant'] };
  }
}

function Badge({ className, variant = 'soft', tone = 'neutral', ...props }: BadgeProps) {
  const resolved = resolveLegacyBadgeVariant(variant);
  return <div className={cn(badgeVariants({ variant: resolved.variant ?? 'soft', tone: resolved.tone ?? tone }), className)} {...props} />;
}

export { Badge, badgeVariants };

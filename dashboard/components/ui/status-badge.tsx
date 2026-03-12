import { Badge, type BadgeProps } from './badge';

const toneMap = {
  todo: 'neutral',
  in_progress: 'info',
  done: 'success',
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
  completed: 'success',
  active: 'info',
  draft: 'neutral',
  pending: 'warning',
  paid: 'success',
  overdue: 'danger',
} as const;

export interface StatusBadgeProps extends Omit<BadgeProps, 'tone'> {
  status: string;
}

export function StatusBadge({ status, children, variant = 'soft', ...props }: StatusBadgeProps) {
  const tone = toneMap[status.toLowerCase() as keyof typeof toneMap] ?? 'neutral';
  return (
    <Badge variant={variant} tone={tone} {...props}>
      {children ?? status.replace(/_/g, ' ')}
    </Badge>
  );
}

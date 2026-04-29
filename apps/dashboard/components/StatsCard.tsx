import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const accentMap: Record<string, string> = {
  'bg-red-500': 'bg-danger text-white',
  'bg-orange-500': 'bg-warning text-background',
  'bg-blue-500': 'bg-info text-white',
  'bg-yellow-500': 'bg-warning text-background',
  'bg-green-500': 'bg-success text-white',
};

const progressMap: Record<string, string> = {
  'bg-red-500': 'bg-danger',
  'bg-orange-500': 'bg-warning',
  'bg-blue-500': 'bg-info',
  'bg-yellow-500': 'bg-warning',
  'bg-green-500': 'bg-success',
};

export function StatsCard({ title, value, icon: Icon, iconBgColor = 'bg-blue-500', trend }: StatsCardProps) {
  const accentClass = accentMap[iconBgColor] ?? 'bg-primary text-white';
  const progressClass = progressMap[iconBgColor] ?? 'bg-primary';
  const numericValue = typeof value === 'number' ? Math.max(10, Math.min(value, 100)) : 60;

  return (
    <Card surface="panel" density="md" className="flex h-full flex-col justify-between gap-4 border border-border/70">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="app-label text-text-tertiary">{title}</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-semibold text-text-primary tabular-nums tracking-tight">{value}</h3>
            {trend ? (
              <Badge tone={trend.isPositive ? 'success' : 'danger'} variant="soft" className="gap-1 px-2 py-1 normal-case tracking-normal">
                {trend.isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-text-secondary">Updated from the latest portfolio snapshot.</p>
        </div>
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', accentClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="h-2 rounded-full bg-surface-muted">
          <div className={cn('h-full rounded-full transition-all duration-300', progressClass)} style={{ width: `${numericValue}%` }} />
        </div>
        <p className="text-xs text-text-tertiary">Portfolio indicator based on current project mix.</p>
      </div>
    </Card>
  );
}

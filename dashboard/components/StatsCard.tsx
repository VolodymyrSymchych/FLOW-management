import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon: Icon, iconBgColor, trend }: StatsCardProps) {
  return (
    <div className="glass-medium glass-hover rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-tertiary mb-2 flex items-center space-x-2">
            <span className={cn('w-2 h-2 rounded-full ', iconBgColor)}></span>
            <span>{title}</span>
          </p>
          <h3 className="text-3xl font-bold text-text-primary">
            {value}
          </h3>
          {trend && (
            <p className={cn(
              'text-xs mt-1.5',
              trend.isPositive ? 'text-success' : 'text-danger'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className={cn('p-2.5 rounded-xl glass-light ', iconBgColor)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="mt-3 h-1.5 glass-subtle rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full ', iconBgColor)}
          style={{ width: typeof value === 'number' ? `${value}%` : '60%' }}
        ></div>
      </div>
    </div>
  );
}

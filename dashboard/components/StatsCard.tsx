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
    <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center space-x-2">
            <span className={cn('w-2 h-2 rounded-full', iconBgColor)}></span>
            <span>{title}</span>
          </p>
          <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </h3>
          {trend && (
            <p className={cn(
              'text-sm mt-2',
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', iconBgColor)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-4 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full', iconBgColor)}
          style={{ width: typeof value === 'number' ? `${value}%` : '60%' }}
        ></div>
      </div>
    </div>
  );
}

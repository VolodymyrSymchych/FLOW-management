import { Edit3, Camera, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressItem {
  icon: React.ElementType;
  name: string;
  level: string;
  progress: number;
  color: string;
}

const progressItems: ProgressItem[] = [
  {
    icon: Edit3,
    name: 'UI/UX Design',
    level: 'Advanced',
    progress: 85,
    color: 'bg-blue-500'
  },
  {
    icon: Camera,
    name: 'Photography',
    level: 'Intermediate',
    progress: 60,
    color: 'bg-blue-500'
  },
  {
    icon: Zap,
    name: 'Animation',
    level: 'Advance',
    progress: 75,
    color: 'bg-blue-500'
  }
];

export function ProgressSection() {
  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        Progress
      </h3>
      <div className="space-y-4">
        {progressItems.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', `${item.color} bg-opacity-10`)}>
              <item.icon className={cn('w-5 h-5', item.color.replace('bg-', 'text-'))} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.level}
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', item.color)}
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

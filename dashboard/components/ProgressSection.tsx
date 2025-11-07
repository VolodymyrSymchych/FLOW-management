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
    <div className="glass-medium rounded-2xl p-6">
      <h3 className="text-lg font-bold text-text-primary mb-4">
        Progress
      </h3>
      <div className="space-y-4">
        {progressItems.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl glass-light flex items-center justify-center shadow-[0_0_15px_rgba(128,152,249,0.4)]">
              <item.icon className="w-5 h-5 text-[#8098F9]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-text-primary">
                  {item.name}
                </span>
                <span className="text-xs text-text-tertiary">
                  {item.level}
                </span>
              </div>
              <div className="h-2 glass-subtle rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#8098F9] shadow-[0_0_10px_rgba(128,152,249,0.5)]"
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

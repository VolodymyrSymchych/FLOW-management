import { MessageSquare, Package } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Task {
  icon: React.ElementType;
  title: string;
  date: string;
  time: string;
  color: string;
}

const tasks: Task[] = [
  {
    icon: MessageSquare,
    title: 'UI/UX - Discussion',
    date: '27 Oct 2020',
    time: 'Tuesday',
    color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
  },
  {
    icon: Package,
    title: 'Animation - 3D Animation',
    date: '27 Oct 2020',
    time: 'Tuesday',
    color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
  }
];

export function UpcomingTasks() {
  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
        Upcoming Task
      </h3>
      <div className="space-y-3">
        {tasks.map((task, idx) => (
          <div key={idx} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${task.color}`}>
              <task.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {task.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {task.date}, {task.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

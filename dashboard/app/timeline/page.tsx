'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { GanttChartView } from '@/components/GanttChartView';

interface TimelineEvent {
  id: number;
  type: 'task' | 'project' | 'milestone';
  title: string;
  start_date: string;
  end_date?: string;
  status: 'planned' | 'in_progress' | 'completed';
  project: string;
  assignee: string;
}

export default function TimelinePage() {
  const [view, setView] = useState<'gantt' | 'activity'>('gantt');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const events: TimelineEvent[] = [
    {
      id: 1,
      type: 'project',
      title: 'Mobile Banking App',
      start_date: '2024-11-01',
      end_date: '2024-12-31',
      status: 'in_progress',
      project: 'Mobile Banking App',
      assignee: 'Team A'
    },
    {
      id: 2,
      type: 'task',
      title: 'Design UI mockups',
      start_date: '2024-11-05',
      end_date: '2024-11-20',
      status: 'completed',
      project: 'Mobile Banking App',
      assignee: 'AR'
    },
    {
      id: 3,
      type: 'task',
      title: 'Implement authentication',
      start_date: '2024-11-15',
      end_date: '2024-12-10',
      status: 'in_progress',
      project: 'Mobile Banking App',
      assignee: 'JD'
    },
    {
      id: 4,
      type: 'milestone',
      title: 'Beta Release',
      start_date: '2024-12-15',
      status: 'planned',
      project: 'Mobile Banking App',
      assignee: 'Team A'
    },
    {
      id: 5,
      type: 'project',
      title: 'E-commerce Platform',
      start_date: '2024-10-15',
      end_date: '2024-12-20',
      status: 'in_progress',
      project: 'E-commerce Platform',
      assignee: 'Team B'
    },
    {
      id: 6,
      type: 'task',
      title: 'API Development',
      start_date: '2024-11-01',
      end_date: '2024-11-30',
      status: 'in_progress',
      project: 'E-commerce Platform',
      assignee: 'SK'
    },
  ];

  const activityEvents = [
    { id: 1, type: 'task_created', title: 'Design new dashboard layout created', user: 'AR', time: '2 hours ago', project: 'Mobile Banking App' },
    { id: 2, type: 'status_changed', title: 'Write API documentation marked as done', user: 'SK', time: '4 hours ago', project: 'E-commerce Platform' },
    { id: 3, type: 'task_assigned', title: 'Implement authentication assigned to JD', user: 'AR', time: '6 hours ago', project: 'Mobile Banking App' },
    { id: 4, type: 'comment', title: 'AR commented on Database optimization', user: 'AR', time: '1 day ago', project: 'E-commerce Platform' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'planned': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return '📁';
      case 'task': return '✓';
      case 'milestone': return '🎯';
      default: return '•';
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Timeline</h1>
          <p className="text-text-secondary mt-1">
            Track project schedules and activity history
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView('gantt')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              view === 'gantt'
                ? 'bg-primary text-white shadow-[0_0_15px_rgba(128,152,249,0.5)]'
                : 'glass-light text-text-secondary hover:glass-medium hover:text-text-primary'
            }`}
          >
            Gantt Chart
          </button>
          <button
            onClick={() => setView('activity')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              view === 'activity'
                ? 'bg-primary text-white shadow-[0_0_15px_rgba(128,152,249,0.5)]'
                : 'glass-light text-text-secondary hover:glass-medium hover:text-text-primary'
            }`}
          >
            Activity Log
          </button>
        </div>
      </div>

      {view === 'gantt' ? (
        <GanttChartView />
      ) : (
        /* Activity Log View */
        <div className="glass-medium rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {activityEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-4 p-4 rounded-lg glass-light hover:glass-medium transition-all duration-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-[0_0_15px_rgba(128,152,249,0.4)]">
                  {event.user}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-text-primary font-medium">{event.title}</p>
                      <p className="text-sm text-text-tertiary mt-1">
                        {event.project} • {event.time}
                      </p>
                    </div>
                    <Clock className="w-4 h-4 text-text-tertiary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

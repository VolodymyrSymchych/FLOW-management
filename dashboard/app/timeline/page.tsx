'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="space-y-6">
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
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'gantt'
                ? 'bg-primary text-white'
                : 'bg-surface dark:bg-surface-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            Gantt Chart
          </button>
          <button
            onClick={() => setView('activity')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'activity'
                ? 'bg-primary text-white'
                : 'bg-surface dark:bg-surface-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            Activity Log
          </button>
        </div>
      </div>

      {view === 'gantt' ? (
        /* Gantt Chart View */
        <div className="bg-surface dark:bg-surface-elevated rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-background dark:hover:bg-surface rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-text-secondary" />
              </button>
              <h3 className="text-lg font-semibold text-text-primary">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button className="p-2 hover:bg-background dark:hover:bg-surface rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-text-tertiary">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded bg-gray-400"></div>
                <span>Planned</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center space-x-4">
                <div className="w-64 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getTypeIcon(event.type)}</span>
                    <div>
                      <h4 className="font-medium text-text-primary text-sm">{event.title}</h4>
                      <p className="text-xs text-text-tertiary">{event.assignee}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative h-12 bg-background dark:bg-surface rounded-lg overflow-hidden">
                  <div
                    className={`absolute top-1 bottom-1 ${getStatusColor(event.status)} rounded opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                    style={{
                      left: '10%',
                      width: event.end_date ? '40%' : '3px',
                    }}
                    title={`${event.start_date}${event.end_date ? ` - ${event.end_date}` : ''}`}
                  >
                    <div className="px-2 py-1 text-xs text-white font-medium truncate">
                      {event.type === 'milestone' ? '◆' : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Activity Log View */
        <div className="bg-surface dark:bg-surface-elevated rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {activityEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-background dark:hover:bg-surface transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold flex-shrink-0">
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

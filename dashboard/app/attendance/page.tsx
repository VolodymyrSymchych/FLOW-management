'use client';

import { useState } from 'react';
import { Clock, Calendar, Play, Square, Download } from 'lucide-react';

interface TimeEntry {
  id: number;
  user: string;
  task: string;
  project: string;
  clock_in: string;
  clock_out?: string;
  duration: number; // in minutes
  date: string;
}

export default function AttendancePage() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentSession, setCurrentSession] = useState<Date | null>(null);

  const timeEntries: TimeEntry[] = [
    {
      id: 1,
      user: 'AR',
      task: 'Design UI mockups',
      project: 'Mobile Banking App',
      clock_in: '2024-11-07T09:00:00Z',
      clock_out: '2024-11-07T12:30:00Z',
      duration: 210,
      date: '2024-11-07'
    },
    {
      id: 2,
      user: 'AR',
      task: 'Code review',
      project: 'Mobile Banking App',
      clock_in: '2024-11-07T13:30:00Z',
      clock_out: '2024-11-07T16:00:00Z',
      duration: 150,
      date: '2024-11-07'
    },
    {
      id: 3,
      user: 'JD',
      task: 'API Development',
      project: 'E-commerce Platform',
      clock_in: '2024-11-07T08:00:00Z',
      clock_out: '2024-11-07T17:00:00Z',
      duration: 540,
      date: '2024-11-07'
    },
    {
      id: 4,
      user: 'SK',
      task: 'Write documentation',
      project: 'E-commerce Platform',
      clock_in: '2024-11-07T10:00:00Z',
      clock_out: '2024-11-07T14:00:00Z',
      duration: 240,
      date: '2024-11-07'
    },
  ];

  const handleClockInOut = () => {
    if (isClockedIn) {
      // Clock out
      setIsClockedIn(false);
      setCurrentSession(null);
      // In real app, save time entry
    } else {
      // Clock in
      setIsClockedIn(true);
      setCurrentSession(new Date());
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalHoursToday = timeEntries
    .filter(e => e.date === '2024-11-07' && e.user === 'AR')
    .reduce((sum, e) => sum + e.duration, 0);

  const totalHoursWeek = timeEntries
    .filter(e => e.user === 'AR')
    .reduce((sum, e) => sum + e.duration, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Attendance</h1>
          <p className="text-text-secondary mt-1">
            Track your working hours and time logs
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 glass-light hover:glass-medium rounded-lg transition-all">
          <Download className="w-5 h-5 text-text-secondary" />
          <span className="text-text-primary">Export Report</span>
        </button>
      </div>

      {/* Clock In/Out Section */}
      <div className="glass-medium rounded-2xl p-8 border border-[#FF6B4A]/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              {isClockedIn ? 'Currently Working' : 'Ready to Start?'}
            </h3>
            <p className="text-text-secondary">
              {isClockedIn
                ? `Started at ${currentSession?.toLocaleTimeString()}`
                : 'Click below to clock in'}
            </p>
          </div>
          <button
            onClick={handleClockInOut}
            className={`flex items-center space-x-3 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all hover:scale-105 ${
              isClockedIn
                ? 'bg-red-500/80 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'bg-[#00D66B]/80 hover:bg-[#00D66B] shadow-[0_0_20px_rgba(0,214,107,0.4)]'
            }`}
          >
            {isClockedIn ? (
              <>
                <Square className="w-6 h-6" />
                <span>Clock Out</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                <span>Clock In</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-medium glass-hover rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-xl glass-light flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>
            <div>
              <p className="text-sm text-text-tertiary">Today</p>
              <p className="text-2xl font-bold text-text-primary">{formatDuration(totalHoursToday)}</p>
            </div>
          </div>
        </div>

        <div className="glass-medium glass-hover rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-xl glass-light flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#00D66B] drop-shadow-[0_0_8px_rgba(0,214,107,0.5)]" />
            </div>
            <div>
              <p className="text-sm text-text-tertiary">This Week</p>
              <p className="text-2xl font-bold text-text-primary">{formatDuration(totalHoursWeek)}</p>
            </div>
          </div>
        </div>

        <div className="glass-medium glass-hover rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-xl glass-light flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </div>
            <div>
              <p className="text-sm text-text-tertiary">This Month</p>
              <p className="text-2xl font-bold text-text-primary">{formatDuration(totalHoursWeek * 4)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setView('daily')}
          className={`px-4 py-2 rounded-lg transition-all ${
            view === 'daily'
              ? 'glass-button text-white'
              : 'glass-light text-text-secondary hover:glass-medium hover:text-text-primary'
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setView('weekly')}
          className={`px-4 py-2 rounded-lg transition-all ${
            view === 'weekly'
              ? 'glass-button text-white'
              : 'glass-light text-text-secondary hover:glass-medium hover:text-text-primary'
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setView('monthly')}
          className={`px-4 py-2 rounded-lg transition-all ${
            view === 'monthly'
              ? 'glass-button text-white'
              : 'glass-light text-text-secondary hover:glass-medium hover:text-text-primary'
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Time Entries */}
      <div className="glass-medium rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-text-primary">Time Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="glass-subtle">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Clock In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Clock Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {timeEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                      {entry.user}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text-primary">{entry.task}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text-secondary">{entry.project}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-primary">{formatTime(entry.clock_in)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-primary">
                      {entry.clock_out ? formatTime(entry.clock_out) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {formatDuration(entry.duration)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { useTeam } from '@/contexts/TeamContext';

interface Task {
  id: number;
  title: string;
  dueDate?: string | null;
  due_date?: string | null;
  startDate?: string | null;
  start_date?: string | null;
  endDate?: string | null;
  end_date?: string | null;
  assignee?: string | null;
  priority?: string;
  status?: string;
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

interface CalendarViewProps {
  refreshKey?: number;
}

export function CalendarView({ refreshKey = 0 }: CalendarViewProps) {
  const { selectedTeam, isLoading: teamsLoading } = useTeam();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'1week' | '2weeks' | '1month'>('1week');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  // Single consolidated useEffect for loading tasks
  useEffect(() => {
    // Wait for teams to load before loading tasks
    if (!teamsLoading) {
      loadTasks();
    }
  }, [teamsLoading, selectedTeam, viewMode, refreshKey]);

  const loadTasks = async () => {
    // Don't load if teams are still loading
    if (teamsLoading) {
      return;
    }

    setLoading(true);
    try {
      // Build query params for team filtering
      const teamId = selectedTeam.type === 'single' && selectedTeam.teamId
        ? selectedTeam.teamId
        : 'all';
      const url = teamId !== 'all'
        ? `/api/tasks?team_id=${teamId}`
        : '/api/tasks';

      const response = await axios.get(url);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInView = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate: Date;
    let endDate: Date;

    if (viewMode === '1week') {
      // Start from Monday of current week
      const dayOfWeek = currentDate.getDay();
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      startDate = monday;
      endDate = new Date(monday);
      endDate.setDate(monday.getDate() + 6);
    } else if (viewMode === '2weeks') {
      const dayOfWeek = currentDate.getDay();
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      startDate = monday;
      endDate = new Date(monday);
      endDate.setDate(monday.getDate() + 13);
    } else {
      // 1 month - start from Monday of the week containing the 1st
      const firstDay = new Date(year, month, 1);
      const dayOfWeek = firstDay.getDay();
      const monday = new Date(firstDay);
      monday.setDate(firstDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const lastDay = new Date(year, month + 1, 0);
      const lastDayOfWeek = lastDay.getDay();
      const sunday = new Date(lastDay);
      sunday.setDate(lastDay.getDate() + (lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek));
      sunday.setHours(0, 0, 0, 0);

      startDate = monday;
      endDate = sunday;
    }

    const days: CalendarDay[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayTasks = tasks.filter(task => {
        const taskStartDate = task.startDate || task.start_date;
        const taskDueDate = task.dueDate || task.due_date;
        const taskEndDate = task.endDate || task.end_date;

        // If task has start_date and end_date, check if current date is within range
        if (taskStartDate && taskEndDate) {
          const startStr = new Date(taskStartDate).toISOString().split('T')[0];
          const endStr = new Date(taskEndDate).toISOString().split('T')[0];
          return dateStr >= startStr && dateStr <= endStr;
        }

        // If task has only due_date, check if it matches
        if (taskDueDate) {
          const taskDateStr = new Date(taskDueDate).toISOString().split('T')[0];
          return taskDateStr === dateStr;
        }

        return false;
      });

      days.push({
        date: new Date(current),
        dayOfMonth: current.getDate(),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.getTime() === today.getTime(),
        tasks: dayTasks,
      });

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === '1week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === '2weeks') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 14 : -14));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const days = getDaysInView();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Show loading state while teams are loading or tasks are loading
  if (teamsLoading || loading) {
    return (
      <div className="glass-medium rounded-2xl p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Calendar</h3>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-medium rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold text-text-primary">
            {formatMonthYear()}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1 glass-subtle hover:glass-light rounded transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-text-tertiary transition-transform duration-200 hover:-translate-x-0.5" />
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-1 glass-subtle hover:glass-light rounded transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-4 h-4 text-text-tertiary transition-transform duration-200 hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-xs glass-subtle hover:glass-light rounded transition-all duration-200 text-text-secondary hover:text-text-primary"
            >
              Today
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">Show:</span>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as '1week' | '2weeks' | '1month')}
            className="text-sm glass-input border-0 text-text-primary focus:outline-none rounded px-2 py-1 cursor-pointer"
          >
            <option value="1week">1 Week</option>
            <option value="2weeks">2 Weeks</option>
            <option value="1month">1 Month</option>
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-text-tertiary pb-2">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, idx) => {
          const isSelected = selectedDate ? day.date.getTime() === selectedDate.getTime() : false;
          const dateId = `date-${day.date.toISOString().split('T')[0]}`;

          return (
            <DroppableDay
              key={idx}
              dateId={dateId}
              day={day}
              isSelected={isSelected}
              onDateClick={handleDateClick}
            />
          );
        })}
      </div>

      {/* Selected date info */}
      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <CalendarIcon className="w-4 h-4" />
            <span>
              Selected: {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

interface DroppableDayProps {
  dateId: string;
  day: CalendarDay;
  isSelected: boolean;
  onDateClick: (date: Date) => void;
}

function DroppableDay({ dateId, day, isSelected, onDateClick }: DroppableDayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dateId,
  });

  return (
    <div
      ref={setNodeRef}
      onClick={() => onDateClick(day.date)}
      className={cn(
        'min-h-[120px] p-2 rounded-lg border-2 transition-all cursor-pointer',
        day.isToday
          ? 'border-primary bg-primary/10'
          : isSelected
            ? 'border-primary/50 bg-primary/5'
            : isOver
              ? 'border-success/50 bg-success/10 border-dashed'
              : 'border-transparent hover:border-white/10 hover:bg-white/5',
        !day.isCurrentMonth && 'opacity-40'
      )}
    >
      <div
        className={cn(
          'text-xs mb-2 font-semibold',
          day.isToday
            ? 'text-primary'
            : day.isCurrentMonth
              ? 'text-text-primary'
              : 'text-text-tertiary'
        )}
      >
        {day.dayOfMonth}
      </div>
      <div className="space-y-1">
        {day.tasks.slice(0, 3).map((task) => {
          const priorityColor =
            task.priority === 'high'
              ? 'bg-danger/20 text-danger/80 border-danger/30'
              : task.priority === 'low'
                ? 'bg-primary/20 text-primary/80 border-primary/30'
                : 'bg-surface-elevated/50 text-text-tertiary border-white/10';

          return (
            <div
              key={task.id}
              className={cn(
                'p-1.5 rounded text-xs border glass-light truncate',
                priorityColor
              )}
              title={task.title}
            >
              <div className="font-medium truncate">{task.title}</div>
              {task.assignee && (
                <div className="text-[10px] opacity-75 mt-0.5">
                  {task.assignee}
                </div>
              )}
            </div>
          );
        })}
        {day.tasks.length > 3 && (
          <div className="text-[10px] text-text-tertiary text-center pt-1">
            +{day.tasks.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

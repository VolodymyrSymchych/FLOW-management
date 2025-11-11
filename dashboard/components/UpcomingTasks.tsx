'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Package, Edit, Clock, Play, Square } from 'lucide-react';
import axios from 'axios';
import { EditTaskModal } from './EditTaskModal';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface Task {
  id: number;
  title: string;
  description: string | null;
  start_date?: string | null;
  due_date: string | null;
  end_date?: string | null;
  status: string;
  priority: string;
  assignee: string | null;
  project_id: number | null;
}

interface TimeEntry {
  id: number;
  taskId: number | null;
  clockIn: string;
  clockOut: string | null;
}

export function UpcomingTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('');
  const [runningTask, setRunningTask] = useState<Task | null>(null);

  const loadTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      const allTasks = response.data.tasks || [];
      // Filter for upcoming tasks (not done, sorted by due date)
      const upcomingTasks = allTasks
        .filter((task: Task) => task.status !== 'done' && task.status !== 'Done')
        .sort((a: Task, b: Task) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        })
        .slice(0, 5); // Show only first 5 upcoming tasks
      setTasks(upcomingTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkActiveSession = async () => {
    try {
      const response = await axios.get('/api/attendance');
      const entries = response.data.entries || [];
      const activeEntry = entries.find((e: TimeEntry) => !e.clockOut);
      if (activeEntry) {
        setActiveTimeEntry(activeEntry);
        updateElapsedTime(activeEntry);
      } else {
        setActiveTimeEntry(null);
      }
    } catch (error) {
      console.error('Failed to check active session:', error);
    }
  };

  const updateElapsedTime = (entry?: TimeEntry) => {
    const activeEntry = entry || activeTimeEntry;
    if (!activeEntry) return;

    const startTime = new Date(activeEntry.clockIn).getTime();
    const now = new Date().getTime();
    const diff = now - startTime;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const getRunningTask = async () => {
    if (!activeTimeEntry || !activeTimeEntry.taskId) return null;
    
    // First check if task is in current list
    let task = tasks.find(t => t.id === activeTimeEntry.taskId);
    
    // If not found, fetch it
    if (!task) {
      try {
        const response = await axios.get(`/api/tasks/${activeTimeEntry.taskId}`);
        task = response.data.task;
      } catch (error) {
        console.error('Failed to load running task:', error);
      }
    }
    
    return task;
  };

  useEffect(() => {
    loadTasks();
    checkActiveSession();
  }, []);

  useEffect(() => {
    // Update elapsed time every second when there's an active entry
    if (!activeTimeEntry) {
      setElapsedTime('');
      return;
    }

    updateElapsedTime();
    const interval = setInterval(() => {
      updateElapsedTime();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimeEntry]);

  useEffect(() => {
    const loadRunningTask = async () => {
      if (activeTimeEntry?.taskId) {
        const task = await getRunningTask();
        setRunningTask(task || null);
      } else {
        setRunningTask(null);
      }
    };
    loadRunningTask();
  }, [activeTimeEntry, tasks]);

  const handleStartAttendance = async (taskId: number) => {
    if (activeTimeEntry) {
      alert('Please stop the current time tracking before starting a new one.');
      return;
    }

    try {
      const task = tasks.find(t => t.id === taskId);
      await axios.post('/api/attendance', {
        task_id: taskId,
        project_id: task?.project_id || null,
        clock_in: new Date().toISOString(),
      });
      await checkActiveSession();
      await loadTasks();
    } catch (error) {
      console.error('Failed to start attendance:', error);
      alert('Failed to start time tracking. Please try again.');
    }
  };

  const handleStopAttendance = async () => {
    if (!activeTimeEntry) return;

    try {
      await axios.put('/api/attendance', {
        clock_out: new Date().toISOString(),
      });
      setActiveTimeEntry(null);
      setElapsedTime('');
      await loadTasks();
    } catch (error) {
      console.error('Failed to stop attendance:', error);
      alert('Failed to stop time tracking. Please try again.');
    }
  };

  const getTaskIcon = (index: number) => {
    const icons = [MessageSquare, Package];
    return icons[index % icons.length];
  };

  const getTaskColor = (index: number) => {
    const colors = [
      'glass-light text-primary',
      'glass-light text-secondary',
      'glass-light text-primary',
      'glass-light text-success',
      'glass-light text-warning',
    ];
    return colors[index % colors.length];
  };

  const displayTasks = runningTask 
    ? [runningTask, ...tasks.filter(t => t.id !== runningTask.id)].slice(0, 5)
    : tasks;

  if (loading) {
    return (
      <div className="glass-medium rounded-2xl p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">
          Upcoming Tasks
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-medium rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">
            Upcoming Tasks
          </h3>
          {activeTimeEntry && (
            <div className="flex items-center space-x-2 text-xs text-text-tertiary">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <span>Tracking time</span>
            </div>
          )}
        </div>
        <p className="text-xs text-text-tertiary mb-4">
          Track time spent on tasks to measure productivity
        </p>
        <div className="space-y-3">
          {displayTasks.length > 0 ? (
            displayTasks.map((task, idx) => {
              const Icon = getTaskIcon(idx);
              const color = getTaskColor(idx);
              const dueDate = task.due_date ? new Date(task.due_date) : null;
              const isRunning = activeTimeEntry?.taskId === task.id;
              
              return (
                <DraggableTask
                  key={task.id}
                  task={task}
                  isRunning={isRunning}
                  elapsedTime={elapsedTime}
                  activeTimeEntry={activeTimeEntry}
                  onEdit={() => !isRunning && setEditingTask(task)}
                  onStartAttendance={handleStartAttendance}
                  onStopAttendance={handleStopAttendance}
                  getTaskIcon={getTaskIcon}
                  getTaskColor={getTaskColor}
                  idx={idx}
                />
              );
            })
          ) : (
            <div className="text-center py-8 text-text-tertiary">
              No upcoming tasks
            </div>
          )}
        </div>
        {activeTimeEntry && !runningTask && (
          <div className="mt-4 p-3 rounded-lg glass-subtle border border-warning/30">
            <p className="text-xs text-warning">
              ⚠️ Time tracking is active but the task is not in the list
            </p>
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask ? {
          id: editingTask.id,
          title: editingTask.title,
          description: editingTask.description,
          project_id: editingTask.project_id,
          assignee: editingTask.assignee,
          due_date: editingTask.due_date,
          priority: (editingTask.priority === 'low' || editingTask.priority === 'medium' || editingTask.priority === 'high') 
            ? editingTask.priority 
            : 'medium',
          status: (editingTask.status === 'todo' || editingTask.status === 'in_progress' || editingTask.status === 'done')
            ? editingTask.status
            : 'todo',
        } : null}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={() => {
          loadTasks();
          checkActiveSession();
          setEditingTask(null);
        }}
      />
    </>
  );
}

interface DraggableTaskProps {
  task: Task;
  isRunning: boolean;
  elapsedTime: string;
  activeTimeEntry: TimeEntry | null;
  onEdit: () => void;
  onStartAttendance: (taskId: number) => void;
  onStopAttendance: () => void;
  getTaskIcon: (index: number) => React.ElementType;
  getTaskColor: (index: number) => string;
  idx: number;
}

function DraggableTask({
  task,
  isRunning,
  elapsedTime,
  activeTimeEntry,
  onEdit,
  onStartAttendance,
  onStopAttendance,
  getTaskIcon,
  getTaskColor,
  idx,
}: DraggableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = getTaskIcon(idx);
  const color = getTaskColor(idx);
  const dueDate = task.due_date ? new Date(task.due_date) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] group ${
        isRunning 
          ? 'glass-light border border-success/30 ' 
          : 'glass-hover'
      } ${isDragging ? 'z-50 opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {/* Draggable area - main content */}
      <div
        {...listeners}
        {...attributes}
        className="flex-1 flex items-center space-x-3 min-w-0"
        onClick={(e) => {
          if (!isRunning && !(e.target as HTMLElement).closest('button')) {
            e.stopPropagation();
            onEdit();
          }
        }}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center  transition-transform duration-200 hover:scale-110 flex-shrink-0 ${
          isRunning ? 'bg-success/20 text-success' : color
        }`}>
          {isRunning ? (
            <Clock className="w-5 h-5 animate-pulse" />
          ) : (
            <Icon className="w-5 h-5 transition-transform duration-200" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text-primary truncate">
              {task.title}
            </h4>
            {isRunning && (
              <span className="ml-2 text-xs font-mono font-bold text-success flex-shrink-0">
                {elapsedTime}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-text-tertiary">
              {dueDate
                ? `${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'No due date'}
            </p>
            {isRunning && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onStopAttendance();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-danger/20 text-danger rounded-lg hover:bg-danger/30 transition-colors flex-shrink-0 pointer-events-auto"
              >
                <Square className="w-3 h-3" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Non-draggable buttons area */}
      <div className="flex items-center space-x-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {!isRunning && (
          <>
            {!activeTimeEntry && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onStartAttendance(task.id);
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 px-2 py-1 text-xs bg-success/20 text-success rounded-lg hover:bg-success/30 transition-all flex-shrink-0 pointer-events-auto"
                title="Start time tracking"
              >
                <Play className="w-3 h-3" />
                <span>Start</span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit();
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all pointer-events-auto"
              title="Edit task"
            >
              <Edit className="w-4 h-4 text-text-secondary hover:text-text-primary" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
